const firebase = require("firebase");
require("firebase/functions");
require("firebase/performance");

const appInstance = process.env.REACT_APP_INSTANCE;
const apiKey = process.env.REACT_APP_API_KEY;
console.log(apiKey);
const authDomain = process.env.REACT_APP_AUTH_DOMAIN;
const databaseURL = process.env.REACT_APP_DATABASE_URL;
const projectId = process.env.REACT_APP_PROJECT_ID;
const storageBucket = process.env.REACT_APP_STORAGE_BUCKET;
const messagingSenderId = process.env.REACT_APP_MESSAGING_SENDER_ID;
const appId = process.env.REACT_APP_APP_ID;
const measurementId = process.env.REACT_APP_MEASUREMENT_ID;

firebase.initializeApp({
  //The Firebase config object contains unique, but non-secret identifiers for your Firebase project.
  //https://firebase.google.com/docs/projects/learn-more#config-files-objects
  apiKey: apiKey,
  authDomain: authDomain,
  databaseURL: databaseURL,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId,
});

//when running locally uncomment
//firebase.functions().useFunctionsEmulator("http://localhost:5001");

export default firebase;
