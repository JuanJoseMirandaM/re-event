const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    console.log('Post confirmation trigger:', JSON.stringify(event, null, 2));
    
    const { userAttributes, userName } = event.request;
    const userId = userName || event.userName || userAttributes.sub;
    
    if (!userId) {
        console.error('No userId found in event');
        throw new Error('Missing userId');
    }
    
    try {
        const userItem = {
            userId: userId,
            email: userAttributes.email,
            name: userAttributes.name,
            company: userAttributes['custom:company'] || '',
            phoneNumber: userAttributes.phone_number || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: 'guest',
            points: 0
        };

        await dynamodb.send(new PutCommand({
            TableName: process.env.USERS_TABLE,
            Item: userItem
        }));

        console.log('User saved to DynamoDB:', userItem);
        
    } catch (error) {
        console.error('Error saving user to DynamoDB:', error);
        throw error;
    }

    return event;
};