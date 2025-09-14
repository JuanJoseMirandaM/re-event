import boto3
import json
import os
import datetime
from decimal import Decimal
from concurrent.futures import ThreadPoolExecutor
import time

# Clientes globales (reutilización entre invocaciones)
rekognition_client = boto3.client('rekognition', region_name='us-east-1')
dynamo_resource = boto3.resource('dynamodb', region_name='us-east-1')
dynamo_table = dynamo_resource.Table(os.environ.get('DYNAMODB_TABLE'))
lambda_client = boto3.client('lambda', region_name='us-east-1')

def lambda_handler(event, context):
    print("=== SAVE & ANALYZE - SQS OPTIMIZED ===")
    print(f"Raw event: {json.dumps(event, indent=2)}")
    
    # Procesar mensajes SQS (no S3 directo)
    sqs_records = event.get('Records', [])
    print(f"📥 Received {len(sqs_records)} SQS messages")
    
    # Extraer información S3 de mensajes SQS
    s3_objects = []
    for i, sqs_record in enumerate(sqs_records):
        print(f"\n--- Processing SQS Message {i+1} ---")
        
        try:
            # Parsear mensaje SQS que contiene evento S3
            s3_event = json.loads(sqs_record['body'])
            
            for s3_record in s3_event.get('Records', []):
                s3_info = s3_record.get('s3', {})
                bucket = s3_info.get('bucket', {}).get('name')
                image_key = s3_info.get('object', {}).get('key')
                
                if bucket and image_key:
                    s3_objects.append({
                        'bucket': bucket,
                        'image_key': image_key,
                        'event_name': s3_record.get('eventName')
                    })
                    print(f"  ✅ Added: {image_key}")
                    
        except Exception as e:
            print(f"❌ Error parsing SQS message {i+1}: {e}")
    
    print(f"\n🎯 Total S3 objects to process: {len(s3_objects)}")
    
    if not s3_objects:
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'No objects to process'})
        }
    
    # Procesamiento paralelo controlado
    results = process_images_batch(s3_objects)
    
    success_count = len([r for r in results if r.get('status') == 'success'])
    error_count = len([r for r in results if r.get('status') == 'failed'])
    
    print(f"\n📊 Processing Summary: ✅ {success_count} | ❌ {error_count}")
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'processed': len(results),
            'successful': success_count,
            'failed': error_count,
            'results': results
        })
    }

def process_images_batch(s3_objects):
    results = []
    
    # Procesar máximo 3 imágenes en paralelo (evitar throttling)
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = []
        
        for i, s3_obj in enumerate(s3_objects):
            # Delay progresivo para evitar burst
            time.sleep(0.2 * i)
            future = executor.submit(process_single_image, s3_obj, i+1)
            futures.append(future)
        
        # Recoger resultados
        for future in futures:
            try:
                result = future.result(timeout=300)
                results.append(result)
            except Exception as e:
                print(f"❌ Task failed: {e}")
                results.append({'error': str(e), 'status': 'failed'})
    
    return results

def process_single_image(s3_obj, task_number):
    bucket = s3_obj['bucket']
    image_key = s3_obj['image_key']
    
    print(f"\n🖼️ [Task {task_number}] Processing: {image_key}")
    
    try:
        # Llamar a Rekognition con retry
        rekognition_response = index_face_from_s3(bucket, image_key, task_number)
        
        # Guardar en DynamoDB
        save_face_metadata(rekognition_response, task_number)
        
        # Invocar brand_and_publish directamente (asíncrono)
        invoke_brand_and_publish(bucket, image_key, rekognition_response, task_number)
        
        faces_count = len(rekognition_response.get('FaceRecords', []))
        print(f"   ✅ [Task {task_number}] SUCCESS: {faces_count} faces detected")
        
        return {
            'image_key': image_key,
            'faces_detected': faces_count,
            'status': 'success',
            'task_number': task_number
        }
        
    except Exception as e:
        print(f"   ❌ [Task {task_number}] Error: {e}")
        return {
            'image_key': image_key,
            'error': str(e),
            'status': 'failed',
            'task_number': task_number
        }

def index_face_from_s3(bucket, image_key, task_number):
    external_image_id = image_key.replace('/', '_')
    
    # Retry con backoff exponencial
    for attempt in range(3):
        try:
            response = rekognition_client.index_faces(
                CollectionId=os.environ.get('REKOGNITION_COLLECTION'),
                Image={"S3Object": {"Bucket": bucket, "Name": image_key}},
                ExternalImageId=external_image_id,
                DetectionAttributes=["DEFAULT"],
                MaxFaces=100,  # Reducido para eficiencia
                QualityFilter="AUTO"
            )
            
            if not response.get('FaceRecords'):
                raise ValueError(f"No faces detected in {image_key}")
            
            return response
            
        except rekognition_client.exceptions.ProvisionedThroughputExceededException:
            wait_time = (2 ** attempt) + (0.1 * attempt)
            print(f"   ⚠️ [Task {task_number}] Throttling, waiting {wait_time}s")
            time.sleep(wait_time)
        except Exception as e:
            if attempt == 2:
                raise e
            time.sleep(1)

def save_face_metadata(rekognition_response, task_number):
    for record in rekognition_response['FaceRecords']:
        face = record['Face']
        
        item = {
            'faceId': face['FaceId'],
            'imageId': face['ImageId'],
            'imageName': face.get('ExternalImageId', '').replace('_', '/'),
            'collectionId': os.environ.get('REKOGNITION_COLLECTION'),
            'confidence': Decimal(str(face.get('Confidence', 0))),
            'boundingBox': convert_dict_floats_to_decimal(face.get('BoundingBox', {})),
            'created_at': datetime.datetime.utcnow().isoformat()
        }
        
        dynamo_table.put_item(Item=item)

def invoke_brand_and_publish(bucket, image_key, rekognition_response, task_number):
    """Invocar brand_and_publish directamente (asíncrono)"""
    try:
        payload = {
            'responsePayload': {
                'body': json.dumps({
                    'image_key': image_key,
                    'bucket': bucket,
                    'collection_id': os.environ.get('REKOGNITION_COLLECTION'),
                    'rekognition_response': rekognition_response
                })
            }
        }
        
        # Invocación asíncrona
        lambda_client.invoke(
            FunctionName=os.environ.get('DESTINATION_LAMBDA'),
            InvocationType='Event',
            Payload=json.dumps(payload)
        )
        
        print(f"   ✅ [Task {task_number}] Invoked brand_and_publish")
        
    except Exception as e:
        print(f"   ⚠️ [Task {task_number}] Error invoking brand_and_publish: {e}")

def convert_dict_floats_to_decimal(d):
    return {k: Decimal(str(v)) if isinstance(v, float) else v for k, v in d.items()}