const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { notificationId, createdAt } = JSON.parse(event.body);
    
    if (!notificationId || !createdAt) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Missing required fields: notificationId, createdAt' })
      };
    }
    
    const params = {
      TableName: process.env.NOTIFICATIONS_TABLE,
      Key: {
        notificationId,
        createdAt
      },
      UpdateExpression: 'set #read = :read',
      ExpressionAttributeNames: {
        '#read': 'read'
      },
      ExpressionAttributeValues: {
        ':read': true
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamodb.send(new UpdateCommand(params));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: 'Notification marked as read',
        notification: result.Attributes 
      })
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Error marking notification as read', error: error.message })
    };
  }
};