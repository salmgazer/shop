import React from "react";
import "./App.scss";
import DatabaseProvider from "@nozbe/watermelondb/DatabaseProvider";
import database from "./model/database";
import Login from "./screens/login/Login";
import Control from "./screens/control/Control";
import Sales from "./screens/salesScreens/sales/Sales";
import Customers from "./screens/salesScreens/customers/Customers";
import Debtors from "./screens/salesScreens/debtors/Debtors";
import Products from "./screens/inventoryScreens/products/Products";
import Categories from "./screens/inventoryScreens/categories/Categories";
import Brands from "./screens/inventoryScreens/brands/Brands";
import Expenses from "./screens/expenditureScreens/expenditure/Expenses";
import ExpenseCategories from "./screens/expenditureScreens/categories/Categories";
import Settings from "./screens/settingsScreens/sync/Sync";
import Profile from "./screens/settingsScreens/profile/Profile";
import Team from "./screens/settingsScreens/team/Team";
import { toaster } from "evergreen-ui";
import {
  HashRouter as Router,
  Switch,
  Route,
  useLocation
} from "react-router-dom";
import Companies from "./screens/setup/companies/Companies";
import Users from "./screens/setup/users/Users";
import MyLocal from "./services/MyLocal";
import { Result, Button, Icon } from "antd";

function openNav(open) {
  const sideNav = document.getElementById("side-nav");
  const mainBody = document.getElementById("main-body");
  const drawerIcon = document.getElementById("drawer-button");
  if (open) {
    sideNav.style.display = "block";
    sideNav.style.transition = "0.4s";
    mainBody.style.width = "70%";
    drawerIcon.style.marginLeft = "-20px";
  } else {
    sideNav.style.display = "none";
    mainBody.style.width = "100%";
    drawerIcon.style.marginLeft = "0px";
  }
}

function NoMatch() {
  let location = useLocation();

  return (
    <Result
      status="404"
      title="404"
      subTitle={`Sorry, the page ${location.pathname} does not exist.`}
      extra={
        <Button type="primary" onClick={() => (window.location.href = "/")}>
          Back Home
        </Button>
      }
    />
  );
}

