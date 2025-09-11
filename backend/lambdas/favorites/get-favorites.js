const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb');

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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        // Extract userId from JWT token
        const userId = getUserIdFromToken(event);
        
        const queryParams = event.queryStringParameters || {};
        const limit = parseInt(queryParams.limit) || 20;
        const lastKey = queryParams.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : undefined;

        const command = new QueryCommand({
            TableName: process.env.FAVORITES_TABLE,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            Limit: limit,
            ExclusiveStartKey: lastKey,
            ScanIndexForward: false // Most recent first
        });

        const result = await dynamodb.send(command);
        const favorites = result.Items || [];

        // If we have favorites, get the full event details
        let enrichedFavorites = [];
        if (favorites.length > 0) {
            enrichedFavorites = await enrichFavoritesWithEventData(favorites);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    items: enrichedFavorites,
                    lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
                    count: enrichedFavorites.length
                }
            })
        };
    } catch (error) {
        console.error('Error getting favorites:', error);
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

// Function to enrich favorites with full event data
async function enrichFavoritesWithEventData(favorites) {
    try {
        const eventIds = favorites.map(fav => fav.eventId);
        
        // Batch get events
        const command = new BatchGetCommand({
            RequestItems: {
                [process.env.EVENTS_TABLE]: {
                    Keys: eventIds.map(eventId => ({ eventId }))
                }
            }
        });

        const result = await dynamodb.send(command);
        const events = result.Responses[process.env.EVENTS_TABLE] || [];
        
        // Create a map for quick lookup
        const eventMap = new Map(events.map(event => [event.eventId, event]));
        
        // Enrich favorites with event data
        return favorites.map(favorite => ({
            ...favorite,
            event: eventMap.get(favorite.eventId) || null
        }));
    } catch (error) {
        console.error('Error enriching favorites with event data:', error);
        return favorites.map(favorite => ({
            ...favorite,
            event: null
        }));
    }
}
