// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const firebase = require("firebase-admin");
firebase.initializeApp({
  //The Firebase config object contains unique, but non-secret identifiers for your Firebase project.
  //https://firebase.google.com/docs/projects/learn-more#config-files-objects
  apiKey: "AIzaSyCuWFr0BZjE-wTQz__fElsgwk4BQPBk-60",
  authDomain: "### FIREBASE AUTH DOMAIN ###",
  projectId: "inventoryapp-276220",
  databaseURL: "https://inventoryapp.firebaseio.com",
});

var db = firebase.firestore();

var itemCollectionHemma = db.collection("items");
var itemCollectionAspoja = db.collection("items-aspoja");
var itemCollectionTannas = db.collection("items-tannas");
var itemCollection = itemCollectionHemma;

exports.getAllItems = functions.https.onCall((data, context) => {
  console.log("Getting all documents");
  return itemCollection
    .get()
    .then((querySnapshot) => {
      const itemList = [];
      querySnapshot.forEach((doc) => {
        itemList.push({ id: doc.id, ...doc.data() });
      });
      console.log("Found ", itemList.length, " items");
      return { items: itemList };
    })
    .catch(function (error) {
      console.log("Error getting documents:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error getting all documents: " + error
      );
    });
});

exports.addItem = functions.https.onCall((data, context) => {
  const item = data.item;
  const location = data.location;
  const quantity = data.quantity;
  validateRequestBody(item, quantity, location);
  console.log("Adding item: ", item);

  var exists = false;
  return itemCollection
    .where("item", "==", item)
    .where("location", "==", location)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        exists = true;
      });
      if (exists) {
        console.log("Matching items already exist ");
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Item already exists"
        );
      } else {
        console.log("Item does not already exist, adding");
        return itemCollection
          .add({
            item: item,
            location: location,
            quantity: quantity,
          })
          .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            var writtenDoc = itemCollection.doc(docRef.id);
            return writtenDoc
              .get()
              .then(function (doc) {
                var docData = doc.data();
                console.log("Added document data:", docData);
                return {
                  id: doc.id,
                  item: docData.item,
                  location: docData.location,
                  quantity: docData.quantity,
                };
              })
              .catch(function (error) {
                throw new functions.https.HttpsError(
                  "internal",
                  "Error getting added item: " + error
                ).end;
              });
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
            throw new functions.https.HttpsError(
              "internal",
              "Error adding item: " + error
            );
          });
      }
    })
    .catch(function (error) {
      throw new functions.https.HttpsError(
        "internal",
        "Error adding item: " + error
      );
    });
});

exports.updateItem = functions.https.onCall((data, context) => {
  const id = data.id;
  if (!id) {
    throw new functions.https.HttpsError("invalid-argument", "No id");
  }
  const item = data.item;
  const location = data.location;
  const quantity = data.quantity;
  validateRequestBody(item, quantity, location);

  console.log("Updating item with id", id);
  return itemCollection
    .doc(id)
    .update({
      location: location,
      quantity: quantity,
      item: item,
    })
    .then(function () {
      console.log("Document successfully written!");
      var docRef = itemCollection.doc(id);
      return docRef
        .get()
        .then(function (doc) {
          var docData = doc.data();
          console.log("Updated document data:", docData);
          return {
            id: doc.id,
            item: docData.item,
            location: docData.location,
            quantity: docData.quantity,
          };
        })
        .catch(function (error) {
          throw new functions.https.HttpsError(
            "internal",
            "Error getting updated item: " + error
          ).end;
        });
    })
    .catch(function (error) {
      console.error("Error updating document: ", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error updating item: " + error
      );
    });
});

exports.deleteItem = functions.https.onCall((data, context) => {
  const id = data.id;
  if (!id) {
    throw new functions.https.HttpsError("invalid-argument", "No id");
  }
  console.log("request to delete document ", id);
  itemCollection
    .doc(id)
    .delete()
    .then(function () {
      console.log("Document successfully deleted!");
      return {};
    })
    .catch(function (error) {
      console.error("Error deleting document: ", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error deleting item: " + error
      );
    });
});

function validateRequestBody(item, quantity, location) {
  if (!location) {
    let error = "Expected property: location";
    console.log("Error: ", error);
    //TODO
    return res.status(400).json({ error: error }).end();
  }
  if (!item) {
    let error = "Expected property: item";
    console.log("Error: ", error);
    //TODO
    return res.status(400).json({ error: error }).end();
  }
  if (quantity === undefined) {
    let error = "Expected property: quantity";
    console.log("Error: ", error);
    //TODO
    return res.status(400).json({ error: error }).end();
  }
  return;
}
