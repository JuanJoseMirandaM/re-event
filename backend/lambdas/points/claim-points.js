const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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

    const body = JSON.parse(event.body);
    const { code } = body;

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'El código es requerido'
        })
      };
    }

    const command = new GetCommand({
      TableName: process.env.POINTS_CODES_TABLE,
      Key: { code }
    });

    // Verificar si el código existe
    const codeResult = await dynamodb.send(command);

    if (!codeResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Código no encontrado'
        })
      };
    }

    const codeData = codeResult.Item;

    // Verificar si el código ha expirado
    if (codeData.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(codeData.expiresAt);

      if (now > expiresAt) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'El código ha expirado'
          })
        };
      }
    }

    // Verificar si el usuario ya usó este código
    const queryCommand = new QueryCommand({
      TableName: process.env.POINTS_CLAIMS_TABLE,
      IndexName: 'CodeIndex',
      KeyConditionExpression: 'code = :code',
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':code': code,
        ':userId': userId
      }
    });

    const claimResult = await dynamodb.send(queryCommand);

    if (claimResult.Items && claimResult.Items.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Ya has usado este código'
        })
      };
    }

    // Verificar límite de usos si existe
    if (codeData.maxUses) {
      const allClaimsResult = await dynamodb.send(new QueryCommand({
        TableName: process.env.POINTS_CLAIMS_TABLE,
        IndexName: 'CodeIndex',
        KeyConditionExpression: 'code = :code',
        ExpressionAttributeValues: {
          ':code': code
        }
      }));

      if (allClaimsResult.Items && allClaimsResult.Items.length >= codeData.maxUses) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Este código ya no está disponible (límite de usos alcanzado)'
          })
        };
      }
    }

    const now = new Date();

    // Registrar el claim
    const claimItem = {
      userId,
      timestamp: now.toISOString(),
      code,
      points: codeData.points,
      sourceType: codeData.type,
      description: codeData.description || `${codeData.type.toUpperCase()} - ${code}`
    };

    await dynamodb.send(new PutCommand({
      TableName: process.env.POINTS_CLAIMS_TABLE,
      Item: claimItem
    }));

    // Agregar puntos al usuario
    const userResult = await dynamodb.send(new UpdateCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET points = points + :pointsToAdd, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':pointsToAdd': codeData.points,
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
          pointsEarned: codeData.points,
          totalPoints: userResult.Attributes.points,
          code,
          sourceType: codeData.type,
          description: claimItem.description,
          claimedAt: now.toISOString()
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