const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

function generateUUID() {
    return crypto.randomUUID();
}

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const body = JSON.parse(event.body);
        const eventId = generateUUID();
        const now = new Date().toISOString();

        const eventItem = {
            eventId,
            title: body.title,
            description: body.description,
            startDate: body.startDate,
            endDate: body.endDate || null,
            time: body.time || null,
            location: body.location,
            locationLink: body.locationLink || null,
            speakers: body.speakers || [],
            tags: body.tags || [],
            createdAt: now,
            updatedAt: now
        };

        const command = new PutCommand({
            TableName: process.env.EVENTS_TABLE,
            Item: eventItem
        });

        const result = await dynamodb.send(command);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                data: eventItem
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