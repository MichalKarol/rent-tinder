import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { AuthenticationContext } from "../auth";
import { Login } from "./login";
import { Header } from "../components/Header";
import "./style.css";
import { Offers } from "../components/Offers";
import { Matches } from "../components/Matches";

export function AuthenticatedRoutes() {
  const auth = useContext(AuthenticationContext);

  return auth.token ? (
    <div className="auth-view">
      <Router>
        <div className="auth-header">
          <Header />
        </div>
        <div className="auth-content">
          <Switch>
            <Route path="/offers">
              <Offers />
            </Route>
            <Route path="/matches">
              <Matches />
            </Route>
            <Route path="*">
              <Redirect to="/offers" />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  ) : (
    <Login />
  );
}
