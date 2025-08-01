import { environment } from '../../../environments/environment';
import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: environment.cognitoConfig.userPoolId,
        userPoolClientId: environment.cognitoConfig.userPoolClientId,
      }
    }
  });
}
