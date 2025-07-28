const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const eventId = event.pathParameters.eventId;
        const body = JSON.parse(event.body);
        const now = new Date().toISOString();

        const allowedFields = ['title', 'description', 'startDate', 'endDate', 'time', 'location', 'locationLink', 'speakers', 'tags'];
        const updateExpression = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};

        Object.keys(body).forEach(key => {
            if (allowedFields.includes(key) && body[key] !== undefined) {
                updateExpression.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = body[key];
            }
        });

        if (updateExpression.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    error: 'No valid fields to update' 
                })
            };
        }

        expressionAttributeValues[':updatedAt'] = now;
        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        
        const command = new UpdateCommand({
            TableName: process.env.EVENTS_TABLE,
            Key: { eventId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        });

        const result = await dynamodb.send(command);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: result.Attributes
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};