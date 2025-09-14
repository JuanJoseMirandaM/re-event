import json
import os
import io
import boto3

from PIL import Image

# Environment variables
REGION_NAME = 'us-east-1'
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE')
BRAND_LOGO_KEY = os.environ.get('BRAND_LOGO_KEY', 'watermarks/brand.png')
PARTNER_LOGO_KEY = os.environ.get('PARTNER_LOGO_KEY', 'watermarks/partner.png')

# Service constants
S3_SERVICE = 's3'
DYNAMODB_SERVICE = 'dynamodb'

s3_client = boto3.client('s3', region_name=REGION_NAME)
dynamodb_client = boto3.resource('dynamodb', region_name=REGION_NAME)


def lambda_handler(event, context):
    try:
        print("=== LAMBDA 2 - BRAND LOGO ===")
        response_payload = event.get('responsePayload', {})
        body_str = response_payload.get('body', '{}')
        body_data = json.loads(body_str)

        image_key = body_data.get('image_key', '')
        bucket = body_data.get('bucket', '')
        collection_id = body_data.get('collection_id', '')
        rekognition_response = body_data.get('rekognition_response', [])

        print(f"IMAGE_KEY: {image_key}")
        print(f"BUCKET: {bucket}")
        print(f"COLLECTION_ID: {collection_id}")
        print(f"REKOGNITION_RESPONSE: {rekognition_response}")

        original_image = get_image_from_s3(bucket, image_key, s3_client)
        brand_logo = try_get_logo(bucket, BRAND_LOGO_KEY, s3_client, "brand")
        partner_logo = try_get_logo(bucket, PARTNER_LOGO_KEY, s3_client, "partner")

        final_image = process_image_with_logos(original_image, brand_logo, partner_logo)
        dest_key = generate_destination_key(image_key)
        print(f"DESTINATION KEY: {dest_key}")

        upload_image_to_s3(bucket, final_image, dest_key, s3_client)
        
        thumbnail_image = generate_thumbnail(final_image)
        thumbnail_key = dest_key.replace('fileName', 'thumbnail').rsplit('.', 1)[0] + '.webp'
        print(f"DESTINATION THUMBANAIL KEY: {thumbnail_key}")
        
        upload_image_to_s3(bucket, thumbnail_image, thumbnail_key, s3_client)

        face_array = [
            {"FaceId": f["FaceId"], "ImageId": f["ImageId"], "share_path": dest_key}
            for record in rekognition_response.get("FaceRecords", [])
            for f in [record.get("Face", {})]
            if f.get("FaceId") and f.get("ImageId")
        ]

        print(face_array)
        update_dynamodb_item(face_array)

        response = {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Image processed successfully',
                'image_key': dest_key,
                'bucket': bucket,
                'collection_id': collection_id,
                'logos_applied': {
                    'brand': brand_logo is not None,
                    'partner': partner_logo is not None
                }
            })
        }

        print(f"Response: {response}")
        print("=== FIN LAMBDA 2 ===")
        return response

    except Exception as e:
        print(f"ERROR in Lambda 2: {e}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'error': str(e)
        }


def try_get_logo(bucket, logo_key, s3_client, logo_name):
    try:
        logo_data = get_image_from_s3(bucket, logo_key, s3_client)
        print(f"{logo_name.upper()} logo found: {logo_key}")
        return logo_data
    except Exception as e:
        print(f"{logo_name.upper()} logo not found ({logo_key}): {e}")
        return None


def process_image_with_logos(original_image, brand_logo, partner_logo):
    current_image = original_image

    if brand_logo:
        print("Applying brand logo (bottom-right)")
        current_image = add_watermark(current_image, brand_logo, 35, 'bottom-right')

    if partner_logo:
        print("Applying partner logo (bottom-left)")
        current_image = add_watermark(current_image, partner_logo, 12, 'bottom-left')

    if not brand_logo and not partner_logo:
        print("No logos found - saving original image")

    return current_image


def generate_destination_key(original_key):
    dest_key = original_key.replace('private/', 'share/')
    print(f"Original extension preserved: {dest_key}")
    return dest_key


def add_watermark(image_data, logo_data, percentage, position: str = 'bottom-right'):
    with Image.open(io.BytesIO(image_data)) as image:
        with Image.open(io.BytesIO(logo_data)) as logo:
            min_dimension = min(image.width, image.height)
            logo_size = int(min_dimension * percentage / 100)
            logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)

            margin = 20
            if position == 'bottom-right':
                x = image.width - logo.width - margin
                y = image.height - logo.height - margin
            elif position == 'bottom-left':
                x = margin
                y = image.height - logo.height - margin
            else:
                x = margin
                y = image.height - logo.height - margin

            watermarked = image.copy()
            if logo.mode == 'RGBA':
                watermarked.paste(logo, (x, y), logo)
            else:
                watermarked.paste(logo, (x, y))

            output_buffer = io.BytesIO()
            original_format = image.format or 'JPEG'
            watermarked.save(output_buffer, format=original_format, quality=95)
            output_buffer.seek(0)
            return output_buffer.getvalue()


def generate_thumbnail(image_data, size=(128, 128)):
    print(f'Generating thumbnail of size {size}')
    
    with Image.open(io.BytesIO(image_data)) as image:
        image.thumbnail(size)
        output_buffer = io.BytesIO()
        image.save(output_buffer, format='WEBP', quality=95)
        output_buffer.seek(0)
        return output_buffer.getvalue()


def get_image_from_s3(bucket, image_key, s3_client):
    print(f'Download from S3 {bucket}/{image_key}')
    try:
        response = s3_client.get_object(Bucket=bucket, Key=image_key)
        return response['Body'].read()
    except Exception as e:
        print(f"Error getting image from S3 ({image_key}): {e}")
        raise


def upload_image_to_s3(bucket_name, image_data, dest_key, s3_client):
    print(f'Upload to S3 {bucket_name}/{dest_key}')
    try:
        if dest_key.lower().endswith('.png'):
            content_type = 'image/png'
        elif dest_key.lower().endswith(('.jpg', '.jpeg')):
            content_type = 'image/jpeg'
        elif dest_key.lower().endswith('.webp'):
            content_type = 'image/webp'
        else:
            content_type = 'image/jpeg'

        s3_client.put_object(
            Bucket=bucket_name,
            Key=dest_key,
            Body=image_data,
            ContentType=content_type
        )
        print(f"Image uploaded successfully: {dest_key}")
    except Exception as e:
        print(f"Error uploading image: {e}")
        raise


def update_dynamodb_item(face_array):
    dynamodb_table = dynamodb_client.Table(DYNAMODB_TABLE)
    print(f"Updating DynamoDB table {DYNAMODB_TABLE}")

    for face in face_array:
        face_id = face['FaceId']
        image_id = face['ImageId']
        share_path = face['share_path']

        print(f"Updating FaceId: {face_id}, ImageId: {image_id} with share_path: {share_path}")

        try:
            # Usar solo Primary Key + Condición para verificar imageId
            dynamodb_table.update_item(
                Key={'faceId': face_id},  # Solo Primary Key
                UpdateExpression="set share_path = :sp",
                ConditionExpression="imageId = :img_id",  # ← Verificar imageId
                ExpressionAttributeValues={
                    ':sp': share_path,
                    ':img_id': image_id
                },
                ReturnValues="UPDATED_NEW"
            )
            print(f"Successfully updated FaceId: {face_id}")
        except Exception as e:
            print(f"Error updating FaceId: {face_id}: {e}")
