const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

function generateUUID() {
    return crypto.randomUUID();
}

exports.handler = async (evaluation) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const body = JSON.parse(evaluation.body);
        const evaluationId = generateUUID();
        const now = new Date().toISOString();

        const evaluationItem = {
            evaluationId,
            sessionId: body.sessionId,
            userId: body.userId,
            rating: body.rating,
            npsScore: body.npsScore || null,
            comments: body.comments || null,
            sentiment: body.sentiment || null,
            createdAt: now
        };

        const command = new PutCommand({
            TableName: process.env.EVALUATIONS_TABLE,
            Item: evaluationItem
        });

        const result = await dynamodb.send(command);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                message: 'Evaluation created successfully',
                event: result.Attributes
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error creating evaluation',
                error: error.message
            })
        };
    }
};