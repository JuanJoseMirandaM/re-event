const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const eventId = event.pathParameters.eventId;

        if (!eventId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'eventId is required' })
            };
        }

        const command = new GetCommand({
            TableName: process.env.EVENTS_TABLE,
            Key: { eventId }
        });

        const result = await dynamodb.send(command);

        if (!result.Item) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    message: 'Event not found'
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.Item)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error retrieving event',
                error: error.message
            })
        };
    }
};