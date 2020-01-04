import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import { withRouter } from "react-router-dom";
import "date-fns";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import { Q } from "@nozbe/watermelondb";
import TopNav from "../../../components/TopNav";
import Company from "../../../model/companies/Company";
import MyLocal from "../../../services/MyLocal";
import User from "../../../model/users/User";
import {Icon, Tag, Select, Button, Drawer, Row, Col, Switch, message} from 'antd';
import UserCompany from "../../../model/userCompanies/UserCompany";
import Component from "@reactions/component";
import {Combobox, SideSheet, Textarea, TextInput, toaster} from "evergreen-ui";
import SyncService from "../../../services/SyncService";
import capitalize from "capitalize";
import Chip from "@material-ui/core/Chip/Chip";
const {Option} = Select;

const fieldNames = [
	{ name: "name", label: "Name", type: "string" },
	{ name: "username", label: "Username", type: "string" },
	{ name: "phone", label: "Phone", type: "string" },
	{ name: "createdBy", label: "Created By", type: "string" },
	{ name: "createdAt", label: "Created", type: "string" },
	{ name: "updatedAt", label: "Updated", type: "string" }
];

const CardListItem = props => {
	const { salesperson, database } = props;
	let {ownedCompany} = props;
	[ownedCompany] = ownedCompany;


	const isOwner = () => ownedCompany.role === 'owner';
	const isActive = () => salesperson.status === 'active';

	const updateUserStatus = async (checked) => {
		console.log(checked);
		await database.action(async () => {
			await salesperson.update(updatedUser => {
				updatedUser.status = checked ? 'active' : 'inactive';
			});
		});
		message.success(`Successfully made ${salesperson.name} ${checked === true ? 'active' : 'inactive'}`)
	};

	return (
		<Grid container spacing={1}>
			<Grid item xs={2} style={{ marginTop: "7px", fontSize: '20px' }}>
				<Component initialState={{ isShown: false }}>
					{({ state, setState }) => (
						<React.Fragment>
							<Drawer
								title={`Details of Salesperson`}
								width={720}
								onClose={() => setState({ isShown: false })}
								visible={state.isShown}
								bodyStyle={{ paddingBottom: 80 }}
							>
								{fieldNames.map(field => {
									let value = salesperson[field.name];
									if (typeof value === "object") {
										if (value instanceof Date) {
											value = value.toLocaleString().split(",")[0];
										} else if (field.name === "createdBy") {
											value = salesperson.createdBy ? salesperson.createdBy.name : "";
										}
									}
									return (
										<Row gutter={16} key={field.name}>
											<Col span={12}>
												<h5
													style={{ fontSize: "20px", fontWeight: "lighter" }}
													key={field.name}
												>
													<b style={{ fontWeight: "400" }}>
														{capitalize(field.label)}
													</b>
													: {<Chip label={value} variant="outlined" /> || ""}
												</h5>
											</Col>
										</Row>
									);
								})}
								<div
									style={{
										position: 'absolute',
										right: 0,
										bottom: 0,
										width: '100%',
										borderTop: '1px solid #e9e9e9',
										padding: '10px 16px',
										background: '#fff',
										textAlign: 'right',
									}}
								>
									<Button
										type='danger'
										onClick={() => setState({ isShown: false })}
										style={{ marginLeft: 20 }}
									>
										Close
									</Button>
								</div>
							</Drawer>
							<Button
								icon="eye-open"
								onClick={() => setState({ isShown: true })}
								className="card-list-item-view-button"
							>
								View
							</Button>
						</React.Fragment>
					)}
				</Component>
			</Grid>
			<Grid item xs={2} style={{ marginTop: "7px", fontSize: '15px' }}>
				<div id="name-column">{salesperson.name}</div>
				<div style={{ color: "#7B8B9A", fontSize: "12px" }}>
					{salesperson.phone}
				</div>
			</Grid>
			<Grid item xs={2} style={{ marginTop: "16px" }}>
				{salesperson.username}
			</Grid>
			<Grid item xs={2} style={{ marginTop: "16px" }}>
				<div id="name-column" style={{marginTop: '5px'}}>
					<Tag color={isOwner() ? 'red' : 'green'}>{ownedCompany.role}</Tag>
				</div>
			</Grid>
			<Grid item xs={2} style={{ marginTop: "16px" }}>
				{salesperson.createdAt.toLocaleString().toString().split(",")[0]}
			</Grid>
			<Grid item xs={2} style={{ marginTop: "16px" }}>
				{
					!isOwner()  && MyLocal.userRole === 'owner'?
						<Switch
							checkedChildren="Active"
							unCheckedChildren="Inactive"
							defaultChecked={isActive()}
							onChange={updateUserStatus}
						/> : ''
				}
			</Grid>
		</Grid>
	);
};

const EnhancedCardListItem = withDatabase(
	withObservables([], ({ database, salesperson, company }) => ({
		ownedCompany: database.collections.get(UserCompany.table).query(Q.where('user_id', salesperson.id), Q.where('company_id', company.id))
	}))(CardListItem)
);

