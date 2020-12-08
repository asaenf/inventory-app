import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";

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

var getAllItems = functions.httpsCallable("getAllItems");
var deleteItem = functions.httpsCallable("deleteItem");
var addItem = functions.httpsCallable("addToBuyItem");

const collectionName = process.env.REACT_APP_FIRESTORE_TABLE_TO_BUY;

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
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

export default function ToBuyList() {
  const [data, setData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  useEffect(() => {
    getAllItems({ collectionName: collectionName })
      .then((result) => {
        // Read result of the Cloud Function.
        var items = result.data.items;
        setData(items);
        setDataLoaded(true);
      })
      .catch((error) => {
        console.log("error getting data: ", error.message);
        setError(error.message);
        setErrorCode(error.code);
        shiftErrorDialog(true);
      });
  }, []);

  let shiftErrorDialog = (isOpen) => {
    console.log("set error dialog: ", isOpen);
    if (!isOpen) {
      setError("");
      setErrorCode("");
    }
    setErrorDialogOpen(isOpen);
  };

  return (
    <Container component="main">
      {!dataLoaded ? (
        <CircularProgress />
      ) : (
        <div style={{ maxWidth: "100%" }}>
          <ErrorDialog
            open={errorDialogOpen}
            onClose={() => shiftErrorDialog(false)}
            error={error + ". Error code: " + errorCode}
          />
          <MaterialTable
            icons={tableIcons}
            columns={[{ title: "Product", field: "item", defaultSort: "asc" }]}
            data={data}
            options={{
              actionsColumnIndex: -1,
              filtering: true,
              sorting: true,
              addRowPosition: "first",
            }}
            title="To buy"
            editable={{
              onRowAdd: (newData) =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve();
                    newData.collectionName = collectionName;
                    console.log(
                      "Adding item: ",
                      newData,
                      " Collection :",
                      collectionName
                    );
                    addItem(newData)
                      .then((result) => {
                        // Read result of the Cloud Function.
                        var addedItem = result.data;
                        console.log("Item added ", addedItem);
                        const existingData = data.slice();
                        existingData.push(addedItem);
                        setData(existingData);
                      })
                      .catch((error) => {
                        setError(error.message);
                        setErrorCode(error.code);
                        shiftErrorDialog(true);
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
                        console.log(
                          "Item deleted ",
                          oldData,
                          " Collection :",
                          collectionName
                        );
                        const existingData = data.slice();
                        existingData.splice(existingData.indexOf(oldData), 1);
                        setData(existingData);
                      })
                      .catch((error) => {
                        setError(error.message);
                        setErrorCode(error.code);
                        shiftErrorDialog(true);
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
