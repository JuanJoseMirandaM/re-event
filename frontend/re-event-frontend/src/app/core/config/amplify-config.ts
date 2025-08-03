import { environment } from '../../../environments/environment';
import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: environment.cognitoConfig.userPoolId,
        userPoolClientId: environment.cognitoConfig.userPoolClientId,
      }
    },
    API: {
      GraphQL: {
        endpoint: 'https://b65pumrqendyhkpg2o2k6tto4a.appsync-api.us-east-1.amazonaws.com/graphql',
        region: environment.cognitoConfig.region,
        defaultAuthMode: 'userPool'
      }
    }
  });
}
