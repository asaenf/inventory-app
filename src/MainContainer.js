import { React, Fragment, Link, useState } from "react";
import { Helmet } from "react-helmet";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Inventory from "./Inventory.js";
import Summary from "./Summary.js";
import SummaryByCategory from "./SummaryByCategory.js";
import ToBuyList from "./ToBuyList.js";
import { useRequireAuth } from "./use-require-auth.js";
import { useRouter } from "./use-router.js";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
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

const appInstance = process.env.REACT_APP_INSTANCE;

function MainPage(props) {
  const tab = props.activeTab;

  if (tab === 0) {
    console.log("Render inventory");
    return <Inventory />;
  } else if (tab === 1) {
    console.log("Render summary");
    return <Summary />;
  } else if (tab === 2) {
    console.log("Render summary by category");
    return <SummaryByCategory />;
  } else {
    console.log("Render to buy list");
    return <ToBuyList />;
  }
}

function MainContainer(props) {
  const auth = useRequireAuth();
  const router = useRouter();
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  const title = process.env.REACT_APP_TITLE;

  const handleTabClick = (event, newValue) => {
    setTab(newValue);
  };

  if (!auth.user) {
    console.log("User not authenticated, redirecting");
    return (
      <div className={classes.root}>
        <Helmet>
          <title>{title}</title>
        </Helmet>
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
      <Container className={classes.root}>
        <AppBar position="sticky">
          <Tabs
            value={tab}
            onChange={handleTabClick}
            variant="scrollable"
            scrollButtons="on"
            textColor="white"
          >
            <Tab label="Inventory" className={classes.tab} />
            <Tab label="Summary By Product" className={classes.tab} />
            <Tab label="Summary By Category" className={classes.tab} />
            {appInstance != "smido" && (
              <Tab label="To buy" className={classes.tab} />
            )}
          </Tabs>
        </AppBar>
        <MainPage activeTab={tab} />
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
      </Container>
    );
  }
}

export default MainContainer;
