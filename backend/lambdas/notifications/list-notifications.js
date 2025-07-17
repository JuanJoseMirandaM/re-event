const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { userId, role } = event.queryStringParameters || {};
    
    let params = {
      TableName: process.env.NOTIFICATIONS_TABLE,
      Limit: 50
    };
    
    // Si se proporciona un userId específico, buscar notificaciones para ese usuario
    if (userId) {
      params = {
        TableName: process.env.NOTIFICATIONS_TABLE,
        IndexName: 'UserIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false // Para obtener las más recientes primero
      };
    } 
    // Si se proporciona un rol, buscar notificaciones para ese rol
    else if (role) {
      params = {
        TableName: process.env.NOTIFICATIONS_TABLE,
        IndexName: 'RoleIndex',
        KeyConditionExpression: 'targetRole = :role',
        ExpressionAttributeValues: {
          ':role': role
        },
        ScanIndexForward: false // Para obtener las más recientes primero
      };
    }
    
    const result = await dynamodb.send(new QueryCommand(params));
    
    // Si se proporciona un rol, también incluir notificaciones para ALL
    if (role && role !== 'ALL') {
      const allNotificationsParams = {
        TableName: process.env.NOTIFICATIONS_TABLE,
        IndexName: 'RoleIndex',
        KeyConditionExpression: 'targetRole = :role',
        ExpressionAttributeValues: {
          ':role': 'ALL'
        },
        ScanIndexForward: false
      };
      
      const allNotifications = await dynamodb.send(new QueryCommand(allNotificationsParams));
      
      // Combinar y ordenar por fecha
      const combinedItems = [...result.Items, ...allNotifications.Items]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      result.Items = combinedItems;
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        notifications: result.Items,
        count: result.Items.length
      })
    };
  } catch (error) {
    console.error('Error listing notifications:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Error listing notifications', error: error.message })
    };
  }
};