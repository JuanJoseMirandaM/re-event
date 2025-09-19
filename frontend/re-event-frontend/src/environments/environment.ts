export const environment = {
  production: false,
  apiUrl: 'https://fp2p1odzcd.execute-api.us-east-1.amazonaws.com/dev',
  cognitoConfig: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_c3QKPmyRW',
    userPoolClientId: '1q7h0dh9324va0j7q6g03bvm31',
    domain: 'kinua-auth-dev.auth.us-east-1.amazoncognito.com',
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
  vapidKey: "BPQV-lieDnlXX6eTj85i0XbNwhsjRXYcXUcTPAEL4sGyGDXGmRkVMWEzi1ob3OQYyLZcfUHngU15kvoCN9JB9nM",
  cloudfrontUrl: "https://d3jqv6vhm0wiae.cloudfront.net",
  bucketNameAws: "kinua-aws-community-day-bolivia-2025-dev",
  collection_id: "kinua-faces-dev"
};
