const firebase = require("firebase");
// Required for side-effects
require("firebase/functions");

firebase.initializeApp({
  //The Firebase config object contains unique, but non-secret identifiers for your Firebase project.
  //https://firebase.google.com/docs/projects/learn-more#config-files-objects
  apiKey: "AIzaSyCuWFr0BZjE-wTQz__fElsgwk4BQPBk-60",
  authDomain: "### FIREBASE AUTH DOMAIN ###",
  projectId: "inventoryapp-276220",
  databaseURL: "https://inventoryapp.firebaseio.com",
});

//when running locally uncomment
//firebase.functions().useFunctionsEmulator("http://localhost:5001");

export default firebase;
