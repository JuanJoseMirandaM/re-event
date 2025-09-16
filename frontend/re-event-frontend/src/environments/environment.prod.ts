export const environment = {
  production: true,
  apiUrl: 'https://hbao3p4igi.execute-api.us-east-1.amazonaws.com/prod',
  cognitoConfig: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_mWrHDzEG4',
    userPoolClientId: '7pv095cq6naalh7ehmiuc5158l',
    domain: 'kinua-v2-auth-prod.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://main.d8cmoxb2lfk1k.amplifyapp.com/auth/callback',  // Reemplazar con tu IP real
    redirectSignOut: 'https://main.d8cmoxb2lfk1k.amplifyapp.com/auth/logout'    // Reemplazar con tu IP real
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
