import React from 'react';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import './Sales.css';
import { withRouter } from 'react-router-dom';
import Component from "@reactions/component";
import { Q } from '@nozbe/watermelondb';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import {
	SideSheet,
	Button,
	TextInput,
	Textarea,
	Icon,
	toaster, Popover, Position, Menu, Avatar
	// eslint-disable-next-line import/no-unresolved
} from 'evergreen-ui';
import CardList from "../../../components/CardList";
import MyLocal from "../../../services/MyLocal";
import User from "../../../model/users/User";
import Company from "../../../model/companies/Company";
import Sale from "../../../model/sales/Sale";

const fieldNames = [
	{name: 'name', label: 'Name', type: 'string' },
	{name: 'note', label: 'Note', type: 'string' },
	{name: 'createdBy', label: 'Created By', type: 'string' },
	{name: 'phone', label: 'Phone', type: 'string' },
	{name: 'createdAt', label: 'Created', type: 'string' },
	{name: 'updatedAt', label: 'Updated', type: 'string' }
];

const CreateComponent = (props) => {
	const {createRecord} = props;
	return (
		<Component initialState={{ isShown: false, newSaleName: '', newSaleNotes: '', newSalePhone: '' }}>
			{({ state, setState }) => (
				<React.Fragment>
					<SideSheet
						isShown={state.isShown}
						onCloseComplete={() => setState({ isShown: false })}
					>
						<div style={{ width: '80%', margin: '0 auto'}}>
							<h3 style={{fontSize: '40px', fontWeight: '400', color: '#09d3ac'}}>Create new Sale</h3>
							<label>Name: &nbsp;&nbsp;&nbsp;</label>
							<TextInput
								required
								name="name"
								value={state.newSaleName}
								onChange={(e) => setState({newSaleName: e.target.value})}
								placeholder="Name of Sale"
								style={{marginBottom: '20px'}}
							/>
							<br/><label>Phone: &nbsp;&nbsp;</label>
							<TextInput
								required
								name="phone"
								value={state.newSalePhone}
								onChange={(e) => setState({newSalePhone: e.target.value})}
								placeholder="Phone number of sale"
								style={{marginBottom: '20px'}}
							/>
							<br/><label>Note about sale:</label><br/>
							<Textarea
								name="note"
								value={state.newSaleNotes}
								onChange={(e) => setState({newSaleNotes: e.target.value})}
								placeholder="Note about sale"
							/>
							<div style={{ margin: '0 auto', marginTop: '50px'}}>
								<Button onClick={() => setState({ isShown: false })} intent='danger'>Cancel</Button>
								<Button onClick={async () => {
									await createRecord({ name: state.newSaleName, note: state.newSaleNotes, phone: state.newSalePhone });
									setState({ isShown: false, newSaleName: '', newSaleNotes: '', newSalePhone: '' })
								}} intent='success' style={{marginLeft: '20px'}}>Save</Button>
							</div>
						</div>
					</SideSheet>
					<button id="sell-btn" onClick={() => setState({ isShown: true })}>
						Create Sale
					</button>
				</React.Fragment>
			)}
		</Component>
	);
};

const EditComponent = (props) => {
	const {row, modelName, keyFieldName, updateRecord} = props;
	return (
		<Component initialState={{ isShown: false, newSaleName: row.name || '', newSaleNotes: row.note || '', newSalePhone: row.phone || '' }}>
			{({ state, setState }) => (
				<React.Fragment>
					<SideSheet
						isShown={state.isShown}
						onCloseComplete={() => setState({ isShown: false })}
					>
						<div style={{ width: '80%', margin: '0 auto'}}>
							<h3 style={{fontSize: '40px', fontWeight: '400', color: '#09d3ac'}}>Update {modelName}</h3>
							<TextInput
								required
								name="phone"
								value={state.newSalePhone}
								onChange={(e) => setState({newSalePhone: e.target.value})}
								placeholder="Phone number of sale"
								style={{marginBottom: '20px', fontSize: '25px', height: '50px'}}
							/>
							<Textarea
								name="note"
								value={state.newSaleNotes}
								onChange={(e) => setState({newSaleNotes: e.target.value})}
								placeholder="Note about sale"
								style={{marginBottom: '20px', fontSize: '25px'}}
							/>
							<div style={{ margin: '0 auto', marginTop: '20px'}}>
								<Button onClick={() => setState({ isShown: false })} intent='danger'>Cancel</Button>
								<Button onClick={() => {
									updateRecord({ id: row[keyFieldName], name: state.newSaleName, note: state.newSaleNotes, phone: state.newSalePhone });
									setState({ isShown: false })
								}} intent='success' style={{marginLeft: '20px'}}>Save</Button>
							</div>
						</div>
					</SideSheet>
					<Icon icon="edit" onClick={() => setState({ isShown: true })} className="hand-pointer" size={20} color='muted' marginRight={20}/>
				</React.Fragment>
			)}
		</Component>
	);
};


