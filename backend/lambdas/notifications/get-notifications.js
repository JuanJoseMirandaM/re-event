const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

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
        const type = queryParams.type; // evento | anuncio | recompensa
        const audience = queryParams.audience; // all | segment | user
        const userId = queryParams.userId; // para audience = user
        const segmentId = queryParams.segmentId; // para audience = segment
        const status = queryParams.status || 'active'; // active | inactive | scheduled

        let params = {
            TableName: process.env.NOTIFICATIONS_TABLE,
            Limit: limit
        };

        if (lastKey) {
            params.ExclusiveStartKey = lastKey;
        }

        // Build filter expression
        let filterExpressions = [];
        let expressionAttributeValues = {};
        let expressionAttributeNames = {};

        // Filter by status
        filterExpressions.push('#status = :status');
        expressionAttributeNames['#status'] = 'status';
        expressionAttributeValues[':status'] = status;

        // Filter by type if specified
        if (type) {
            filterExpressions.push('#type = :type');
            expressionAttributeNames['#type'] = 'type';
            expressionAttributeValues[':type'] = type;
        }

        // Filter by audience
        if (audience === 'user' && userId) {
            filterExpressions.push('#audience = :audience AND #targetUserId = :targetUserId');
            expressionAttributeNames['#audience'] = 'audience';
            expressionAttributeNames['#targetUserId'] = 'targetUserId';
            expressionAttributeValues[':audience'] = 'user';
            expressionAttributeValues[':targetUserId'] = userId;
        } else if (audience === 'segment' && segmentId) {
            filterExpressions.push('#audience = :audience AND #segmentId = :segmentId');
            expressionAttributeNames['#audience'] = 'audience';
            expressionAttributeNames['#segmentId'] = 'segmentId';
            expressionAttributeValues[':audience'] = 'segment';
            expressionAttributeValues[':segmentId'] = segmentId;
        } else if (audience === 'all') {
            filterExpressions.push('#audience = :audience');
            expressionAttributeNames['#audience'] = 'audience';
            expressionAttributeValues[':audience'] = 'all';
        }

        // Apply filters if any
        if (filterExpressions.length > 0) {
            params.FilterExpression = filterExpressions.join(' AND ');
            params.ExpressionAttributeNames = expressionAttributeNames;
            params.ExpressionAttributeValues = expressionAttributeValues;
        }

        const result = await dynamodb.send(new ScanCommand(params));

        // Sort by creation date (newest first)
        const sortedItems = result.Items.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    items: sortedItems,
                    lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
                    count: sortedItems.length,
                    totalCount: result.Count || sortedItems.length
                }
            })
        };

    } catch (error) {
        console.error('Error getting notifications:', error);
        
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
