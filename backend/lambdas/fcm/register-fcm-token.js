const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

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
    console.log('Register FCM token event:', JSON.stringify(event, null, 2));
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
    try {
        // Extract userId from JWT token
        const userId = getUserIdFromToken(event);
        
        // Parse the request body
        const body = JSON.parse(event.body || '{}');
        const { deviceId, token, platform, topics } = body;
        
        // Validate required fields (deviceId and token are still required from body)
        if (!deviceId || !token) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: deviceId and token are required'
                })
            };
        }
        
        // Check if token already exists for this user and device
        try {
            const existingToken = await dynamodb.send(new GetCommand({
                TableName: process.env.FCM_TOKENS_TABLE,
                Key: {
                    userId: userId,
                    deviceId: deviceId
                }
            }));
            
            const now = new Date().toISOString();
            
            if (existingToken.Item) {
                // Update existing token
                const updateParams = {
                    TableName: process.env.FCM_TOKENS_TABLE,
                    Key: {
                        userId: userId,
                        deviceId: deviceId
                    },
                    UpdateExpression: 'SET #token = :token, #updatedAt = :updatedAt',
                    ExpressionAttributeNames: {
                        '#token': 'token',
                        '#updatedAt': 'updatedAt'
                    },
                    ExpressionAttributeValues: {
                        ':token': token,
                        ':updatedAt': now
                    },
                    ReturnValues: 'ALL_NEW'
                };
                
                // Add platform and topics if provided
                if (platform) {
                    updateParams.UpdateExpression += ', #platform = :platform';
                    updateParams.ExpressionAttributeNames['#platform'] = 'platform';
                    updateParams.ExpressionAttributeValues[':platform'] = platform;
                }
                
                if (topics && Array.isArray(topics)) {
                    updateParams.UpdateExpression += ', #topics = :topics';
                    updateParams.ExpressionAttributeNames['#topics'] = 'topics';
                    updateParams.ExpressionAttributeValues[':topics'] = topics;
                }
                
                const result = await dynamodb.send(new UpdateCommand(updateParams));
                
                console.log('FCM token updated:', result.Attributes);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'FCM token updated successfully',
                        data: result.Attributes
                    })
                };
            } else {
                // Create new token
                const newTokenItem = {
                    userId: userId,
                    deviceId: deviceId,
                    token: token,
                    platform: platform || 'web',
                    topics: topics || ['all'],
                    createdAt: now,
                    updatedAt: now
                };
                
                await dynamodb.send(new PutCommand({
                    TableName: process.env.FCM_TOKENS_TABLE,
                    Item: newTokenItem
                }));
                
                console.log('FCM token created:', newTokenItem);
                
                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'FCM token registered successfully',
                        data: newTokenItem
                    })
                };
            }
            
        } catch (dbError) {
            console.error('Database error:', dbError);
            throw dbError;
        }
        
    } catch (error) {
        console.error('Error in register FCM token lambda:', error);
        
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
