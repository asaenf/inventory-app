import { React, Fragment, Link, useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Inventory from "./Inventory.js";
import Summary from "./Summary.js";
import { useRequireAuth } from "./use-require-auth.js";
import { useRouter } from "./use-router.js";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  button: {
    marginRight: theme.spacing(2),
    color: "white",
  },
  tab: {
    color: "white",
    indicator: "#D3D3D3",
  },
  title: {
    flexGrow: 1,
  },
}));

function MainPage(props) {
  const tab = props.activeTab;

  if (tab === 0) {
    console.log("Render inventory");
    return <Inventory />;
  } else {
    console.log("Render summary");
    return <Summary />;
  }
}

function MainContainer(props) {
  const auth = useRequireAuth();
  const router = useRouter();
  const classes = useStyles();
  const [tab, setTab] = useState(0);

  const handleTabClick = (event, newValue) => {
    setTab(newValue);
  };

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
      <div className={classes.root}>
        <AppBar position="sticky">
          <Toolbar>
            <Typography className={classes.title}>
              Signed in as {auth.user.email}
            </Typography>
            <Tabs value={tab} onChange={handleTabClick}>
              <Tab label="Inventory" className={classes.tab} />
              <Tab label="Summary" className={classes.tab} />
            </Tabs>
            <Button className={classes.button} onClick={() => auth.signout()}>
              Signout
            </Button>
          </Toolbar>
        </AppBar>
        <MainPage activeTab={tab} />
      </div>
    );
  }
}

export default MainContainer;
