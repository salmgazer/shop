import React from 'react';
import './App.scss';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import database from "./model/database";
import Login  from './screens/login/Login';
import Control from "./screens/control/Control";
import Sales from "./screens/salesScreens/sales/Sales";
import Customers from "./screens/salesScreens/customers/Customers";
import Deptors from "./screens/salesScreens/debtors/Deptors";
import Products from "./screens/inventoryScreens/products/Products";
import Categories from "./screens/inventoryScreens/categories/Categories";
import Brands from "./screens/inventoryScreens/brands/Brands";
import {toaster} from "evergreen-ui";

import {
	BrowserRouter as Router,
	Switch,
	Route,
	useLocation,
} from 'react-router-dom';
import {Icon} from "evergreen-ui";
import Companies from "./screens/setup/companies/Companies";
import Users from "./screens/setup/users/Users";
import MyLocal from "./services/MyLocal";

function openNav(open) {
	const sideNav = document.getElementById('side-nav');
	const mainBody = document.getElementById('main-body');
	const drawerIcon = document.getElementById('drawer-button');
	if (open) {
		sideNav.style.display = 'block';
		sideNav.style.transition = '0.4s';
		mainBody.style.width = '70%';
		drawerIcon.style.marginLeft = '-20px';
	} else {
		sideNav.style.display = 'none';
		mainBody.style.width = '100%';
		drawerIcon.style.marginLeft = '0px';
	}
}


function NoMatch() {
	let location = useLocation();

	return (
		<div>
			<h3 style={{ textAlign: 'center' }}>
				No match for <code>{location.pathname}</code>
				<h4>Go back to <a href='/'>Home page</a></h4>
			</h3>
		</div>
	);
}

function setPageBackground(backgroundColor="#DDEBF7") {
	document.body.style.backgroundImage = 'none';
	document.body.style.backgroundColor = backgroundColor;
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			navShouldOpen: null
		};

		this.DrawerIcon = this.DrawerIcon.bind(this);
	}

	DrawerIcon() {
		const iconType = !this.state.navShouldOpen === true || this.state.navShouldOpen === null ? 'circle-arrow-left' : 'circle-arrow-right';
		const iconColor = !this.state.navShouldOpen  === true || this.state.navShouldOpen === null ? 'orange' : '#09d3ac' ;

		return(
			<Icon
				id="drawer-button"
				size={40}
				className='hand-pointer'
				color={iconColor}
				border='none'
				icon={iconType}
				onClick={() => {
					this.setState({ navShouldOpen: !this.state.navShouldOpen });
					openNav(this.state.navShouldOpen);
				}}
			/>
		)
	};

	setTitle(title) {
		document.title = title;
	}

	render() {
		let { companyCode } = MyLocal;
		const { companyName} = MyLocal;

		if (!MyLocal.sessionExists()) {
			const splitPath = window.location.pathname.split('/');
			companyCode = splitPath[1];
			if (companyCode.length > 0 && splitPath[2] !== 'companies' && splitPath[2] !== 'users') {
				toaster.warning(`Are you sure your shop code is ${companyCode} ?`);
				window.location.href = '/';
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
								this.setTitle('Login | Shop Master')
								return <Login />;
							}}
							/>
							<Route
								exact
								path={`/${companyCode}`}
								render={() => {
									this.setTitle(`Login | ${companyName || 'Shop Master'}`);
									return <Login />;
								}}
							/>

							<Route
								path={`/${companyCode}/home`}
								render={() => {
									this.setTitle(`Control Pabel | ${companyName} || 'Shop Master`);
									setPageBackground('#F7F9FD');
									return <Control />;
								}}
							/>
							<Route
								path={`/${companyCode}/sales`}
								render={() => {
									setPageBackground('#f4f5f7');
									this.setTitle(`Sales | ${companyName}`);
									return <Sales
										DrawerIcon={this.DrawerIcon}
										parentLocation='Sales'
										modelName='sale'
									/>;
								}}
							/>
							<Route
								path={`/${companyCode}/customers`}
								render={() => {
									setPageBackground('#f4f5f7');
									this.setTitle(`Customers | ${companyName}`);
									return <Customers
										DrawerIcon={this.DrawerIcon}
										parentLocation='Sales'
										modelName='customer'
									/>;
								}}
							/>
							<Route path={`/${companyCode}/debtors`}>
								<Deptors />
							</Route>
							<Route
								path={`/${companyCode}/products`}
								render={() => {
									setPageBackground('#f4f5f7');
									this.setTitle(`Products | ${companyName}`);
									return <Products
										DrawerIcon={this.DrawerIcon}
										parentLocation='Inventory'
										modelName='product'
									/>;
								}}
							/>
							<Route
								path={`/${companyCode}/categories`}
								render={() => {
									setPageBackground('#f4f5f7');
									this.setTitle(`Categories | ${companyName}`);
									return <Categories
										DrawerIcon={this.DrawerIcon}
										parentLocation='Inventory'
										modelName='category'
									/>;
								}}
							/>
							<Route
								path={`/${companyCode}/brands`}
								render={() => {
									setPageBackground('#f4f5f7');
									this.setTitle(`Brands | ${companyName}`);
									return <Brands
										DrawerIcon={this.DrawerIcon}
										parentLocation='Inventory'
										modelName='brand'
									/>;
								}}
							/>
							<Route
								path={`/${companyCode}/companies`}
								render={() => {
									setPageBackground('#f4f5f7');
									this.setTitle(`Setup | ${companyName}`);
									return <Companies
										DrawerIcon={this.DrawerIcon}
										parentLocation='Inventory'
										modelName='company'
									/>;
								}}
							/>
							<Route
								path={`/${companyCode}/users`}
								render={() => {
									setPageBackground('#f4f5f7');
									this.setTitle(`Users | ${companyName}`);
									return <Users
										DrawerIcon={this.DrawerIcon}
										modelName='user'
									/>;
								}}
							/>
							<Route path="*">
								<NoMatch/>
							</Route>
						</Switch>
					</Router>
				</div>
			</DatabaseProvider>
		);
	}
}

export default App;
