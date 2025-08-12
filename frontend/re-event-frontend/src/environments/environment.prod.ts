export const environment = {
  production: true,
  apiUrl: 'https://67e15rhdb7.execute-api.us-east-1.amazonaws.com/prod',
  graphqlUrl: 'https://b65pumrqendyhkpg2o2k6tto4a.appsync-api.us-east-1.amazonaws.com/graphql',
  cognitoConfig: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_koSnqucA2',
    userPoolClientId: '162d0f9irj230mhiuhhh2t3o8m',
    domain: 'reevent-auth-prod.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://your-production-domain.com/auth/callback',
    redirectSignOut: 'https://your-production-domain.com/login'
  }
};
