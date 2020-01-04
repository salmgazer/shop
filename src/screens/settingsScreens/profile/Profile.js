import React from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import "./Profile.css";
import { withRouter } from "react-router-dom";

import PropTypes from "prop-types";
import MyLocal from "../../../services/MyLocal";
import TopNav from "../../../components/TopNav";
import User from "../../../model/users/User";
import { message, Icon,Button, Input, Card, Row, Col, PageHeader, Switch } from 'antd';



class Profile extends React.Component{

	constructor(props) {
		super(props);

		const {user} = this.props;

		this.state = {
			name: user.name,
			username: user.username,
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: '',
			address: user.address,
			phone: user.phone,
			email: user.email,
			disableForm: true
		};
	}

	render() {
		const {
			user,
			company,
			database,
			history,
			DrawerIcon,
			modelName
		} = this.props;

		const {name, username, phone, email, address, currentPassword, newPassword, confirmNewPassword, disableForm} = this.state;
		console.log(disableForm);

		const saveUser = async () => {
			// validate
			const passToUse = newPassword.length > 5 ? newPassword : user.password;
			if (name.length < 2) {
				return alert('Enter correct name');
			}
			if (username.length < 2) {
				return alert('Enter proper username');
			}
			if (phone.length < 9) {
				return alert('Enter proper phone number');
			}
			if (email.length < 4 && email.length !== 0) {
				return alert('Enter proper email');
			}
			if (currentPassword !== user.password) {
				return alert('Enter your current password correctly');
			} else if (newPassword !== confirmNewPassword && newPassword.length > 5) {
				return alert('New password does not matched confirm password');
			}
			await database.action(async () => {
				const userToUpdate = await database.collections.get(User.table).find(user.id);
				await userToUpdate.update(aUser => {
					aUser.name = name;
					aUser.username = username;
					aUser.email = email;
					aUser.phone = phone;
					aUser.address = address;
					aUser.password = passToUse;
				});

				message.success('Successfully updated your profile!');
				// search({ key: 'name', value: ''});
			});
		};


		return (
			<div>
				<TopNav user={user}/>
				<div id="main-area">
					{<DrawerIcon/>}
					<div id="side-nav">
						<h3 id="company" onClick={() => history.push("home")}>
							{company.name}
						</h3>
						<div id="nav-list">
							<Button className="nav-item" onClick={() => history.push("sync")}>
								Sync
							</Button>
							<Button className="nav-item active">
								Profile
							</Button>
							<Button className="nav-item" onClick={() => history.push("team")}>
								Team
							</Button>
						</div>
						<div className="bottom-area">
							<a onClick={() => history.push("sales")}>
								<Icon type="arrow-left"/>
								Jump to Sales
							</a>
						</div>
					</div>
					<div id="main-body">
						<PageHeader
							style={{
								border: '5px solid white',
								width: '95%',
							}}
							title="Your profile"
							subTitle="You can update your profile"
							extra={[
								<div key="123">
									<b style={{marginRight: '10px'}}>Edit</b>
									<Switch
										checkedChildren={<Icon type="check" />}
										unCheckedChildren={<Icon type="close" />}
										onChange={() => this.setState({ disableForm: !disableForm})}
										defaultChecked={!disableForm}
									/>
								</div>
							]}
						/>
						<Card style={{width: '95%', border: 'none'}}>
							<Row gutter={40}>
								<Col span={12}>
									<div style={{marginBottom: '20px'}}>
										Name
										<Input
											disabled={disableForm}
											placeholder="Enter name"
											value={name}
											onChange={e => this.setState({ name: e.target.value })}
										/>
									</div>
									<div style={{marginBottom: '20px'}}>
										Username
										<Input
											disabled={disableForm}
											placeholder="Enter username"
											value={username}
											onChange={e => this.setState({ username: e.target.value })}
										/>
									</div>
									<div style={{marginBottom: '20px'}}>
										Phone
										<Input
											disabled={disableForm}
											placeholder="Enter phone"
											value={phone}
											onChange={e => this.setState({ phone: e.target.value })}
										/>
									</div>
									<div style={{marginBottom: '20px'}}>
										Email
										<Input
											disabled={disableForm}
											placeholder="Email"
											value={email}
											onChange={e => this.setState({ email: e.target.value })}
										/>
									</div>
								</Col>
								<Col span={12}>
									<div style={{marginBottom: '20px'}}>
										Address
										<Input
											disabled={disableForm}
											placeholder="Enter address"
											value={address}
											onChange={e => this.setState({ address : e.target.value })}
										/>
									</div>
									<div style={{marginBottom: '20px'}}>
										Current password *
										<Input
											disabled={disableForm}
											placeholder="Enter current password"
											onChange={e => this.setState({ currentPassword: e.target.value })}
										/>
									</div>
									<div style={{marginBottom: '20px'}}>
										New password
										<Input
											disabled={disableForm}
											placeholder="Enter new password"
											onChange={e => this.setState({ newPassword: e.target.value })}
										/>
									</div>
									<div style={{marginBottom: '20px'}}>
										Confirm new password
										<Input
											disabled={disableForm}
											placeholder="Confirm new password"
											onChange={e => this.setState({ confirmNewPassword: e.target.value })}
										/>
									</div>
								</Col>
							</Row>
							<Row>
								<Button
									disabled={disableForm}
									shape='round'
									style={{
										fontSize: '30px',
										backgroundColor: 'orange',
										border: "2px solid orange",
										margin: "0 auto",
										color: "white"
									}}
									className="sell-btn"
									onClick={saveUser}
								>
									Save
								</Button>
							</Row>
						</Card>
					</div>
				</div>
			</div>
		);
	}
};

const EnhancedProfile = withDatabase(
	withObservables(["searchConfig"], ({ database}) => ({
		company: database.collections.get("companies").find(MyLocal.companyId),
		user: database.collections.get("users").find(MyLocal.userId),
	}))(withRouter(Profile))
);

class Parent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			key: "name",
			value: "",
			operation: "equal"
		};

		this.search = this.search.bind(this);
	}

	search(config) {
		const { key, operation } = config;
		let { value } = config;
		if (value === "all" && key === "name") {
			value = "";
		}
		this.setState({ key, value, operation });
	}

	render() {
		const { company, DrawerIcon, modelName, user } = this.props;
		return (
			<EnhancedProfile
				searchConfig={this.state}
				modelName={modelName}
				company={company}
				user={user}
				DrawerIcon={DrawerIcon}
				search={this.search}
			/>
		);
	}
}

const EnhancedParent = withDatabase(
	withObservables([], ({ database }) => ({
		company: database.collections.get("companies").find(MyLocal.companyId),
		user: database.collections.get("users").find(MyLocal.userId)
	}))(withRouter(Parent))
);

export default EnhancedParent;

Parent.propTypes = {
	company: PropTypes.object.isRequired
};
