import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
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

var getAllItems = functions.httpsCallable("getAllItems");
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
          {row.item}
        </TableCell>
        <TableCell align="right">{row.total}</TableCell>
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
                    <TableCell>Quantity</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align="right">Comment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.details.map((detailsRow) => (
                    <TableRow key={detailsRow.location}>
                      <TableCell>{detailsRow.quantity}</TableCell>
                      <TableCell component="th" scope="row">
                        {detailsRow.location}
                      </TableCell>
                      <TableCell align="right">{detailsRow.comment}</TableCell>
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
    item: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    details: PropTypes.arrayOf(
      PropTypes.shape({
        quantity: PropTypes.number.isRequired,
        location: PropTypes.string.isRequired,
        comment: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

function compareSummedItems(summedItem, otherSummedItem) {
  if (summedItem.item < otherSummedItem.item) {
    return -1;
  }
  if (summedItem.item > otherSummedItem.item) {
    return 1;
  }
  return 0;
}

export default function Summary() {
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
          items.reduce((c, { item, quantity, location, comment }) => {
            c[item] = c[item] || { item, total: 0 };
            c[item].total += quantity;
            if (c[item].item === item) {
              if (!c[item].details) {
                c[item].details = new Array();
                c[item].details.push({ item, quantity, location, comment });
              } else {
                c[item].details.push({ item, quantity, location, comment });
              }
            }
            return c;
          }, {})
        );
        summedItems.sort(compareSummedItems);
        console.log("summarised items ", summedItems);
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
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <Row key={row.item} row={row} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </Container>
  );
}
