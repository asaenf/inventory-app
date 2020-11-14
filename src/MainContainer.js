import { React, Fragment, Link } from "react";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import Inventory from "./Inventory.js";
import { useRequireAuth } from "./use-require-auth.js";
import { useRouter } from "./use-router.js";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  button: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function MainContainer(props) {
  const auth = useRequireAuth();
  const router = useRouter();
  const classes = useStyles();

  if (!auth.user) {
    console.log("User not authenticated, redirecting");
    return (
      <div className={classes.root}>
        <AppBar position="sticky">
          <Toolbar>
            <Button onClick={() => router.push("/signin")}>Signin</Button>
          </Toolbar>
        </AppBar>
      </div>
    );
  } else {
    console.log("Authenticated user ", auth.user.email);
    return (
      <div>
        <AppBar position="sticky">
          <Toolbar>
            <Typography className={classes.title}>
              Signed in as {auth.user.email}
            </Typography>
            <Button className={classes.button} onClick={() => auth.signout()}>
              Signout
            </Button>
          </Toolbar>
        </AppBar>
        <Inventory />
      </div>
    );
  }
}

export default MainContainer;
