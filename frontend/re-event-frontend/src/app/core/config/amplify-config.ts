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
      REST: {
        events: {
          service: 'events',
          endpoint: environment.apiUrl,
          region: 'us-east-1',
        }
      }
    }
  });
}
