const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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
    const userId = event.queryStringParameters?.userId;
    const sessionId = event.queryStringParameters?.sessionId;

    if (!userId || !sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'userId and sessionId are required' 
        })
      };
    }

    const command = new QueryCommand({
      TableName: process.env.EVALUATIONS_TABLE,
      IndexName: 'UserIndex',
      KeyConditionExpression: 'userId = :uid',
      FilterExpression: 'sessionId = :sid',
      ExpressionAttributeValues: { ':uid': userId, ':sid': sessionId }
    });

    const result = await dynamodb.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result.Items[0] || {}
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