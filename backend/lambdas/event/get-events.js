const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

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
        const upcoming = queryParams.upcoming === 'true';
        const past = queryParams.past === 'true';

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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    items: result.Items,
                    lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
                    count: result.Items.length
                }
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