export const environment = {
  production: true,
  apiUrl: 'https://67e15rhdb7.execute-api.us-east-1.amazonaws.com/dev',
  graphqlUrl: 'https://b65pumrqendyhkpg2o2k6tto4a.appsync-api.us-east-1.amazonaws.com/graphql',
  cognitoConfig: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_koSnqucA2',
    userPoolClientId: '162d0f9irj230mhiuhhh2t3o8m',
    domain: 'reevent-auth-dev.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://re-event-rho.vercel.app/auth/callback',  // Reemplazar con tu IP real
    redirectSignOut: 'https://re-event-rho.vercel.app/auth/logout'    // Reemplazar con tu IP real
  },
  firebaseConfig: {
    apiKey: "AIzaSyAPgmfnx8zGQuShmjmA-QO_ulwueVZR42k",
    authDomain: "reevent-fcm.firebaseapp.com",
    projectId: "reevent-fcm",
    storageBucket: "reevent-fcm.firebasestorage.app",
    messagingSenderId: "145026622801",
    appId: "1:145026622801:web:c82d01ccbdc175619e9f70",
    measurementId: "G-DN6DXETYRM"
  },
  vapidKey: "BPQV-lieDnlXX6eTj85i0XbNwhsjRXYcXUcTPAEL4sGyGDXGmRkVMWEzi1ob3OQYyLZcfUHngU15kvoCN9JB9nM"
};
