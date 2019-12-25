import React from 'react';
import './Login.css';
import { withRouter } from 'react-router-dom';
import Component from '@reactions/component';
import {TextInputField, toaster} from "evergreen-ui";
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import MyLocal from '../../services/MyLocal';
import SyncService from "../../services/SyncService";


const apiUrl = 'http://shopghapi-env.uk8emku5hg.eu-central-1.elasticbeanstalk.com';


async function getUserCompanyFromLocal(database, user, company) {
	return database.collections.get('users_companies')
		.query(Q.where('user_id', user.id), Q.where('company_id', company.id)).fetch();
}

async function getUserFromLocal(database, username, password) {
	return database.collections.get('users')
		.query(Q.where('username', username), Q.where('password', password)).fetch();
}

async function getUsersFromLocal(database) {
	return database.collections.get('users').query().fetch();
}


const Login = (props) => {
	const { history } = props;
	const database = useDatabase();


	if (MyLocal.companyCode && MyLocal.userId) {
		history.push(`${MyLocal.companyCode}/home`);
	}

	const login = async ({username, password, shopCode}) => {
		if (password.length < 6 || username.length === 0) {
			toaster.warning('Password or username is incorrect');
			return;
		}


		// try to get company from local db
		let company = await database.collections.get('companies')
			.query(Q.where('code', shopCode)).fetch();
		if (company.length === 1) {
			company = company[0];
		}


		if (!company || company.length < 1) { // company is not on local db, get from api
			const companiesResponse = await fetch(`${apiUrl}/companies?code=${shopCode}`, {
				headers: {'Content-Type': 'application/json'},
			});
			const companiesFromAPI = await companiesResponse.json();
			company = companiesFromAPI.data[0];
		}

		if (company && company.code === shopCode) {
			// if company code is correct, sync
			SyncService.sync(company, database, '').then(async () => {
				let user = await getUserFromLocal(database, username, password);
				if (user.length === 1) {
					user = user[0];
				} else {
					SyncService.sync(company, database, '').then(async () => {
						user = await getUserFromLocal(database, username, password);
						if (user.length === 1) {
							user = user[0];
						}
					});
				}

				if (!user || user.length < 1) {
					toaster.danger(`Could not find user. Ensure your credentials are correct`);
					return;
				} else {
					/*
					const usersResponse = await fetch(`${apiUrl}/users?username=${username}`, {
						headers: { 'Content-Type': 'application/json' }
					});
					const usersFromAPI = await usersResponse.json();
					user = usersFromAPI.data[0];
					*/
					if (user && user.username === username && user.password === password) {
						let userCompany = await getUserCompanyFromLocal(database, user, company);
						if (userCompany.length === 1) {
							userCompany = userCompany[0];
						} else {
							SyncService.sync(company, database, '').then(async () => {
								userCompany = await getUserCompanyFromLocal(database, user, company);
								if (userCompany.length === 1) {
									userCompany = userCompany[0];
								}
							});
							/*
							const userCompaniesResponse = await fetch(`${apiUrl}/users-companies?user_id=${user.id}&company_id=${company.id}`,{
								headers: { 'Content-Type': 'application/json' },
							});
							const userCompaniesFromApi = await userCompaniesResponse.json();
							userCompany = userCompaniesFromApi.data[0];
							*/
						}
						if (userCompany && userCompany.userId === user.id && userCompany.companyId === company.id) {
							toaster.success(`Successfully logged in ${user.name}`);
							MyLocal.setSession(user, company);
							history.push('/');
							// window.location.reload();
							//code before the pause
							setTimeout(function(){
								window.location.reload();
							}, 2000);
						}
					} else {
						toaster.danger(`Username or password is wrong. Try again`);
						return;
					}
				}
			});
		} else {
			toaster.danger(`There is no shop with code ${shopCode}`);
			return;
		}
	};



	return (
		<div>
			<Component initialState={{ isShown: false, username: '', password: '', shopCode: ''}}>
				{({ state, setState }) => (
					<React.Fragment>
						<div id="form-area">
								<h1 id="heading">Welcome to Shop Master</h1>
								<div id="login-form">
									<div className="row">
										<TextInputField
											label="Shop code"
											name="shopCode"
											value={state.shopCode}
											onChange={(e) => setState({ shopCode: e.target.value })}
											placeholder="Shop code"
										/>
									</div>
									<div className="row">
										<TextInputField
											label="Username"
											name="username"
											value={state.username}
											onChange={(e) => setState({ username: e.target.value })}
											placeholder="Username"
										/>
									</div>
									<div className="row">
										<TextInputField
											label='Password'
											name="password"
											placeholder="Password"
											value={state.password}
											onChange={(e) => setState({ password: e.target.value })}
											type="password"
										/>
									</div>
									<div className="row center-text">
										<button onClick={() => login(state)}>Login</button>
									</div>
								</div>
						</div>
					</React.Fragment>
				)}
			</Component>
		</div>
	);
};

export default withRouter(Login);