function setPageBackground(backgroundColor = "#DDEBF7") {
  document.body.style.backgroundImage = "none";
  document.body.style.backgroundColor = backgroundColor;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navShouldOpen: null,
      collapsed: false
    };

    this.DrawerIcon = this.DrawerIcon.bind(this);
  }

  DrawerIcon() {
    const iconType =
      !this.state.navShouldOpen === true || this.state.navShouldOpen === null
        ? "left-circle"
        : "right-circle";
    const iconColor =
      !this.state.navShouldOpen === true || this.state.navShouldOpen === null
        ? "orange"
        : "#09d3ac";

    return (
      <Icon
        id="drawer-button"
        style={{
          fontSize: "40px",
          color: iconColor
        }}
        className="hand-pointer"
        border="none"
        type={iconType}
        onClick={() => {
          this.setState({ navShouldOpen: !this.state.navShouldOpen });
          openNav(this.state.navShouldOpen);
        }}
      />
    );
  }

  setTitle(title) {
    document.title = title;
  }

  render() {
    let { companyCode } = MyLocal;
    const { companyName, companyId } = MyLocal;

    if (!MyLocal.sessionExists()) {
      const splitPath = window.location.pathname.split("/");
      companyCode = splitPath[1];
      if (
        companyCode.length > 0 &&
        splitPath[2] !== "companies" &&
        splitPath[2] !== "users"
      ) {
        toaster.warning(`Are you sure your shop code is ${companyCode} ?`);
        window.location.href = "/";
      }
    }

    return (
      <DatabaseProvider database={database}>
        <div className="App">
          <Router>
            <Switch>
              <Route
                exact
                path="/"
                render={() => {
                  this.setTitle("Login | Shop Master");
                  return <Login />;
                }}
              />
              <Route
                exact
                path={`/${companyCode}`}
                render={() => {
                  this.setTitle(`Login | ${companyName || "Shop Master"}`);
                  return <Login />;
                }}
              />

              <Route
                path={`/${companyCode}/home`}
                render={() => {
                  this.setTitle(
                    `Control Panel | ${companyName || "Shop Master"}`
                  );
                  setPageBackground("#F7F9FD");
                  return <Control />;
                }}
              />
              <Route
                path={`/${companyCode}/sales`}
                render={() => {
                  setPageBackground("#f4f5f7");
                  this.setTitle(`Sales | ${companyName}`);
                  return (
                    <Sales
                      DrawerIcon={this.DrawerIcon}
                      parentLocation="Sales"
                      modelName="sale"
                    />
                  );
                }}
              />
              <Route
                path={`/${companyCode}/customers`}
                render={() => {
                  setPageBackground("#f4f5f7");
                  this.setTitle(`Customers | ${companyName}`);
                  return (
                    <Customers
                      DrawerIcon={this.DrawerIcon}
                      parentLocation="Sales"
                      modelName="customer"
                    />
                  );
                }}
              />
							<Route
								path={`/${companyCode}/debtors`}
								render={() => {
									setPageBackground("#f4f5f7");
									this.setTitle(`Debtors | ${companyName}`);
									return (
										<Debtors
											DrawerIcon={this.DrawerIcon}
											parentLocation="Sales"
											modelName="debtor"
										/>
									);
								}}
							/>
              <Route
                path={`/${companyCode}/products`}
                render={() => {
                  setPageBackground("#f4f5f7");
                  this.setTitle(`Products | ${companyName}`);
                  return (
                    <Products
                      DrawerIcon={this.DrawerIcon}
                      parentLocation="Inventory"
                      modelName="product"
                    />
                  );
                }}
              />
              <Route
                path={`/${companyCode}/categories`}
                render={() => {
                  setPageBackground("#f4f5f7");
                  this.setTitle(`Categories | ${companyName}`);
                  return (
                    <Categories
                      DrawerIcon={this.DrawerIcon}
                      parentLocation="Inventory"
                      modelName="category"
                    />
                  );
                }}
              />
              <Route
                path={`/${companyCode}/brands`}
                render={() => {
                  setPageBackground("#f4f5f7");
                  this.setTitle(`Brands | ${companyName}`);
                  return (
                    <Brands
                      DrawerIcon={this.DrawerIcon}
                      parentLocation="Inventory"
                      modelName="brand"
                    />
                  );
                }}
              />
              <Route
                path={`/${companyCode}/expenses`}
                render={() => {
                  setPageBackground("#f4f5f7");
                  this.setTitle(`Expenses | ${companyName}`);
                  return (
                    <Expenses
                      DrawerIcon={this.DrawerIcon}
                      parentLocation="Expenditure"
                      modelName="expense"
                    />
                  );
                }}
              />
              <Route
                path={`/${companyCode}/expense_categories`}
                render={() => {
                  setPageBackground("#f4f5f7");
                  this.setTitle(`Categories of Expenses | ${companyName}`);
                  return (
                    <ExpenseCategories
                      DrawerIcon={this.DrawerIcon}
                      parentLocation="Expenditure"
                      modelName="expense_category"
                    />
                  );
                }}
              />
              <Route
                path={`/shoppers`}
                render={() => {
                  setPageBackground("#f4f5f7");
                  this.setTitle(`Users | ${companyName}`);
                  return (
                    <Users DrawerIcon={this.DrawerIcon} modelName="user" />
                  );
                }}
              />
							<Route
								path={`/kiosks`}
								render={() => {
									setPageBackground("#f4f5f7");
									this.setTitle(`Setup | ${companyName}`);
									return (
										<Companies
											DrawerIcon={this.DrawerIcon}
											parentLocation="Inventory"
											modelName="company"
										/>
									);
								}}
							/>
							<Route
								path={`/${companyCode}/sync`}
								render={() => {
									setPageBackground("#f4f5f7");
									this.setTitle(`Sync | ${companyName}`);
									return (
										<Settings DrawerIcon={this.DrawerIcon} modelName="settings" />
									);
								}}
							/>
							<Route
								path={`/${companyCode}/team`}
								render={() => {
									setPageBackground("#f4f5f7");
									this.setTitle(`Team | ${companyName}`);
									return (
										<Team DrawerIcon={this.DrawerIcon} modelName="team" />
									);
								}}
							/>
							<Route
								path={`/${companyCode}/profile`}
								render={() => {
									setPageBackground("#f4f5f7");
									this.setTitle(`Profile | ${companyName}`);
									return (
										<Profile DrawerIcon={this.DrawerIcon} modelName="settings" />
									);
								}}
							/>
              <Route path="*">
                <NoMatch />
              </Route>
            </Switch>
          </Router>
        </div>
      </DatabaseProvider>
    );
  }
}

export default App;
