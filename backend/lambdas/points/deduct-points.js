const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
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

    // TODO: Verificar que el usuario es organizador
    // Implementar validación de rol ORGANIZER según las necesidades específicas
    // Usar la variable 'userId' para verificar el rol del usuario autenticado

    const body = JSON.parse(event.body);
    const { targetUserId, points, description } = body;

    // Validar parámetros requeridos
    if (!targetUserId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'El targetUserId es requerido'
        })
      };
    }

    if (!points || points <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Los puntos deben ser un número positivo'
        })
      };
    }

    if (!description) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'La descripción es requerida'
        })
      };
    }

    // Verificar que el usuario objetivo existe y obtener sus puntos actuales
    const userCommand = new GetCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId: targetUserId }
    });

    const userResult = await dynamodb.send(userCommand);

    if (!userResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Usuario no encontrado'
        })
      };
    }

    const currentPoints = userResult.Item.points || 0;

    // Validar que el usuario tenga suficientes puntos
    if (currentPoints < points) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `El usuario no tiene suficientes puntos. Puntos actuales: ${currentPoints}, puntos solicitados: ${points}`
        })
      };
    }

    const now = new Date();

    // Registrar la transacción de deducción
    const deductItem = {
      userId: targetUserId,
      timestamp: now.toISOString(),
      code: `DEDUCT_${userId}_${Date.now()}`, // Código único para la deducción
      points: -points, // Puntos negativos para indicar deducción
      sourceType: 'deduction',
      description: description,
      organizerId: userId // Registrar quién hizo la deducción
    };

    await dynamodb.send(new PutCommand({
      TableName: process.env.POINTS_CLAIMS_TABLE,
      Item: deductItem
    }));

    // Descontar puntos del usuario
    const updateResult = await dynamodb.send(new UpdateCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId: targetUserId },
      UpdateExpression: 'SET points = points - :pointsToDeduct, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':pointsToDeduct': points,
        ':updatedAt': now.toISOString()
      },
      ReturnValues: 'ALL_NEW'
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          pointsDeducted: points,
          totalPoints: updateResult.Attributes.points,
          targetUserId,
          description,
          deductedAt: now.toISOString(),
          organizerId: userId
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