const CreateComponent = props => {
	const { createRecord } = props;
	return (
		<Component
			initialState={{
				isShown: false,
				newUserName: "",
				newUserUserName: "",
				newUserAddress: "",
				newUserPassword: "",
				confirmPassword: "",
				newUserEmail: "",
				newUserStatus: "inactive",
				newUserPhone: ""
			}}
		>
			{({ state, setState }) => (
				<React.Fragment>
					<SideSheet
						isShown={state.isShown}
						onCloseComplete={() => setState({ isShown: false })}
					>
						<div style={{ width: "80%", margin: "0 auto" }}>
							<h3
								style={{
									fontSize: "40px",
									fontWeight: "400",
									color: "#09d3ac"
								}}
							>
								Create new User
							</h3>
							<Grid container spacing={1}>
								<Grid xs={6} item>
									<TextInput
										required
										width={300}
										name="name"
										value={state.newUserName}
										onChange={e => setState({ newUserName: e.target.value })}
										placeholder="Name of User"
										style={{ marginBottom: "20px" }}
									/>
								</Grid>
								<Grid xs={6} item>
									<TextInput
										required
										width={170}
										name="username"
										value={state.newUserUserName}
										onChange={e =>
											setState({ newUserUserName: e.target.value })
										}
										placeholder="Username"
										style={{ marginBottom: "20px", marginLeft: "70px" }}
									/>
								</Grid>
							</Grid>
							<TextInput
								required
								name="address"
								width="100%"
								value={state.newUserAddress}
								onChange={e => setState({ newUserAddress: e.target.value })}
								placeholder="Address"
								style={{ marginBottom: "20px" }}
							/>
							<Grid container spacing={1}>
								<Grid xs={5} item>
									<TextInput
										required
										name="phone"
										width={230}
										value={state.newUserPhone}
										onChange={e => setState({ newUserPhone: e.target.value })}
										placeholder="Phone"
										style={{ marginBottom: "20px" }}
									/>
								</Grid>
								<Grid xs={5} item>
									<TextInput
										required
										name="email"
										width={230}
										value={state.newUserEmail}
										onChange={e => setState({ newUserEmail: e.target.value })}
										placeholder="Email"
										style={{ marginBottom: "20px", marginLeft: "55px" }}
									/>
								</Grid>
							</Grid>
							<Grid container spacing={1}>
								<Grid xs={5} item>
									<TextInput
										required
										name="password"
										type="password"
										width={230}
										value={state.newUserPassword}
										onChange={e =>
											setState({ newUserPassword: e.target.value })
										}
										placeholder="password"
										style={{ marginBottom: "20px" }}
									/>
								</Grid>
								<Grid xs={5} item>
									<TextInput
										required
										width={230}
										name="confirmPassword"
										type="password"
										value={state.confirmPassword}
										onChange={e =>
											setState({ confirmPassword: e.target.value })
										}
										placeholder="confirm password"
										style={{ marginBottom: "20px", marginLeft: "55px" }}
									/>
								</Grid>
							</Grid>
							<Combobox
								items={["active", "inactive"]}
								onChange={selected => setState({ newUserStatus: selected })}
								placeholder="Status"
								autocompleteProps={{
									// Used for the title in the autocomplete.
									title: "User status"
								}}
								style={{ marginBottom: "20px" }}
							/>
							<div style={{ margin: "0 auto", marginTop: "20px" }}>
								<Button
									onClick={() => setState({ isShown: false })}
									intent="danger"
								>
									Cancel
								</Button>
								<Button
									onClick={async () => {
										if (state.newUserPassword !== state.confirmPassword) {
											toaster.danger("Passwords do not match");
											return;
										}
										await createRecord({
											name: state.newUserName,
											phone: state.newUserPhone,
											username: state.newUserUserName,
											email: state.newUserEmail,
											password: state.newUserPassword,
											address: state.newUserAddress,
											status: state.newUserStatus,
											deleted: false
										});
										setState({
											isShown: false,
											newUserName: "",
											newUserUserName: "",
											newUserPhone: "",
											newUserEmail: "",
											newUserPassword: "",
											confirmPassword: "",
											newUserAddress: "",
											newUserStatus: "inactive"
										});
									}}
									intent="success"
									style={{ marginLeft: "20px" }}
								>
									Save
								</Button>
							</div>
						</div>
					</SideSheet>
					<Button
						onClick={() => setState({ isShown: true })}
						shape="circle"
						icon="plus"
						size='large'
						style={{
							float: 'right',
							marginRight: '20px',
							marginBottom: '20px',
							backgroundColor: 'orange',
							color: 'white',
							width: '60px',
							height: '60px'
						}}
					/>
				</React.Fragment>
			)}
		</Component>
	);
};

