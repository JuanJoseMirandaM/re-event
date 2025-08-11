import { environment } from '../../../environments/environment';
import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: environment.cognitoConfig.userPoolId,
        userPoolClientId: environment.cognitoConfig.userPoolClientId,
        loginWith: {
          oauth: {
            domain: environment.cognitoConfig.domain,
            scopes: ['email', 'openid', 'profile'],
            responseType: 'code',
            providers: ['Google'],
            redirectSignIn: [environment.cognitoConfig.redirectSignIn],
            redirectSignOut: [environment.cognitoConfig.redirectSignOut]
          }
        }
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
