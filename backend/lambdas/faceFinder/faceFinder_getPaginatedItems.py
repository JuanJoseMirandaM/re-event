import json
import boto3
import os
from decimal import Decimal

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

        # Calculate items to skip
        items_to_skip = page * size

        # For DynamoDB, we need to scan and paginate manually
        all_items = []
        last_evaluated_key = None
        scanned_count = 0

        while True:
            scan_params = {'Limit': 1000}  # Scan in chunks
            if last_evaluated_key:
                scan_params['ExclusiveStartKey'] = last_evaluated_key

            response = table.scan(**scan_params)
            items = response.get('Items', [])

            # Add items to our collection
            for item in items:
                if scanned_count >= items_to_skip:
                    if len(all_items) < size:
                        all_items.append(item)
                    else:
                        break
                scanned_count += 1

            # Check if we have enough items or no more data
            if len(all_items) >= size or 'LastEvaluatedKey' not in response:
                break

            last_evaluated_key = response['LastEvaluatedKey']

        # Get total count (for pagination info)
        count_response = table.scan(Select='COUNT')
        total_items = count_response['Count']
        total_pages = (total_items + size - 1) // size  # Ceiling division

        # Process items for JSON serialization
        processed_items = []
        for item in all_items:
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
