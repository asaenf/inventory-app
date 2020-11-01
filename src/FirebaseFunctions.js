const firebase = require("firebase");
// Required for side-effects
require("firebase/functions");
firebase.initializeApp({
//The Firebase config object contains unique, but non-secret identifiers for your Firebase project.
  apiKey: "AIzaSyCuWFr0BZjE-wTQz__fElsgwk4BQPBk-60",
  authDomain: "### FIREBASE AUTH DOMAIN ###",
  projectId: "inventoryapp-276220",
  databaseURL: "https://inventoryapp.firebaseio.com",
});

//firebase.functions().useFunctionsEmulator("http://localhost:5001");

// Initialize Cloud Functions through Firebase
var functions = firebase.functions();

export default functions;
