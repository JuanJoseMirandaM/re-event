const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

function generateUUID() {
    return crypto.randomUUID();
}

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const eventId = generateUUID();
        const now = new Date().toISOString();

        const eventItem = {
            eventId,
            titulo: body.titulo,
            descripcion: body.descripcion,
            fecha: body.fecha,
            hora: body.hora || null,
            lugar: body.lugar,
            link_lugar: body.link_lugar || null,
            expositores: body.expositores || [],
            createdAt: now,
            updatedAt: now
        };

        await dynamodb.send(new PutCommand({
            TableName: process.env.EVENTS_TABLE,
            Item: eventItem
        }));

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Event created successfully',
                event: eventItem
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Error creating event',
                error: error.message
            })
        };
    }
};