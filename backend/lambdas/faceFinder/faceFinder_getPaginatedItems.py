import json
import boto3
import os
from decimal import Decimal
from collections import defaultdict

# Environment variables
REGION_NAME = 'us-east-1'
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE')

# Service constants
DYNAMODB_SERVICE = 'dynamodb'


def lambda_handler(event, context):
    try:
        # Extract path parameters
        path_params = event.get('pathParameters', {})
        print('Params:', path_params)

        page = int(path_params.get('page', 0))  # Default page 0
        size = int(path_params.get('size', 20))  # Default size 20

        # Validate parameters
        if page < 0 or size <= 0 or size > 100:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid page or size parameters'})
            }

        # DynamoDB setup
        dynamo_client = get_dynamodb_client()
        table_name = DYNAMODB_TABLE
        table = dynamo_client.Table(table_name)

        # Get all items and group by imageId
        grouped_images = defaultdict(lambda: {'faces': [], 'image_data': None})
        last_evaluated_key = None

        while True:
            scan_params = {'Limit': 1000}
            if last_evaluated_key:
                scan_params['ExclusiveStartKey'] = last_evaluated_key

            response = table.scan(**scan_params)
            items = response.get('Items', [])

            for item in items:
                image_id = item.get('imageId')
                if image_id:
                    # Store face info
                    face_data = {
                        'faceId': item.get('faceId'),
                        'boundingBox': item.get('boundingBox'),
                        'confidence': item.get('confidence')
                    }
                    grouped_images[image_id]['faces'].append(face_data)

                    # Store image metadata (only once per image)
                    if not grouped_images[image_id]['image_data']:
                        grouped_images[image_id]['image_data'] = {
                            'imageId': image_id,
                            'imageName': item.get('imageName'),
                            'collectionId': item.get('collectionId'),
                            'share_path': item.get('share_path'),
                            'created_at': item.get('created_at')
                        }

            if 'LastEvaluatedKey' not in response:
                break
            last_evaluated_key = response['LastEvaluatedKey']

        # Convert to list and sort by imageId for consistent pagination
        all_images = []
        for image_id, data in grouped_images.items():
            image_item = data['image_data'].copy()
            image_item['faces'] = data['faces']
            image_item['faceCount'] = len(data['faces'])
            all_images.append(image_item)

        # Sort by created_at for consistent pagination
        all_images.sort(key=lambda x: x.get('created_at', ''), reverse=True)

        # Apply pagination
        total_items = len(all_images)
        start_index = page * size
        end_index = start_index + size
        paginated_items = all_images[start_index:end_index]

        # Calculate pagination info
        total_pages = (total_items + size - 1) // size

        # Process items for JSON serialization
        processed_items = []
        for item in paginated_items:
            processed_item = json.loads(json.dumps(item, default=decimal_default))
            processed_items.append(processed_item)

        # Response
        result = {
            'items': processed_items,
            'pagination': {
                'page': page,
                'size': size,
                'totalItems': total_items,
                'totalPages': total_pages,
                'hasNext': page < total_pages - 1,
                'hasPrevious': page > 0
            }
        }

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps(result)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Error retrieving paginated data'
            })
        }


def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def get_dynamodb_client(profile_name: str = None, region: str = REGION_NAME):
    session = boto3.Session(profile_name=profile_name) if profile_name else boto3.Session()
    return session.resource(DYNAMODB_SERVICE, region_name=region)