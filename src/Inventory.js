import React from "react";
import { forwardRef } from "react";
import MaterialTable from "material-table";

import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";

import ErrorDialog from "./ErrorDialog.js";
import firebase from "./FirebaseFunctions.js";

var functions = firebase.functions();

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

var getAllItems = functions.httpsCallable("getAllItems");
var addItem = functions.httpsCallable("addItem");
var updateItem = functions.httpsCallable("updateItem");
var deleteItem = functions.httpsCallable("deleteItem");
var getAllCategories = functions.httpsCallable("getAllCategories");

const collectionName = process.env.REACT_APP_FIRESTORE_TABLE;

class Inventory extends React.Component {
  constructor(props) {
    super(props);

    this.getTableData = this.getTableData.bind(this);
    this.getTableColumns = this.getTableColumns.bind(this);
    this.setState = this.setState.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.loadItems = this.loadItems.bind(this);
    this.setErrorDialogOpen = this.setErrorDialogOpen.bind(this);
    this.handleError = this.handleError.bind(this);
    this.categoryLookUp = this.categoryLookUp.bind(this);
    this.state = {
      items: [],
      categories: [],
      error: "",
      errorDialogOpen: false,
      dataLoaded: false,
    };
  }

  componentDidMount() {
    this.loadItems();
  }

  loadItems = function () {
    console.log("Getting all items from collection ", collectionName);
    getAllItems({ collectionName: collectionName })
      .then((result) => {
        // Read result of the Cloud Function.
        var items = result.data.items;
        console.log("Loaded items: ", items.length);
        this.setState({
          items: items,
        });
        console.log("Getting all categories");
        getAllCategories({}).then((result) => {
          var categories = result.data.categories;
          categories.sort((category, otherCategory) =>
            category.category < otherCategory.category
              ? -1
              : category.category > otherCategory.category
              ? 1
              : 0
          );
          console.log("Loaded categories: ", categories.length);
          this.setState({
            categories: categories,
            dataLoaded: true,
          });
        });
      })
      .catch((error) => {
        this.handleError(error);
      });
  };

  categoryLookUp = function () {
    var categoriesKeyValues = this.state.categories.reduce(function (
      keyValObject,
      currentCategory
    ) {
      //convert to an object with IDs as keys and categories as values
      keyValObject[currentCategory.id] = currentCategory.category;
      return keyValObject;
    },
    {});
    return categoriesKeyValues;
  };

  getTableColumns = function () {
    return [
      { title: "Product", field: "item", defaultSort: "asc" },
      { title: "Quantity", field: "quantity", type: "numeric" },
      { title: "Location", field: "location" },
      { title: "Comment", field: "comment" },
      {
        title: "Category",
        field: "category",
        lookup: this.categoryLookUp(),
        emptyValue: "",
      },
    ];
  };

  getTableData = function () {
    const items = this.state.items;
    return items;
  };

  handleError = function (error) {
    this.setState({
      error: error.message,
    });
    this.setErrorDialogOpen(true);
  };

  setErrorDialogOpen = function (isOpen) {
    console.log("set error dialog: ", isOpen);
    if (!isOpen) {
      this.setState({
        error: "",
      });
    }
    this.setState({
      errorDialogOpen: isOpen,
    });
  };

  render() {
    return (
      <Container component="main">
        {!this.state.dataLoaded && !this.state.errorDialogOpen ? (
          <CircularProgress />
        ) : (
          <div style={{ maxWidth: "100%" }}>
            <ErrorDialog
              open={this.state.errorDialogOpen}
              onClose={() => this.setErrorDialogOpen(false)}
              error={this.state.error}
            />
            <MaterialTable
              icons={tableIcons}
              columns={this.getTableColumns()}
              data={this.getTableData()}
              options={{
                actionsColumnIndex: -1,
                filtering: true,
                sorting: true,
              }}
              title=""
              editable={{
                onRowAdd: (newData) =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                      newData.collectionName = collectionName;
                      console.log("Adding item: ", newData);
                      addItem(newData)
                        .then((result) => {
                          // Read result of the Cloud Function.
                          var addedItem = result.data;
                          console.log("Item added ", addedItem);
                          const existingData = this.state.items.slice();
                          existingData.push(addedItem);
                          this.setState({
                            items: existingData,
                          });
                        })
                        .catch((error) => {
                          this.handleError(error);
                        });
                    }, 600);
                  }),

                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve) => {
                    console.log(
                      "Updating. New data ",
                      newData,
                      "old data ",
                      oldData
                    );
                    setTimeout(() => {
                      resolve();
                      newData.collectionName = collectionName;
                      updateItem(newData)
                        .then((result) => {
                          // Read result of the Cloud Function.
                          var updatedItem = result.data;
                          console.log("Item updated ", updatedItem);
                          const existingData = this.state.items.slice();
                          existingData[existingData.indexOf(oldData)] = newData;
                          this.setState({
                            items: existingData,
                          });
                        })
                        .catch((error) => {
                          this.handleError(error);
                        });
                    }, 600);
                  }),

                onRowDelete: (oldData) =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                      oldData.collectionName = collectionName;
                      deleteItem(oldData)
                        .then((result) => {
                          console.log("Item deleted ", oldData);
                          const existingData = this.state.items.slice();
                          existingData.splice(existingData.indexOf(oldData), 1);
                          this.setState({
                            items: existingData,
                          });
                        })
                        .catch((error) => {
                          this.handleError(error);
                        });
                    }, 600);
                  }),
              }}
            />
          </div>
        )}
      </Container>
    );
  }
}

export default Inventory;
