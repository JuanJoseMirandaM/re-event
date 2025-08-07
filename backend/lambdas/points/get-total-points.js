const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient());

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({})
    };
  }

  try {
    let userId;
    try {
      if (event.requestContext?.authorizer?.claims?.sub) {
        userId = event.requestContext.authorizer.claims.sub;
      } else if (event.requestContext?.authorizer?.jwt?.claims?.sub) {
        userId = event.requestContext.authorizer.jwt.claims.sub;
      } else {
        throw new Error('No se pudo obtener el userId del token');
      }
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No autorizado'
        })
      };
    }

    const command = new GetCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    });

    const result = await dynamodb.send(command);

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Usuario no encontrado'
        })
      };
    }

    const user = result.Item;
    const totalPoints = user.points || 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          userId,
          totalPoints,
          userName: user.name,
          userEmail: user.email,
          lastUpdated: user.updatedAt
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);
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