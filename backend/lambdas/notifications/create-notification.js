const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');
const admin = require('firebase-admin');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

// Inicializar Firebase Admin (una vez)
let firebaseApp;
function initializeFirebase() {
  if (!firebaseApp) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
    } catch (error) {
      // Si ya está inicializado, no hacer nada
      if (error.code !== 'app/duplicate-app') {
        console.error('Error initializing Firebase:', error);
      }
    }
  }
  return firebaseApp;
}

function generateUUID() {
    return crypto.randomUUID();
}

// Function to extract user ID from Cognito JWT token
function getUserIdFromToken(event) {
    try {
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No valid authorization header');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Decode JWT token (without verification for now)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        // Extract user ID from Cognito claims
        const userId = payload.sub || payload['cognito:username'] || payload.username;
        
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        
        return userId;
    } catch (error) {
        throw new Error(`Failed to extract user ID from token: ${error.message}`);
    }
}

// Función para enviar notificación a FCM
async function sendToFCM(notification) {
    try {
        // Inicializar Firebase si no está inicializado
        initializeFirebase();
        
        let tokens = [];
        
        if (notification.audience === 'all') {
            // Obtener todos los tokens FCM activos
            const result = await dynamodb.send(new ScanCommand({
                TableName: process.env.FCM_TOKENS_TABLE,
                ProjectionExpression: 'fcm_token',
                FilterExpression: 'attribute_exists(fcm_token) AND fcm_token <> :empty',
                ExpressionAttributeValues: { 
                    ':empty': '' 
                }
            }));
            tokens = result.Items.map(item => item.fcm_token).filter(token => token && token.length > 0);
        } else if (notification.audience === 'user' && notification.targetUserId) {
            // Obtener tokens del usuario específico
            const result = await dynamodb.send(new QueryCommand({
                TableName: process.env.FCM_TOKENS_TABLE,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': notification.targetUserId },
                ProjectionExpression: 'fcm_token'
            }));
            tokens = result.Items.map(item => item.fcm_token).filter(token => token && token.length > 0);
        } else if (notification.audience === 'segment' && notification.segmentId) {
            // Para segmentos, por ahora obtenemos todos los tokens
            // En el futuro se puede implementar lógica de segmentación
            const result = await dynamodb.send(new ScanCommand({
                TableName: process.env.FCM_TOKENS_TABLE,
                ProjectionExpression: 'fcm_token',
                FilterExpression: 'attribute_exists(fcm_token) AND fcm_token <> :empty',
                ExpressionAttributeValues: { 
                    ':empty': '' 
                }
            }));
            tokens = result.Items.map(item => item.fcm_token).filter(token => token && token.length > 0);
        }
        
        if (tokens.length > 0) {
            // Preparar el mensaje FCM
            const message = {
                notification: {
                    title: notification.title,
                    body: notification.body,
                    imageUrl: notification.image || undefined
                },
                data: {
                    notificationId: notification.notificationId,
                    type: notification.type,
                    actionType: notification.actionType || '',
                    actionValue: notification.actionValue || '',
                    audience: notification.audience,
                    targetUserId: notification.targetUserId || '',
                    segmentId: notification.segmentId || ''
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            'mutable-content': 1
                        }
                    }
                }
            };
            
            // Enviar a todos los tokens
            const response = await admin.messaging().sendEachForMulticast({
                tokens,
                notification: message.notification,
                data: message.data,
                android: message.android,
                apns: message.apns
              });
            
            console.log('FCM Response:', {
                successCount: response.successCount,
                failureCount: response.failureCount,
                responses: response.responses
            });
            
            // Log de tokens fallidos para debugging
            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        console.warn(`Token failed: ${tokens[idx]}, Error: ${resp.error}`);
                    }
                });
            }
            
            return {
                success: true,
                sentTo: tokens.length,
                successCount: response.successCount,
                failureCount: response.failureCount
            };
        } else {
            console.log('No FCM tokens found for audience:', notification.audience);
            return {
                success: true,
                sentTo: 0,
                message: 'No tokens found'
            };
        }
    } catch (error) {
        console.error('Error sending to FCM:', error);
        // No fallar la creación de la notificación por errores de FCM
        return {
            success: false,
            error: error.message
        };
    }
}

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        // Extract userId from JWT token
        const authorId = getUserIdFromToken(event);
        
        const body = JSON.parse(event.body || '{}');
        const {
            title,
            body: notificationBody,
            image,
            actionType,
            actionValue,
            type,
            audience,
            userId: targetUserId,
            segmentId
        } = body;

        // Validate required fields
        if (!title || !notificationBody || !type || !audience) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: title, body, type, and audience are required'
                })
            };
        }

        // Validate actionType if actionValue is provided
        if (actionValue && !actionType) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'actionType is required when actionValue is provided'
                })
            };
        }

        // Validate audience-specific fields
        if (audience === 'user' && !targetUserId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'userId is required when audience is "user"'
                })
            };
        }

        if (audience === 'segment' && !segmentId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'segmentId is required when audience is "segment"'
                })
            };
        }

        // Validate actionType values
        if (actionType && !['link', 'screen'].includes(actionType)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'actionType must be either "link" or "screen"'
                })
            };
        }

        // Validate type values
        if (!['evento', 'anuncio', 'recompensa'].includes(type)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'type must be one of: evento, anuncio, recompensa'
                })
            };
        }

        const notificationId = generateUUID();
        const now = new Date().toISOString();

        const notificationItem = {
            notificationId,
            title,
            body: notificationBody,
            image: image || null,
            actionType: actionType || null,
            actionValue: actionValue || null,
            type,
            audience,
            targetUserId: targetUserId || null,
            segmentId: segmentId || null,
            authorId,
            createdAt: now,
            updatedAt: now,
            status: 'active' // active, inactive, scheduled
        };

        // Guardar en DynamoDB
        await dynamodb.send(new PutCommand({
            TableName: process.env.NOTIFICATIONS_TABLE,
            Item: notificationItem
        }));

        console.log('Notification created:', notificationItem);

        // Enviar a FCM (en paralelo, no esperar respuesta)
        const fcmResult = await sendToFCM(notificationItem);
        console.log('FCM sending result:', fcmResult);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Notification created and sent successfully',
                data: {
                    ...notificationItem,
                    fcmResult
                }
            })
        };

    } catch (error) {
        console.error('Error creating notification:', error);
        
        return {
            statusCode: error.message.includes('authorization') ? 401 : 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
