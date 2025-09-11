const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

// Function to extract user ID from Cognito JWT token
function getUserIdFromToken(event) {
    try {
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null; // Return null for unauthenticated requests
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Decode JWT token (without verification for now)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        // Extract user ID from Cognito claims
        const userId = payload.sub || payload['cognito:username'] || payload.username;
        
        return userId || null;
    } catch (error) {
        console.error('Error extracting user ID:', error);
        return null;
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
        const queryParams = event.queryStringParameters || {};
        const limit = parseInt(queryParams.limit) || 20;
        const lastKey = queryParams.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : undefined;
        const upcoming = queryParams.upcoming === 'true';
        const past = queryParams.past === 'true';
        const includeUserData = queryParams.includeUserData === 'true';

        // Extract user ID if authenticated
        const userId = getUserIdFromToken(event);

        const today = new Date().toISOString().split('T')[0];
        let params = {
            TableName: process.env.EVENTS_TABLE,
            Limit: limit
        };

        if (lastKey) {
            params.ExclusiveStartKey = lastKey;
        }

        let result;

        if (upcoming) {
            params.FilterExpression = 'startDate >= :today';
            params.ExpressionAttributeValues = { ':today': today };
            result = await dynamodb.send(new ScanCommand(params));
        } else if (past) {
            params.FilterExpression = 'startDate < :today';
            params.ExpressionAttributeValues = { ':today': today };
            result = await dynamodb.send(new ScanCommand(params));
        } else {
            result = await dynamodb.send(new ScanCommand(params));
        }

        let enrichedEvents = result.Items || [];

        // If user is authenticated and wants user-specific data, enrich events
        if (userId && includeUserData && enrichedEvents.length > 0) {
        console.log('Enriching events with user data for userId:', userId);
        console.log('Number of events to enrich:', enrichedEvents.length);
        console.log('Updated permissions check - should have access to favorites table');
            enrichedEvents = await enrichEventsWithUserData(enrichedEvents, userId);
            console.log('Events enriched successfully');
        } else {
            console.log('Skipping user data enrichment. userId:', userId, 'includeUserData:', includeUserData, 'eventsCount:', enrichedEvents.length);
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
                success: true,
                data: {
                    items: enrichedEvents,
                    lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
                    count: enrichedEvents.length
                }
            })
        };
    } catch (error) {
        console.error('Error getting events:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

// Function to enrich events with user-specific data (evaluations and favorites)
async function enrichEventsWithUserData(events, userId) {
    try {
        const eventIds = events.map(event => event.eventId);
        console.log('Event IDs to check:', eventIds);
        
        // Batch get evaluations for all events
        const evaluations = await getEvaluationsForEvents(eventIds, userId);
        console.log('Found evaluations:', evaluations.length);
        
        // Batch get favorites for all events
        const favorites = await getFavoritesForEvents(eventIds, userId);
        console.log('Found favorites:', favorites.length);
        
        // Enrich each event with user data
        const enrichedEvents = events.map(event => {
            const isEvaluated = evaluations.some(eval => eval.sessionId === event.eventId);
            const isFavorite = favorites.some(fav => fav.eventId === event.eventId);
            const evaluation = evaluations.find(eval => eval.sessionId === event.eventId) || null;
            
            console.log(`Event ${event.eventId}: isEvaluated=${isEvaluated}, isFavorite=${isFavorite}, hasEvaluation=${!!evaluation}`);
            
            return {
                ...event,
                userData: {
                    isEvaluated,
                    isFavorite,
                    evaluation
                }
            };
        });
        
        return enrichedEvents;
    } catch (error) {
        console.error('Error enriching events with user data:', error);
        // Return events without user data if enrichment fails
        return events.map(event => ({
            ...event,
            userData: {
                isEvaluated: false,
                isFavorite: false,
                evaluation: null
            }
        }));
    }
}

// Function to get evaluations for multiple events
async function getEvaluationsForEvents(eventIds, userId) {
    try {
        // Since evaluations are stored by sessionId, we need to query by userId
        // and filter by sessionIds (assuming sessionId corresponds to eventId)
        const command = new ScanCommand({
            TableName: process.env.EVALUATIONS_TABLE,
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        });

        const result = await dynamodb.send(command);
        const allEvaluations = result.Items || [];
        
        // Filter evaluations that match any of the eventIds (sessionId)
        const matchingEvaluations = allEvaluations.filter(eval => 
            eventIds.includes(eval.sessionId)
        );
        
        console.log('All evaluations for user:', allEvaluations.length);
        console.log('Matching evaluations:', matchingEvaluations.length);
        console.log('Event IDs being checked:', eventIds);
        
        return matchingEvaluations;
    } catch (error) {
        console.error('Error getting evaluations:', error);
        return [];
    }
}

// Function to get favorites for multiple events
async function getFavoritesForEvents(eventIds, userId) {
    try {
        const command = new ScanCommand({
            TableName: process.env.FAVORITES_TABLE,
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        });

        const result = await dynamodb.send(command);
        const allFavorites = result.Items || [];
        
        // Filter favorites that match any of the eventIds
        const matchingFavorites = allFavorites.filter(fav => 
            eventIds.includes(fav.eventId)
        );
        
        console.log('All favorites for user:', allFavorites.length);
        console.log('Matching favorites:', matchingFavorites.length);
        console.log('Event IDs being checked:', eventIds);
        
        return matchingFavorites;
    } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
    }
}