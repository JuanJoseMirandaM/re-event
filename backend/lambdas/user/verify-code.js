const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const { verificationCode, userId } = JSON.parse(event.body);
        
        if (!verificationCode || !userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'verificationCode and userId are required'
                })
            };
        }

        // Buscar el código de verificación
        const verificationResult = await findVerificationCode(verificationCode);
        
        if (!verificationResult) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid verification code'
                })
            };
        }

        // Verificar que el código no haya sido usado
        if (verificationResult.used) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Verification code already used'
                })
            };
        }

        // Verificar que el código no haya expirado
        if (new Date() > new Date(verificationResult.expiresAt)) {
            return {
                statusCode: 410,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Verification code has expired'
                })
            };
        }

        // Obtener información del usuario
        const userResult = await getUser(userId);
        
        if (!userResult) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'User not found'
                })
            };
        }

        // Verificar que el usuario no esté ya verificado
        if (userResult.verified && userResult.role !== 'GUEST') {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'User is already verified'
                })
            };
        }

        // Actualizar usuario con nuevo rol y sumar puntos iniciales
        const updatedUser = await updateUserRole(userId, verificationResult.role, verificationResult.initialPoints, verificationCode);
        
        // Marcar código como usado
        await markCodeAsUsed(verificationCode, userId);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    user: updatedUser,
                    message: `Successfully verified as ${verificationResult.role}`,
                    pointsEarned: verificationResult.initialPoints,
                    verificationCode: verificationCode,
                    verifiedAt: new Date().toISOString()
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

async function findVerificationCode(code) {
    try {
        const result = await dynamodb.send(new GetCommand({
            TableName: process.env.VERIFICATION_CODES_TABLE,
            Key: { verificationCode: code }
        }));
        
        return result.Item;
    } catch (error) {
        console.error('Error finding verification code:', error);
        throw error;
    }
}

async function getUser(userId) {
    try {
        const result = await dynamodb.send(new GetCommand({
            TableName: process.env.USERS_TABLE,
            Key: { userId }
        }));
        
        return result.Item;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
}

async function updateUserRole(userId, newRole, pointsToAdd, verificationCode) {
    try {
        const updateParams = {
            TableName: process.env.USERS_TABLE,
            Key: { userId },
            UpdateExpression: 'SET #role = :role, verified = :verified, points = points + :pointsToAdd, verificationCode = :verificationCode, verifiedAt = :verifiedAt, verifiedBy = :verificationCode, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#role': 'role'
            },
            ExpressionAttributeValues: {
                ':role': newRole,
                ':verified': true,
                ':pointsToAdd': pointsToAdd,
                ':verificationCode': verificationCode,
                ':verifiedAt': new Date().toISOString(),
                ':updatedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamodb.send(new UpdateCommand(updateParams));
        return result.Attributes;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}

async function markCodeAsUsed(code, userId) {
    try {
        await dynamodb.send(new UpdateCommand({
            TableName: process.env.VERIFICATION_CODES_TABLE,
            Key: { verificationCode: code },
            UpdateExpression: 'SET used = :used, usedBy = :usedBy, usedAt = :usedAt',
            ExpressionAttributeValues: {
                ':used': true,
                ':usedBy': userId,
                ':usedAt': new Date().toISOString()
            }
        }));
    } catch (error) {
        console.error('Error marking code as used:', error);
        throw error;
    }
} 