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

exports.getAllItems = functions.https.onCall((data, context) => {
  console.log("Getting all documents, collectionName ", data.collectionName);
  const collectionName = getCollectionName(data.collectionName);
  var itemCollection = db.collection(collectionName);

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
  console.log("Add item, collection name: ", data.collectionName);
  const collectionName = getCollectionName(data.collectionName);
  var itemCollection = db.collection(collectionName);

  const item = data.item;
  const location = data.location || "";
  const quantity = data.quantity;
  const comment = data.comment || "";
  const category = data.category || "";
  validateRequestBody(item, quantity);

  var exists = false;
  return itemCollection
    .where("item", "==", item)
    .where("location", "==", location)
    .where("comment", "==", comment)
    .where("category", "==", category)
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
            comment: comment,
            category: category,
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
                  comment: docData.comment,
                  category: docData.category,
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
  console.log("Update item, collection name: ", data.collectionName);
  const collectionName = getCollectionName(data.collectionName);
  var itemCollection = db.collection(collectionName);

  const id = data.id;
  if (!id) {
    throw new functions.https.HttpsError("invalid-argument", "No id");
  }
  const item = data.item;
  const location = data.location || "";
  const quantity = data.quantity;
  const comment = data.comment || "";
  const category = data.category || "";
  validateRequestBody(item, quantity);

  console.log("Updating item with id", id);
  return itemCollection
    .doc(id)
    .update({
      location: location,
      quantity: quantity,
      item: item,
      comment: comment,
      category: category,
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
            comment: docData.comment,
            category: docData.category,
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
  console.log("Delete item, collection name: ", data.collectionName);
  const collectionName = getCollectionName(data.collectionName);
  var itemCollection = db.collection(collectionName);

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

exports.getAllCategories = functions.https.onCall((data, context) => {
  console.log("Getting all categories,  ");
  var categoryCollection = db.collection("categories");

  return categoryCollection
    .get()
    .then((querySnapshot) => {
      const categoryList = [];
      querySnapshot.forEach((doc) => {
        categoryList.push({ id: doc.id, ...doc.data() });
      });
      console.log("Found ", categoryList.length, " categories");
      return { categories: categoryList };
    })
    .catch(function (error) {
      console.log("Error getting documents:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error getting all category documents: " + error
      );
    });
});

function getCollectionName(collectionName) {
  console.log("getCollectionName input:", collectionName);
  if (!collectionName || collectionName === "") {
    let error = "Expected property: collectionName";
    console.log("Error: ", error);
    throw new Error(error);
  }
  console.log("getCollectionName return:", collectionName);
  return collectionName;
}

function validateRequestBody(item, quantity) {
  if (!item) {
    let error = "Expected property: item";
    console.log("Error: ", error);
    throw new Error(error);
  }
  if (quantity === undefined) {
    let error = "Expected property: quantity";
    console.log("Error: ", error);
    throw new Error(error);
  }
  return;
}
