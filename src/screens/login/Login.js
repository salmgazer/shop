import React from 'react';
import './Login.css';
import { withRouter } from 'react-router-dom';
import Component from '@reactions/component';
import {TextInputField, toaster} from "evergreen-ui";
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import MyLocal from '../../services/MyLocal';



const Login = (props) => {
	const { history } = props;
	const database = useDatabase();


	if (MyLocal.companyCode && MyLocal.userId) {
		history.push(`${MyLocal.companyCode}/home`);
	}

	const login = async ({username, password}) => {
		if (password.length < 6 || username.length === 0) {
			toaster.warning('Password or username is incorrect');
			return;
		}

		let user = await database.collections.get('users')
			.query(Q.where('username', username), Q.where('password', password)).fetch();

		if (!user || user.length < 1) {
			toaster.danger('User does not exist. Check your login details');
			return;
		}
		if (user.length === 1) {
			user = user[0];
		}

		const companies = await user.companies.fetch();
		const company = companies[0];
		toaster.success(`Successfully logged in ${user.name}`);
		MyLocal.setSession(user, company);
		history.push(`${company.code}/home`);
		window.location.reload();
	};



	return (
		<div>
			<Component initialState={{ isShown: false, username: '', password: ''}}>
				{({ state, setState }) => (
					<React.Fragment>
						<div id="form-area">
								<h1 id="heading">Welcome to Shop Master</h1>
								<div id="login-form">
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
