// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
const firebase = require('firebase-admin');
firebase.initializeApp();

var db = firebase.firestore();

exports.getItem = functions.https.onRequest(async (req, res) => {

    console.log("res: ", res);
    validateRequestMethodAndContentType("GET", req, res)

    const item = req.body.item;
    if(!item){
       return res.json({"error":"No item supplied"}).status(400).end();
    }

    var docRef = await db.collection('items').doc(item);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            return res.status(200).json({id: doc.id, ...doc.data()}).end();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            return res.status(404).json({"error":"No such document!"}).end();
        }
    }).catch(function(error) {
          console.log("Error getting document:", error);
          return res.status(500).json({"error":"Error getting document: "+ error}).end();
     });
});

exports.getAllItems = functions.https.onRequest(async (req, res) => {

    validateRequestMethodAndContentType("GET", req, res);
    const itemList = [];
    const items = await db.collection('items').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            itemList.push({ id: doc.id, ...doc.data() });
        });
        console.log("Found ", itemList.length, " items");
        return res.status(200).json(itemList).end();
    }).catch(function(error) {
           console.log("Error getting documents:", error);
           return res.status(500).json({"error":"Error getting documents: "+ error}).end();
           });
});

exports.addItem = functions.https.onRequest(async (req, res) =>{

    validateRequestMethodAndContentType("PUT", req, res);
    item = req.body.item;
    location = req.body.location;
    quantity = req.body.quantity;
    validateRequestBody(item, quantity, location);

    var docRef = await db.collection('items').doc(item);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            return res.status(200).json({id: doc.id, ...doc.data()}).end();
        }
         throw new Error("Illegal state");
        }).catch(function(error){
          console.log("Unable to check if item exists: ", error);
          return res.status(500).json({"error":"Unable to check if item exists: "+ error}).end();
        });
    db.collection("items").doc(item).set({
        location: location,
        quantity: quantity
    }).then(function() {
        console.log("Document successfully written!");
        return res.status(200).json(req.body).end();
    }).catch(function(error){
        console.log("Error adding item:", error);
        return res.status(500).json({"error":"Error adding item: "+ error}).end();
      });
});

exports.updateItem = functions.https.onRequest(async (req, res) =>{

        validateRequestMethodAndContentType("POST", req, res);

        item = req.body.item;
        location = req.body.location;
        quantity = req.body.quantity;
        validateRequestBody(item, quantity, location);

        db.collection("items").doc(item).set({
            location: location,
            quantity: quantity
        }, { merge: true })
        .then(function() {
            console.log("Document successfully written!");
            return res.status(200).json(req.body).end();
        }).catch(function(error){
         console.log("Error updating item:", error);
         return res.status(500).json({"error":"Error updating item: "+ error}).end();
    });

});

exports.deleteItem = functions.https.onRequest(async (req, res) =>{
        validateRequestMethodAndContentType("DELETE", req, res);
        item = req.body.item;
        validateRequestBody(item, 1, "any");

        db.collection("items").doc(item).delete().then(function() {
            console.log("Document successfully deleted!");
            return res.status(200).end();
        }).catch(function(error){
           console.log("Error deleting item:", error);
          return res.status(500).json({"error":"Error deleting item: "+ error}).end();
         });

});

function validateRequestMethodAndContentType(expected, req, res){
    if(req.method!==expected){
        let error = "Unexpected request method. Expected: "+expected;
        console.log("Error: ", error);
        return res.status(400).json({"error": error}).end();
    }
    if(!req.get('content-type') || req.get('content-type')!=="application/json"){
        let error = "Unexpected request content type. Expected: application/json";
        console.log("Error: ", error);
        return res.status(400).json({"error":error}).end();
    }
    return;
}

function validateRequestBody(item, quantity, location){
    if(!location){
        let error = "Expected property location";
        console.log("Error: ", error);
        return res.status(400).json({"error":error}).end();
    }
    if(!item){
        let error = "Expected property item";
        console.log("Error: ", error);
        return res.status(400).json({"error":error}).end();
    }
    if(quantity === undefined){
        let error = "Expected property quantity";
        console.log("Error: ", error);
        return res.status(400).json({"error":error}).end();
    }
    return;
}