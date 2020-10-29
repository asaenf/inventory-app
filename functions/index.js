// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const firebase = require("firebase-admin");
firebase.initializeApp({
  apiKey: "AIzaSyCuWFr0BZjE-wTQz__fElsgwk4BQPBk-60",
  authDomain: "### FIREBASE AUTH DOMAIN ###",
  projectId: "inventoryapp-276220",
  databaseURL: "https://inventoryapp.firebaseio.com",
});

var db = firebase.firestore();

var itemCollection = db.collection("items");

exports.getItem = functions.https.onCall((data, context) => {
  const item = data.item;
  const location = data.location;
  if (!item || !location) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "No item/location supplied"
    );
  }
  console.log("item: ", item, " location ", location);
  const itemList = [];
  return itemCollection
    .where("item", "==", item)
    .where("location", "==", location)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        // doc.data() is never undefined for query doc snapshots
        itemList.push({ id: doc.id, ...doc.data() });
      });
      console.log("Found ", itemList.length, " items");
      return {
        items: itemList,
      };
    })
    .catch(function (error) {
      throw new functions.https.HttpsError(
        "internal",
        "Error getting document: " + error
      );
    });
});

exports.getItemById = functions.https.onCall((data, context) => {
  const id = data.id;
  if (!id) {
    throw new functions.https.HttpsError("invalid-argument", "No id");
  }
  var docRef = itemCollection.doc(id);
  var foundDoc = null;
  return docRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        return { id: doc.id, data: doc.data() };
      } else {
        console.log("No such document!");
        return {};
      }
    })
    .catch(function (error) {
      throw new functions.https.HttpsError(
        "internal",
        "Error getting document: " + error
      ).end;
    });
});

exports.getAllItems = functions.https.onCall((data, context) => {
  return db
    .collection("items")
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
        "Error getting documents: " + error
      );
    });
});

exports.addItem = functions.https.onCall((data, context) => {
  const item = data.item;
  const location = data.location;
  const quantity = data.quantity;
  validateRequestBody(item, quantity, location);

  const itemList = [];
  return itemCollection
    .where("item", "==", item)
    .where("location", "==", location)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        // doc.data() is never undefined for query doc snapshots
        itemList.push({ id: doc.id, ...doc.data() });
      });
      if (itemList.length > 1) {
        console.log("Matching items already exist: ", itemList.length);
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Document already exists"
        );
      } else {
        return db
          .collection("items")
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
                console.log("Document data:", doc.data());
                return { id: doc.id, data: doc.data() };
              })
              .catch(function (error) {
                throw new functions.https.HttpsError(
                  "internal",
                  "Error getting document: " + error
                ).end;
              });
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
            throw new functions.https.HttpsError(
              "internal",
              "Error adding document: " + error
            );
          });
      }
    })
    .catch(function (error) {
      throw new functions.https.HttpsError(
        "internal",
        "Error getting document: " + error
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
  return db
    .collection("items")
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
          console.log("Document data:", doc.data());
          return { id: doc.id, data: doc.data() };
        })
        .catch(function (error) {
          throw new functions.https.HttpsError(
            "internal",
            "Error getting document: " + error
          ).end;
        });
    })
    .catch(function (error) {
      console.error("Error updating document: ", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error updating document: " + error
      );
    });
});

exports.deleteItem = functions.https.onCall((data, context) => {
  const id = data.id;
  if (!id) {
    throw new functions.https.HttpsError("invalid-argument", "No id");
  }

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
        "Error deleting document: " + error
      );
    });
});

function validateRequestBody(item, quantity, location) {
  if (!location) {
    let error = "Expected property location";
    console.log("Error: ", error);
    //TODO
    return res.status(400).json({ error: error }).end();
  }
  if (!item) {
    let error = "Expected property item";
    console.log("Error: ", error);
    //TODO
    return res.status(400).json({ error: error }).end();
  }
  if (quantity === undefined) {
    let error = "Expected property quantity";
    console.log("Error: ", error);
    //TODO
    return res.status(400).json({ error: error }).end();
  }
  return;
}
