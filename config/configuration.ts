/* eslint-disable prettier/prettier */
export default () => ({
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY as string,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN as string,
    projectId: process.env.FIREBASE_PROJECT_ID as string,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: process.env.FIREBASE_MESSAGING_ID as string,
    appId: process.env.FIREBASE_APP_ID as string,
    firebaseDatabase: process.env.FIREBASE_DATABASE_URL as string,
  },
  postgres: {
    postgresDev: process.env.PG_CONNECTION_STRING_DEV as string,
    postgresProd: process.env.PG_CONNECTION_STRING_PROD as string,
  },
  nodeEnv: process.env.NODE_ENV,
  PORT: process.env.PORT,
});
