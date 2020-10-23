import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import Dropbox from "./containers/Dropbox";
import DropboxEdit from "./containers/DropboxEdit";


export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/signup">
        <Signup />
      </Route>
      <Route exact path="/dropbox/new">
        <Dropbox />
      </Route>
      <Route exact path="/dropbox/:id">
        <DropboxEdit />
      </Route>
      {/* Finally, catch all unmatched routes */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
