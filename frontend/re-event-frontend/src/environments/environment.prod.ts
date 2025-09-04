export const environment = {
  production: true,
  apiUrl: 'https://67e15rhdb7.execute-api.us-east-1.amazonaws.com/dev',
  graphqlUrl: 'https://b65pumrqendyhkpg2o2k6tto4a.appsync-api.us-east-1.amazonaws.com/graphql',
  cognitoConfig: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_koSnqucA2',
    userPoolClientId: '162d0f9irj230mhiuhhh2t3o8m',
    domain: 'reevent-auth-dev.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://main.durqidc9rs9op.amplifyapp.com/auth/callback',  // Reemplazar con tu IP real
    redirectSignOut: 'https://main.durqidc9rs9op.amplifyapp.com/auth/logout'    // Reemplazar con tu IP real
  },
  firebaseConfig: {
    apiKey: "AIzaSyA5e4Qf0nUW-ALm40oAUrNImuyrZkBXMVY",
    authDomain: "kinua-fcm.firebaseapp.com",
    projectId: "kinua-fcm",
    storageBucket: "kinua-fcm.firebasestorage.app",
    messagingSenderId: "62396424616",
    appId: "1:62396424616:web:145f9df7cf9270105ebd9d",
    measurementId: "G-YFNCEBPK0H"
  },
  vapidKey: "BPQV-lieDnlXX6eTj85i0XbNwhsjRXYcXUcTPAEL4sGyGDXGmRkVMWEzi1ob3OQYyLZcfUHngU15kvoCN9JB9nM"
};
