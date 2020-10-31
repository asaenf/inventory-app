//attempt to mock firebase functions for use in unit test for Inventory
const firebase = jest.genMockFromModule("firebase");

firebase.initializeApp = jest.fn();

const data = [
  {
    id: "aaaa",
    item: "Gurka",
    quantity: 63,
    location: "nere",
  },
  {
    id: "bbbb",
    item: "Veg hamburgare",
    quantity: 2,
    location: "nere",
  },
  {
    id: "cccc",
    item: "Paprika",
    quantity: 1,
    location: "uppe",
  },
  {
    id: "dddd",
    item: "Paprika",
    quantity: 1,
    location: "aspöja",
  },
];

const getAllItemsFunction = jest.fn(() => {
  return Promise.resolve({
    data,
  });
});

const httpsCallable = jest.fn(() => getAllItemsFunction);

firebase.functions = jest.fn(() => ({
  httpsCallable,
}));

module.exports = firebase;
