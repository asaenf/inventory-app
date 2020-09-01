// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
const chai = require('chai');
const assert = chai.assert;

// Sinon is a library used for mocking or verifying function calls in JavaScript.
const sinon = require('sinon');

const firebase = require('firebase-admin');
const test = require('firebase-functions-test')({
  databaseURL: 'https://inventoryapp-unit-test-project.firebaseio.com',
  projectId: 'inventoryapp-unit-test-project',
}, __dirname +'/service-account-credentials.json');

var bodyParser = require('body-parser')

describe('Cloud Functions', () => {
  let myFunctions;
  let db;

  before(() => {
    // Require index.js and save the exports inside a namespace called myFunctions.
    // This includes our cloud functions, which can now be accessed at myFunctions.functionName
    myFunctions = require('../index.js');
    db = firebase.firestore();
  });

  after(() => {
    // Do cleanup tasks.
    test.cleanup();
  });

  describe('getItem', () => {

      let jsonSpy, res, status;
      beforeEach(() => {
        jsonSpy = sinon.spy(bodyParser.json());
      });
    it('should get item', (done) => {
    db.collection('items').doc("pear").delete();
    db.collection("items").doc('pear').set({
        location: 'home',
        quantity: 2
    }).then(function() {
        console.log("Document successfully written!");
       
          // A fake request object
          const req = {method: 'GET',
            get: (header) => {return 'application/json'},
            body: {item: 'pear'}
            };
          //resp object
          const res = {
          status: (code) => {
              assert.equal(code, 200);
              done();
            },
            json : jsonSpy()
            };

          // Invoke addItem with our fake request and response objects. This will cause the
          // assertions in the response object to be evaluated.
          myFunctions.getItem(req, res);
          expect(status.calledOnce).to.be.true;
          expect(status).to.equal(200);
          expect(json.calledOnce).to.be.true;
          expect(json.message).to.equal("Invalid Params");
    })
//    .catch(function(error){
//        assert.fail(error);
//        done();
//      });
    });
  });

function getJson(){
return bodyParser.json();
}
//  describe('addItem', () => {
//    it('should add item', (done) => {
//      db.collection('items').remove();
//      // A fake request object, with req.query.text set to 'input'
//      const req = {method: 'PUT',
//        get: (header) => {return 'application/json'},
//        body:{item: 'orange', location: 'home', quantity : 2 }};
//
//      const res = {
//      status: (code) => {
//          assert.equal(code, 200);
//          done();
//        },
//        json: (resp) => {
//          assert.equal(resp, {item: 'orange', location: 'home', quantity : 2});
//          done();
//        }
//      };
//
//      // Invoke addItem with our fake request and response objects. This will cause the
//      // assertions in the response object to be evaluated.
//      return myFunctions.addItem(req, res).then(() =>{
//
//      var docRef =  db.collection('items').doc(item);
//      docRef.get().then(function(doc) {
//            assert.equal({id: doc.id, ...doc.data()}, {item: 'orange', location: 'home', quantity : 2});
//            done();
//      return;
//      }).catch(function (error){
//                   assert.fail;
//                   done();
//              });
//      }).catch(function (error){
//           assert.fail;
//           done();
//      });
//    });
//  });
})
