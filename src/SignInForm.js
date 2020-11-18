import React, { useState } from "react";
import ErrorDialog from "./ErrorDialog.js";

import { useAuth } from "./use-auth.js";
import { useRouter } from "./use-router.js";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function SignInForm(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const classes = useStyles();

  let handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if (name === "email") {
      setEmail(value);
    }
    if (name === "password") {
      setPassword(value);
    }
  };

  let shiftErrorDialog = (isOpen) => {
    console.log("set error dialog: ", isOpen);
    if (!isOpen) {
      setError("");
      setErrorCode("");
    }
    setErrorDialogOpen(isOpen);
  };

  let triggerSignIn = (event) => {
    //needed for auth to work
    console.log("Logging in ", email);
    event.preventDefault();
    auth
      .signin(email, password)
      .then((result) => {
        console.log("Logged in");
        router.push("/inventory");
      })
      .catch((error) => {
        console.log("error logging in: ", error.message);
        setError(error.message);
        setErrorCode(error.code);
        shiftErrorDialog(true);
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <ErrorDialog
        open={errorDialogOpen}
        onClose={() => shiftErrorDialog(false)}
        error={error + ". Error code: " + errorCode}
      />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleInputChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={handleInputChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={triggerSignIn}
          >
            Sign In
          </Button>
        </form>
      </div>
    </Container>
  );
}

export default SignInForm;
