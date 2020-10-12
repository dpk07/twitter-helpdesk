import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import TwitterLogin from "./components/auth/TwitterLogin";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";
class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path="/" component={Landing} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <PrivateRoute exact path="/list" component={TwitterLogin} />
        </div>
      </Router>
    );
  }
}
export default App;
