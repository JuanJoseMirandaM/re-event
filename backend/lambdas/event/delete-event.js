const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const eventId = event.pathParameters.eventId;

        // Check if event exists
        const getResult = await dynamodb.send(new GetCommand({
            TableName: process.env.EVENTS_TABLE,
            Key: { eventId }
        }));

        if (!getResult.Item) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Event not found'
                })
            };
        }

        const command = new DeleteCommand({
            TableName: process.env.EVENTS_TABLE,
            Key: { eventId }
        });

        await dynamodb.send(command);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: eventId
            })
        };
    } catch (error) {
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