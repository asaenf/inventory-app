import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

import ErrorDialog from "./ErrorDialog.js";
import firebase from "./FirebaseFunctions.js";

var functions = firebase.functions();
var performance = firebase.performance();

var getAllItems = functions.httpsCallable("getAllItems");
var getAllCategories = functions.httpsCallable("getAllCategories");

const collectionName = process.env.REACT_APP_FIRESTORE_TABLE;

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.category}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              <Table size="small" aria-label="details">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.details.map((detailsRow) => (
                    <TableRow key={detailsRow.itemName}>
                      <TableCell>{detailsRow.itemName}</TableCell>
                      <TableCell>{detailsRow.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    category: PropTypes.string.isRequired,
    details: PropTypes.arrayOf(
      PropTypes.shape({
        itemName: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

function compareCategory(category, otherCategory) {
  if (category.category < otherCategory.category) {
    return -1;
  }
  if (category.category > otherCategory.category) {
    return 1;
  }
  return 0;
}

export default function SummaryByCategory() {
  const [data, setData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  useEffect(() => {
    console.log("Getting all categories");
    const t = performance.trace("SummaryByCategory.gettingAllCategories");
    t.start();
    getAllCategories({})
      .then((result) => {
        var categoriesResponse = result.data.categories;
        var categoryKeyValue = categoriesResponse.reduce(
          (mapped, { id, category }) => {
            mapped[id] = category;
            return mapped;
          },
          {}
        );
        console.log("Using categories ", categoryKeyValue);
        console.log(
          "Getting all items for summary from collection ",
          collectionName
        );
        getAllItems({ collectionName: collectionName }).then((result) => {
          const t2 = performance.trace("SummaryByCategory.getAllItems");
          t2.start();
          // Read result of the Cloud Function.
          var items = result.data.items;
          console.log("grouping by category and calculating total of items ");
          //group by category so we sum within each category after
          //key -> value(list)
          var groupByCategory = items.reduce((grouped, item) => {
            if (item.category) {
              var categoryValue = categoryKeyValue[item.category];
              grouped[categoryValue] = [
                ...(grouped[categoryValue] || []),
                item,
              ];
            } else {
              //category undefined
              grouped[""] = [...(grouped[""] || []), item];
            }
            return grouped;
          }, {});
          let summedByCategories = [];
          for (let [cat, items] of Object.entries(groupByCategory)) {
            if (typeof cat == "function") continue;
            let summedByCategory = {};
            console.log(cat, items);
            var summed = items.reduce((summedByItem, currentItem) => {
              var itemName = currentItem.item;
              var itemQuantity = currentItem.quantity;
              summedByItem[itemName] = summedByItem[itemName] || {
                itemName,
                total: 0,
              };
              summedByItem[itemName].total += itemQuantity;
              return summedByItem;
            }, {});
            summedByCategory.category = cat;
            summedByCategory.details = Object.values(summed);
            summedByCategories.push(summedByCategory);
          }
          summedByCategories.sort(compareCategory);
          setData(summedByCategories);
          setDataLoaded(true);
          t2.stop();
        });
      })
      .catch((error) => {
        console.log("error getting data: ", error.message);
        setError(error.message);
        setErrorCode(error.code);
        shiftErrorDialog(true);
      });
    t.stop();
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
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Category</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <Row key={row.itemName} row={row} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </Container>
  );
}
