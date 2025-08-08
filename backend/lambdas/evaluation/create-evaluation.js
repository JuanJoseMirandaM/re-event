const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

function generateUUID() {
    return crypto.randomUUID();
}

// Function to extract user ID from Cognito JWT token
function getUserIdFromToken(event) {
    try {
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No valid authorization header');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Decode JWT token (without verification for now)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        // Extract user ID from Cognito claims
        const userId = payload.sub || payload['cognito:username'] || payload.username;
        
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        
        return userId;
    } catch (error) {
        throw new Error(`Failed to extract user ID from token: ${error.message}`);
    }
}

exports.handler = async (evaluation) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        // Extract userId from JWT token
        const userId = getUserIdFromToken(evaluation);
        
        const body = JSON.parse(evaluation.body);
        const evaluationId = generateUUID();
        const now = new Date().toISOString();

        // Validate required fields
        if (!body.sessionId || !body.rating) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'sessionId and rating are required'
                })
            };
        }

        // Validate rating range
        if (body.rating < 1 || body.rating > 5) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'rating must be between 1 and 5'
                })
            };
        }

        // Validate NPS score if provided
        if (body.npsScore !== undefined && (body.npsScore < 0 || body.npsScore > 10)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'npsScore must be between 0 and 10'
                })
            };
        }

        const evaluationItem = {
            evaluationId,
            sessionId: body.sessionId,
            userId: userId, // Use userId from token
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
                success: true,
                event: evaluationItem
            })
        };
    } catch (error) {
        console.error('Error creating evaluation:', error);
        return {
            statusCode: error.message.includes('authorization') ? 401 : 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};