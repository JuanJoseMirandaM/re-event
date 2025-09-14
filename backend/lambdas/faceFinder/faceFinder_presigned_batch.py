import boto3
import json
import uuid
import os
import html

# Environment variables
BUCKET_NAME = os.environ.get('BUCKET_NAME')
REGION_NAME = os.environ.get('REGION_NAME', 'us-east-1')
FLOW_TYPE = os.environ.get('FLOW_TYPE', 'BATCH')

# Cliente S3 global
s3_client = boto3.client('s3', region_name=REGION_NAME)

def lambda_handler(event, context):
    print(f'=== PRESIGNED BATCH - {FLOW_TYPE} ===')
    print(f'Event: {json.dumps(event, indent=2)}')
    
    try:
        body = json.loads(event.get('body', '{}'))
        file_name = body.get('fileName')
        upload_type = body.get('type', 'to-rekognize')  # Default para Flujo A

        # Validar campos requeridos
        if not file_name:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'fileName is required'})
            }

        # Validar tipos para Flujo A
        valid_types = ['to-rekognize']
        if upload_type not in valid_types:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'Invalid type for batch. Must be: {valid_types}'})
            }

        # Validar extensiones
        allowed_extensions = ['.jpg', '.jpeg', '.png']
        if not any(file_name.lower().endswith(ext) for ext in allowed_extensions):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid file type'})
            }

        # Generar S3 key para /private/
        file_ext = os.path.splitext(file_name)[1].lower()
        folder_uuid = str(uuid.uuid4())
        s3_key = f"private/{folder_uuid}/fileName{file_ext}"

        # Determinar content type
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png'
        }
        content_type = content_types.get(file_ext, 'image/jpeg')

        # Generar presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': s3_key,
                'ContentType': content_type,
                'ServerSideEncryption': 'AES256',
                'Metadata': {
                    'upload-type': upload_type,
                    'original-filename': file_name,
                    'flow-type': FLOW_TYPE
                }
            },
            ExpiresIn=3600,  # 1 hora
            HttpMethod='PUT'
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'uploadUrl': presigned_url,
                's3Key': s3_key,
                'type': upload_type,
                'flowType': FLOW_TYPE
            })
        }

    except ValueError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid input parameters'})
        }
    except Exception as e:
        print(f"Internal error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }