const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

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
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        // Extract userId from JWT token
        const userId = getUserIdFromToken(event);
        
        const eventId = event.pathParameters?.eventId;

        if (!eventId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'eventId is required'
                })
            };
        }

        // Check if favorite exists
        const getFavoriteResult = await dynamodb.send(new GetCommand({
            TableName: process.env.FAVORITES_TABLE,
            Key: { 
                userId: userId,
                eventId: eventId
            }
        }));

        if (!getFavoriteResult.Item) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Favorite not found'
                })
            };
        }

        const command = new DeleteCommand({
            TableName: process.env.FAVORITES_TABLE,
            Key: { 
                userId: userId,
                eventId: eventId
            }
        });

        await dynamodb.send(command);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: { eventId }
            })
        };
    } catch (error) {
        console.error('Error removing favorite:', error);
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
