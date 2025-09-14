import boto3
import os
import json
from decimal import Decimal

# Environment variables
REGION_NAME = 'us-east-1'
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE')
REKOGNITION_COLLECTION = os.environ.get('REKOGNITION_COLLECTION')
DESTINATION_LAMBDA = os.environ.get('DESTINATION_LAMBDA')
# EVENT_NAME = os.environ.get('EVENT_NAME')

# Service constants
REKOGNITION_SERVICE = 'rekognition'
DYNAMODB_SERVICE = 'dynamodb'


def lambda_handler(event, context):
    print(f"Full event: {event}")
    print(f"Event type: {type(event)}")

    body = json.loads(event.get('body', '{}'))
    data = body.get("data", {})
    bucket = data.get("bucket")
    key = data.get("key")
    collection_id = data.get("collection_id")

    print(f"Bucket: {bucket}, Key: {key}, Collection ID: {collection_id}")

    if not bucket or not key or not collection_id:
        return {
            'statusCode': 400,
            'body': {'error': 'Missing required parameters'}
        }

    result_search = search_faces(bucket, key, get_rekognition_client())
    data = query_faces_by_face(result_search, collection_id, get_dynamodb_client())

    print(f"Data: {data}")

    return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(data, default=decimal_default)
        }


def search_faces(bucket: str, image_key: str, rekognition_client):
    print("Searches for faces in an image stored in S3.")
    try:
        response = rekognition_client.search_faces_by_image(
            CollectionId=REKOGNITION_COLLECTION,
            Image={
                "S3Object": {
                    "Bucket": bucket,
                    "Name": image_key
                }
            }
            # FaceMatchThreshold=80.0,
            # MaxFaces=100
        )
        print(f"Search faces by image {response} successfully.")
        return response
    except Exception as e:
        print(f"Error searching faces by image: {e}")
        raise e


def search_faces_by_image_bytes(rekognition_client, image_bytes: bytes, collection_id: str, threshold: int = 90,
                                max_faces: int = 3):
    """
    Busca rostros en una colección de Rekognition usando una imagen en bytes.

    :param rekognition_client:
    :param image_bytes: Imagen en formato bytes (ej. con open('foto.jpg', 'rb'))
    :param collection_id: ID de la colección en Amazon Rekognition
    :param threshold: Umbral mínimo de similitud (default 90%)
    :param max_faces: Máximo número de coincidencias (default 3)
    :return: Lista de coincidencias (FaceId, Similarity)
    """

    try:
        response = rekognition_client.search_faces_by_image(
            CollectionId=collection_id,
            Image={'Bytes': image_bytes},
            FaceMatchThreshold=threshold,
            MaxFaces=max_faces
        )
        return response

        # results = []
        # for match in response.get('FaceMatches', []):
        #     face_id = match['Face']['FaceId']
        #     similarity = match['Similarity']
        #     results.append({'FaceId': face_id, 'Similarity': similarity})
        #
        # return results

    except Exception as e:
        print(f"❌ Error searching faces: {e}")
        return []


def query_faces_by_face(search_result, collection_id, dynamo_client):
    dynamo_table = dynamo_client.Table(DYNAMODB_TABLE)
    print(f"Searching in DynamoDB table {DYNAMODB_TABLE} for collection {collection_id}")
    result = []

    try:
        for record in search_result['FaceMatches']:
            face = record['Face']
            face_id = face['FaceId']
            print(f"FaceId: {face_id}")

            # Solo usar faceId como clave (Primary Key)
            response = dynamo_table.get_item(Key={'faceId': face_id})
            print(f"Response: {response}")

            if 'Item' in response:
                item = response['Item']

                if item.get('collectionId') == collection_id:
                    print(f"Item found: {item}")
                    result.append(item)
                else:
                    print(f"Item found but wrong collection: {item.get('collectionId')} != {collection_id}")
            else:
                print(f"No item found for FaceId: {face_id}")

        return result

    except Exception as e:
        print(f"Error searching in DynamoDB: {e}")
        raise e



def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def get_rekognition_client(profile_name: str = None, region: str = REGION_NAME):
    session = boto3.Session(profile_name=profile_name) if profile_name else boto3.Session()
    return session.client(REKOGNITION_SERVICE, region_name=region)


def get_dynamodb_client(profile_name: str = None, region: str = REGION_NAME):
    session = boto3.Session(profile_name=profile_name) if profile_name else boto3.Session()
    return session.resource(DYNAMODB_SERVICE, region_name=region)