const Sales = (props) => {
	const {user, company, sales, users, database, history, parentLocation, search, DrawerIcon, modelName} = props;
	const salesCollection = database.collections.get(pluralize(modelName));

	const createRecord = async (saleToCreate) => {
		await database.action(async () => {
			const newSale = await salesCollection.create(sale => {
				sale.name = saleToCreate.name;
				sale.note = saleToCreate.note;
				sale.phone = saleToCreate.phone;
				sale.createdBy.set(user);
			});

			console.log(`Created ${newSale.name}`);
			console.log(`Created by ${newSale.createdBy}`);
		});
	};

	const updateRecord = async (updatedRecord) => {
		await database.action(async () => {
			const sale = await salesCollection.find(updatedRecord.id);
			await sale.update(aSale => {
				aSale.name = updatedRecord.name;
				aSale.note = updatedRecord.note;
				aSale.phone = updatedRecord.phone;
			});
			// search({ key: 'name', value: ''});

		});
	};

	const deleteRecord = async (id) => {
		await database.action(async () => {
			const sale = await salesCollection.find(id);
			await sale.remove();
		});
	};

	return (
		<div>
			<div id='user-icon-area'>
				<Popover
					position={Position.BOTTOM_LEFT}
					content={
						<Menu>
							<Menu.Item
								onSelect={() => MyLocal.logout()}
								style={{color: 'red', fontWeight: 'bold'}}
							>
								Logout <Icon icon="power" style={{ marginBottom: '-5px'}} />
							</Menu.Item>
						</Menu>
					}
				>
					<Avatar
						name={user.name}
						size={40}
						id='user-icon'
					/>
				</Popover>
			</div>
			<div id="main-area">
				{
					<DrawerIcon />
				}
				<div id="side-nav">
					<h3 id="company" onClick={() => history.push('home')}>{company.name}</h3>
					<div id="nav-list">
						<button className="nav-item active" onClick={() => history.push('sales')}>Sales</button>
						<button className="nav-item" onClick={() => history.push('customers')}>Customers</button>
					</div>
					<div className="bottom-area">
						<a onClick={() => history.push('products')}>
							<Icon icon="arrow-left" marginRight={16}/>
							Jump to Inventory
						</a>
					</div>
				</div>
				<div id="main-body">
					<div>
						<CardList
							entries={sales}
							users={users}
							EditComponent={EditComponent}
							updateRecord={updateRecord}
							displayNameField='name'
							keyFieldName='id'
							fieldNames={fieldNames}
							modelName={modelName}
							database={database}
							deleteRecord={deleteRecord}
							search={search}
							user={user}
							model={Sale}
						/>
					</div>
					<div id="bottom-area">
						<CreateComponent createRecord={createRecord} />
					</div>
				</div>
			</div>
		</div>
	);
};

const EnhancedSales = withDatabase(withObservables(["searchConfig"], ({ database, searchConfig }) => ({
	sales: database.collections.get(Sale.table).query(Q.where(searchConfig.key, Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`))).observe(),
	company: database.collections.get(Company.table).find(MyLocal.companyId),
	user: database.collections.get(User.table).find(MyLocal.userId),
	users: database.collections.get(User.table).query().observe()
}))(withRouter(Sales)));




class Parent extends React.Component {
	constructor(props){
		super(props);
		this.state={
			key: 'name',
			value: '',
			operation: 'equal'
		};

		this.search = this.search.bind(this);
	}

	search(config) {
		const {key, operation} = config;
		let { value } = config;
		if (value === 'all' && key === 'name') {
			value = '';
		}
		this.setState({key, value, operation });
	}

	render() {
		const {company, DrawerIcon, modelName, user} = this.props;
		return (
			<EnhancedSales searchConfig={this.state} modelName={modelName} company={company} user={user} DrawerIcon={DrawerIcon} search={this.search} />
		);
	}
}

const EnhancedParent = withDatabase(withObservables([], ({ database }) => ({
	company: database.collections.get(Company.table).find(MyLocal.companyId),
	user: database.collections.get(User.table).find(MyLocal.userId),
}))(withRouter(Parent)));

export default EnhancedParent;

Parent.propTypes = {
	company: PropTypes.object.isRequired
};
