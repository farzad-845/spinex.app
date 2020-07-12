import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import classnames from "classnames";

// styles
import useStyles from "./styles";

// components
import Header from "../Header";
import Sidebar from "../Sidebar";

// pages
import Items from "../../pages/items";
import AddItems from "../../pages/addItems";
import Settings from "../../pages/settings";
import Providers from "../../pages/providers";
import Dashboard from "../../pages/dashboard";
import AddProviders from "../../pages/addProviders";

// context
import { useLayoutState } from "../../context/LayoutContext";

function Layout(props) {
  var classes = useStyles();

  // global
  var layoutState = useLayoutState();

  return (
    <div className={classes.root}>
      <>
        <Header history={props.history} />
        <Sidebar />
        <div
          className={classnames(classes.content, {
            [classes.contentShift]: layoutState.isSidebarOpened,
          })}
        >
          <div className={classes.fakeToolbar} />
          <Switch>
            <Route path="/app/items" component={Items} />
            <Route path="/app/addItem" component={AddItems} />
            <Route path="/app/settings" component={Settings} />
            <Route path="/app/providers" component={Providers} />
            <Route path="/app/dashboard" component={Dashboard} />
            <Route path="/app/addProvider" component={AddProviders} />
          </Switch>
        </div>
      </>
    </div>
  );
}

export default withRouter(Layout);
