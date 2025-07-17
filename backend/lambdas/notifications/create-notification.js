const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

function generateUUID() {
    return crypto.randomUUID();
}

exports.handler = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { title, description, author, link, targetRole, userId } = requestBody;
    
    if (!title || !author || !targetRole) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Missing required fields: title, author, targetRole' })
      };
    }
    
    const notificationId = generateUUID();
    const now = new Date().toISOString();
    
    const notification = {
      notificationId,
      title,
      description: description || null,
      createdAt: now,
      author,
      link: link || null,
      targetRole,
      userId: userId || null,
      read: false
    };
    
    await dynamodb.send(new PutCommand({
      TableName: process.env.NOTIFICATIONS_TABLE,
      Item: notification
    }));
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: 'Notification created successfully',
        notification 
      })
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Error creating notification', error: error.message })
    };
  }
};