export interface PushNotificationConfig {
  vapidPublicKey: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export const pushConfig: PushNotificationConfig = {
  vapidPublicKey: 'BLAXtFadTrmSibLbX6fcFbLQw7K_LZ8pXt34W3djoTVQmrNgzoRapc7ZJSZWua_ZMG3SXnk_vG-I5NEfBmTv01o',
  // firebaseConfig: {
  //   apiKey: 'tu-api-key',
  //   authDomain: 'tu-proyecto.firebaseapp.com',
  //   projectId: 'tu-proyecto',
  //   storageBucket: 'tu-proyecto.appspot.com',
  //   messagingSenderId: '123456789',
  //   appId: 'tu-app-id'
  // }
};

// Para usar Firebase Cloud Messaging (FCM) en lugar de Web Push API
export const useFirebase = false;
