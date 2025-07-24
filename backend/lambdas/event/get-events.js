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
        const upcoming = queryParams.upcoming === 'true';
        const past = queryParams.past === 'true';
        
        let params = {
            TableName: process.env.EVENTS_TABLE,
            Limit: limit
        };

        if (lastKey) {
            params.ExclusiveStartKey = lastKey;
        }

        // Filter upcoming events
        else if (upcoming) {
            const today = new Date().toISOString().split('T')[0];
            params.IndexName = 'DateIndex';
            params.KeyConditionExpression = 'startDate >= :today';
            params.ExpressionAttributeValues = {
                ':today': today
            };
            params.ScanIndexForward = true;
        }
        // Filter past events
        else if (past) {
            const today = new Date().toISOString().split('T')[0];
            params.IndexName = 'DateIndex';
            params.KeyConditionExpression = 'startDate < :today';
            params.ExpressionAttributeValues = {
                ':today': today
            };
            params.ScanIndexForward = false;
        }
        // Scan all events
        else {
            const result = await dynamodb.send(new ScanCommand(params));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    events: result.Items.sort((a, b) => a.startDate.localeCompare(b.startDate)),
                    lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
                    count: result.Items.length
                })
            };
        }

        const result = await dynamodb.send(new QueryCommand(params));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                items: result.Items,
                lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
                count: result.Items.length
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error listing events',
                error: error.message
            })
        };
    }
};