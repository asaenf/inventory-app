//// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
//const chai = require("chai");
//const assert = chai.assert;
//
//// Sinon is a library used for mocking or verifying function calls in JavaScript.
//const sinon = require("sinon");
//
//const firebase = require("firebase-admin");
//const test = require("firebase-functions-test")(
//  {
//    databaseURL: "https://inventoryapp-unit-test-project.firebaseio.com",
//    projectId: "inventoryapp-unit-test-project",
//  },
//  __dirname + "/service-account-credentials.json"
//);
//
//const admin = require("firebase-admin");
//
//function insertTestData(item, location, quantity, collection) {
//  return collection
//    .add({
//      item: item,
//      location: location,
//      quantity: quantity,
//    })
//    .then(function (docRef) {
//      console.log("Document written with ID: ", docRef.id);
//    })
//    .catch(function (error) {
//      console.error("Error adding document: ", error);
//    });
//}
//
//describe("Cloud Functions", () => {
//  let myFunctions;
//  let db;
//  let collection;
//  let wrapGetItem;
//  let wrapGetAllItems;
//
//  before(() => {
//    // Require index.js and save the exports inside a namespace called myFunctions.
//    // This includes our cloud functions, which can now be accessed at myFunctions.functionName
//    myFunctions = require("../index.js");
//    db = firebase.firestore();
//    collection = db.collection("items");
//    wrapGetItem = test.wrap(myFunctions.getItem);
//    wrapGetAllItems = test.wrap(myFunctions.getAllItems);
//    //insert data
//    insertTestData("pear", "home", 2, collection);
//    insertTestData("apple", "home", 1, collection);
//  });
//
//  after(() => {
//    // Do cleanup tasks.
//    test.cleanup();
//  });
//
//  describe("getItem", () => {
//    let jsonSpy, res, status;
//    it("should get existing item", (done) => {
//      const data = { item: "pear", location: "home" };
//      wrapGetItem(data, {
//        auth: {
//          uid: "testUser",
//        },
//      }).then((i) => {
//        console.log("HERE");
//        assert.equal({ location: "home", quantity: 2, item: "pear" }, i);
//        done();
//      });
//    });
//  });
//});
