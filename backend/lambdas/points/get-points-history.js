const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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
    // Obtener userId del token o de la URL
    let userId;

    // Si viene de la URL (GET /points/history/{userId})
    if (event.pathParameters && event.pathParameters.userId) {
      userId = event.pathParameters.userId;
    } else {
      // Si viene del token (usuario actual)
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
    }

    // Obtener parámetros de consulta
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 20;
    const lastKey = queryParams.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : undefined;
    const sourceType = queryParams.sourceType;

    // Construir la consulta
    const params = {
      TableName: process.env.POINTS_CLAIMS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false, // Orden descendente (más reciente primero)
      Limit: Math.min(limit, 100) // Máximo 100 items
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    if (sourceType) {
      params.FilterExpression = 'sourceType = :sourceType';
      params.ExpressionAttributeValues[':sourceType'] = sourceType;
    }

    const result = await dynamodb.send(new QueryCommand(params));

    const history = result.Items.map(item => ({
      timestamp: item.timestamp,
      points: item.points,
      code: item.code,
      sourceType: item.sourceType,
      description: item.description
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          items: history,
          lastKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
          count: result.Items.length,
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