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

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        // Extract userId from JWT token
        const authorId = getUserIdFromToken(event);
        
        const body = JSON.parse(event.body || '{}');
        const {
            title,
            body: notificationBody,
            image,
            actionType,
            actionValue,
            type,
            audience,
            userId: targetUserId,
            segmentId
        } = body;

        // Validate required fields
        if (!title || !notificationBody || !type || !audience) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: title, body, type, and audience are required'
                })
            };
        }

        // Validate actionType if actionValue is provided
        if (actionValue && !actionType) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'actionType is required when actionValue is provided'
                })
            };
        }

        // Validate audience-specific fields
        if (audience === 'user' && !targetUserId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'userId is required when audience is "user"'
                })
            };
        }

        if (audience === 'segment' && !segmentId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'segmentId is required when audience is "segment"'
                })
            };
        }

        // Validate actionType values
        if (actionType && !['link', 'screen'].includes(actionType)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'actionType must be either "link" or "screen"'
                })
            };
        }

        // Validate type values
        if (!['evento', 'anuncio', 'recompensa'].includes(type)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'type must be one of: evento, anuncio, recompensa'
                })
            };
        }

        const notificationId = generateUUID();
        const now = new Date().toISOString();

        const notificationItem = {
            notificationId,
            title,
            body: notificationBody,
            image: image || null,
            actionType: actionType || null,
            actionValue: actionValue || null,
            type,
            audience,
            targetUserId: targetUserId || null,
            segmentId: segmentId || null,
            authorId,
            createdAt: now,
            updatedAt: now,
            status: 'active' // active, inactive, scheduled
        };

        await dynamodb.send(new PutCommand({
            TableName: process.env.NOTIFICATIONS_TABLE,
            Item: notificationItem
        }));

        console.log('Notification created:', notificationItem);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Notification created successfully',
                data: notificationItem
            })
        };

    } catch (error) {
        console.error('Error creating notification:', error);
        
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
