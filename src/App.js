import React from "react";
import SignInForm from "./SignInForm.js";
import MainContainer from "./MainContainer.js";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ProvideAuth } from "./use-auth.js";

function App(props) {
  return (
    <ProvideAuth>
      <BrowserRouter>
        <Switch>
          <Route path="/inventory" component={MainContainer} />
          <Route path="/signin" component={SignInForm} />
        </Switch>
      </BrowserRouter>
    </ProvideAuth>
  );
}

export default App;
