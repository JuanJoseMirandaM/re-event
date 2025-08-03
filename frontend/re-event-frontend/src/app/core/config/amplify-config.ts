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
        endpoint: environment.graphqlUrl,
        region: environment.cognitoConfig.region,
        defaultAuthMode: 'userPool'
      }
    }
  });
}
