const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const eventId = event.pathParameters.eventId;
        const body = JSON.parse(event.body);
        const now = new Date().toISOString();

        const updateExpression = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};

        if (body.titulo) {
            updateExpression.push('#titulo = :titulo');
            expressionAttributeNames['#titulo'] = 'titulo';
            expressionAttributeValues[':titulo'] = body.titulo;
        }
        if (body.descripcion) {
            updateExpression.push('descripcion = :descripcion');
            expressionAttributeValues[':descripcion'] = body.descripcion;
        }
        if (body.fecha) {
            updateExpression.push('fecha = :fecha');
            expressionAttributeValues[':fecha'] = body.fecha;
        }
        if (body.hora !== undefined) {
            updateExpression.push('hora = :hora');
            expressionAttributeValues[':hora'] = body.hora;
        }
        if (body.lugar) {
            updateExpression.push('lugar = :lugar');
            expressionAttributeValues[':lugar'] = body.lugar;
        }
        if (body.link_lugar !== undefined) {
            updateExpression.push('link_lugar = :link_lugar');
            expressionAttributeValues[':link_lugar'] = body.link_lugar;
        }
        if (body.expositores) {
            updateExpression.push('expositores = :expositores');
            expressionAttributeValues[':expositores'] = body.expositores;
        }

        updateExpression.push('updatedAt = :updatedAt');
        expressionAttributeValues[':updatedAt'] = now;

        const result = await dynamodb.send(new UpdateCommand({
            TableName: process.env.EVENTS_TABLE,
            Key: { eventId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
            ReturnValues: 'ALL_NEW'
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Event updated successfully',
                event: result.Attributes
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Error updating event',
                error: error.message
            })
        };
    }
};