class Team extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedUserId: null
		};
	}

	render() {
		const {users, user, company, database } = this.props;
		const {selectedUserId} = this.state;


		let filteredUsers = users;

		if (selectedUserId && selectedUserId !== 'all') {
			filteredUsers = users.filter(u => u.id === selectedUserId);
		}

		const usersCollection = database.collections.get(User.table);

		const updateRecord = async updatedRecord => {
			await database.action(async () => {
				const user = await usersCollection.find(updatedRecord.id);
				await user.update(aUser => {
					aUser.name = updatedRecord.name;
					// auser.notes = updatedRecord.notes;
				});
			});
		};

		const createRecord = async userToCreate => {
			await database.action(async () => {
				usersCollection.create(user => {
					user.name = userToCreate.name;
					user.phone = userToCreate.phone;
					user.address = userToCreate.address;
					user.email = userToCreate.email;
					user.username = userToCreate.username;
					user.password = userToCreate.password;
					user.status = userToCreate.status;
					user.profilePicture = userToCreate.profilePicture;
					// user.createdBy = userToCreate.createdBy;
				}).then( async (createdUser) => {
					console.log(`Created ${createdUser.name}`);
					await database.action(async () => {
						database.collections.get(UserCompany.table).create(userCompany => {
							userCompany.userId = createdUser.id;
							userCompany.companyId = company.id;
							userCompany.role = 'salesperson';
						}).then(async (userCompany) => {
							console.info(`User has role ${userCompany.role}`);
							// await SyncService.sync(null, database, 'superadmin');
						});
					});
				});
			});
		};



		return (
			<div>
				<Grid
					container
					spacing={1}
					style={{
						marginBottom: "15px",
						width: "85%",
						marginRight: "50px",
						float: "right"
					}}
				>
					<Grid item xs={2}></Grid>
					<Grid
						item
						xs={6}
						style={{
							color: "darkgrey",
						}}
					>
						<b style={{color: 'black', marginRight: '10px', fontWeight: 'normal'}}>Select salesperson:</b>
						<Select
							showSearch
							style={{ width: 200 }}
							placeholder="Select a salesperson"
							optionFilterProp="children"
							onChange={(value) => this.setState({ selectedUserId: value})}
							onSearch={(value) => this.setState({ selectedUserId: value})}
							filterOption={(input, option) =>
								option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							<Option value="all">All</Option>
							{
								users.map(u => <Option key={u.id} value={u.id}>{u.name}</Option>)
							}
						</Select>
					</Grid>
					<Grid item xs={2}>
						<p style={{ color: "grey", marginBottom: "-5px" }}>

						</p>
					</Grid>
					<Grid item xs={2} style={{ color: "grey" }}>
						<p style={{ color: "grey", marginBottom: "-5px" }}></p>
					</Grid>
				</Grid>
				<div className="list-div">
					<div id="list-area">
						{filteredUsers.map(u => (
							<div key={u.id} className="card-list-item">
								{EnhancedCardListItem({
									database,
									selectedUserId,
									salesperson: u,
									user,
									company
								})}
							</div>
						))}
					</div>
				</div>
				<div id="bottom-area">
					<CreateComponent createRecord={createRecord} />
				</div>
			</div>
		);
	}
}


/*
const EnhancedTeam = withDatabase(
	withObservables([], ({ database }) => ({
		sales: database.collections.get(Sale.table).query(Q.where('payment_status', Q.notIn(['full payment'])), Q.where('type', 'sale')),
		customers: database.collections.get(Customer.table).query().observe()
	}))(Team)
);
*/


Team.propTypes = {
	database: PropTypes.object.isRequired,
};


const Parent = props => {
	const {
		user,
		company,
		users,
		database,
		history,
		DrawerIcon,
		userCompany
	} = props;

	return (
		<div>
			<TopNav user={user} />
			<div id="main-area">
				{<DrawerIcon />}
				<div id="side-nav">
					<h3 id="company" onClick={() => history.push("home")}>
						{company.name}
					</h3>
					<div id="nav-list">
						<Button className="nav-item" onClick={() => history.push("sync")}>
							Sync
						</Button>
						<Button
							className="nav-item"
							onClick={() => history.push("profile")}
						>
							Profile
						</Button>
						<Button className="nav-item active">
							Team
						</Button>
					</div>
					<div className="bottom-area">
						<a onClick={() => history.push("sales")}>
							<Icon type="arrow-left" />
							Jump to Sales
						</a>
					</div>
				</div>
				<div id="main-body">
					<div>
						<Team
							company={company}
							users={users}
							user={user}
							database={database}
							userCompany={userCompany}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

const EnhancedParent = withDatabase(
	withObservables([], ({ database }) => ({
		company: database.collections.get(Company.table).find(MyLocal.companyId),
		user: database.collections.get(User.table).find(MyLocal.userId),
		users: database.collections.get('users')
			.query(Q.on('users_companies', 'company_id', MyLocal.companyId)).observe()
	}))(withRouter(Parent))
);


export default EnhancedParent;
