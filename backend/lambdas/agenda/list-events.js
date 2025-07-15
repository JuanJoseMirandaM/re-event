const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const queryParams = event.queryStringParameters || {};
        const limit = parseInt(queryParams.limit) || 20;
        const lastKey = queryParams.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : undefined;
        const fecha = queryParams.fecha;
        const upcoming = queryParams.upcoming === 'true';
        const past = queryParams.past === 'true';
        
        let params = {
            TableName: process.env.EVENTS_TABLE,
            Limit: limit
        };

        if (lastKey) {
            params.ExclusiveStartKey = lastKey;
        }

        // Filter by specific date
        if (fecha) {
            params.IndexName = 'FechaIndex';
            params.KeyConditionExpression = 'fecha = :fecha';
            params.ExpressionAttributeValues = {
                ':fecha': fecha
            };
        }
        // Filter upcoming events
        else if (upcoming) {
            const today = new Date().toISOString().split('T')[0];
            params.IndexName = 'FechaIndex';
            params.KeyConditionExpression = 'fecha >= :today';
            params.ExpressionAttributeValues = {
                ':today': today
            };
            params.ScanIndexForward = true;
        }
        // Filter past events
        else if (past) {
            const today = new Date().toISOString().split('T')[0];
            params.IndexName = 'FechaIndex';
            params.KeyConditionExpression = 'fecha < :today';
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
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    events: result.Items.sort((a, b) => a.fecha.localeCompare(b.fecha)),
                    lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
                    count: result.Items.length
                })
            };
        }

        const result = await dynamodb.send(new QueryCommand(params));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                events: result.Items,
                lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
                count: result.Items.length
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Error listing events',
                error: error.message
            })
        };
    }
};