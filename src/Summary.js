import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { forwardRef } from "react";
import MaterialTable from "material-table";

import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";

import ErrorDialog from "./ErrorDialog.js";
import firebase from "./FirebaseFunctions.js";

var functions = firebase.functions();

var getAllItems = functions.httpsCallable("getAllItems");

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const tableIcons = {
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
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
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const collectionName = process.env.REACT_APP_FIRESTORE_TABLE;

export default function Summary() {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  useEffect(() => {
    console.log(
      "Getting all items for summary from collection ",
      collectionName
    );
    getAllItems({ collectionName: collectionName })
      .then((result) => {
        // Read result of the Cloud Function.
        var items = result.data.items;
        console.log("calculating total of items ", items);
        var summedItems = Object.values(
          items.reduce((c, { item, quantity }) => {
            c[item] = c[item] || { item, quantity: 0 };
            c[item].quantity += quantity;
            return c;
          }, {})
        );
        setData(summedItems);
        setDataLoaded(true);
      })
      .catch((error) => {
        console.log("error getting data: ", error.message);
        setError(error.message);
        setErrorCode(error.code);
        shiftErrorDialog(true);
      });
  });

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
            columns={[
              { title: "Product", field: "item", defaultSort: "asc" },
              { title: "Total", field: "quantity", type: "numeric" },
            ]}
            data={data}
            options={{
              filtering: true,
              sorting: true,
            }}
            title="Summary"
          />
        </div>
      )}
    </Container>
  );
}
