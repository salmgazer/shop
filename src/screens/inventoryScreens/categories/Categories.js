import React from 'react';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import './Categories.css';
import { withRouter } from 'react-router-dom';
import Component from "@reactions/component";
import { Q } from '@nozbe/watermelondb';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import {
	SideSheet,
	Button,
	TextInput,
	Icon,
	FilePicker,
	toaster
	// eslint-disable-next-line import/no-unresolved
} from 'evergreen-ui';
import Papa from 'papaparse';
import CardList from "../../../components/CardList";
import MyLocal from "../../../services/MyLocal";
import Category from "../../../model/categories/Category";
import Company from "../../../model/companies/Company";
import User from "../../../model/users/User";
import TopNav from "../../../components/TopNav";

const fieldNames = [
	{name: 'name', label: 'Name', type: 'string' },
	{name: 'createdBy', label: 'Created By', type: 'string' },
	{name: 'createdAt', label: 'Created', type: 'string' },
	{name: 'updatedAt', label: 'Updated', type: 'string' }
];

const CreateComponent = (props) => {
	const {createRecord} = props;
	return (
		<Component initialState={{ isShown: false, newCategoryName: '' }}>
			{({ state, setState }) => (
				<React.Fragment>
					<SideSheet
						isShown={state.isShown}
						onCloseComplete={() => setState({ isShown: false })}
					>
						<div style={{ width: '80%', margin: '0 auto'}}>
							<h3 style={{fontSize: '40px', fontWeight: '400', color: '#09d3ac'}}>Create new Category</h3>
							<TextInput
								required
								name="name"
								value={state.newCategoryName}
								onChange={(e) => setState({newCategoryName: e.target.value})}
								placeholder="Name of Category"
								style={{marginBottom: '20px'}}
							/>
							<div style={{ margin: '0 auto', marginTop: '20px'}}>
								<Button onClick={() => setState({ isShown: false })} intent='danger'>Cancel</Button>
								<Button onClick={async () => {
									await createRecord({ name: state.newCategoryName });
									setState({ isShown: false, newCategoryName: '' })
								}} intent='success' style={{marginLeft: '20px'}}>Save</Button>
							</div>

							<h4 style={{marginTop: '70px', fontWeight: 'normal'}}>Import CSV for batch creation of categories</h4>
							<FilePicker
								width={250}
								marginBottom={32}
								onChange={async files => {
									const [file] = files;
									if (!file) {
										toaster.danger(
											'File was not imported correctly...'
										);
									} else if (file.type !== 'text/csv') {
										toaster.danger(
											'File is not a csv'
										);
									} else {
										Papa.parse(file, {
											header: true,
											dynamicTyping: true,
											complete: function(results) {
												const items = results.data;
												toaster.notify(
													'Importing records... please wait patiently'
												);
												items.forEach( item => {
													createRecord(item);
												});
											}
										});
									}
								}}
								placeholder="Select the csv file here!"
							/>
						</div>
					</SideSheet>
					<button id="sell-btn" onClick={() => setState({ isShown: true })}>
						Add Category
					</button>
				</React.Fragment>
			)}
		</Component>
	);
};

const EditComponent = (props) => {
	const {row, modelName, keyFieldName, updateRecord} = props;
	return (
		<Component initialState={{ isShown: false, newCategoryName: row.name || '' }}>
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
								name="name"
								value={state.newCategoryName}
								onChange={(e) => setState({newCategoryName: e.target.value})}
								placeholder="Name of category"
								style={{marginBottom: '20px', fontSize: '25px', height: '50px'}}
							/>
							<div style={{ margin: '0 auto', marginTop: '20px'}}>
								<Button onClick={() => setState({ isShown: false })} intent='danger'>Cancel</Button>
								<Button onClick={() => {
									updateRecord({ id: row[keyFieldName], name: state.newCategoryName });
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


const Categories = (props) => {
	const {user, company, users, categories, database, history, parentLocation, search, DrawerIcon, modelName} = props;
	const categoriesCollection = database.collections.get(pluralize(modelName));

	const createRecord = async (categoryToCreate) => {
		await database.action(async () => {
			const existingBrand = await categoriesCollection.query(Q.where('name', categoryToCreate.name)).fetch();
			if (existingBrand[0]) {
				toaster.warning(`Category ${categoryToCreate.name} already exists`);
				return;
			}

			const newCategory = await categoriesCollection.create(category => {
				category.name = categoryToCreate.name;
				category.createdBy.set(user);
			});

			console.log(`Created ${newCategory.name}`);
			console.log(`Created by ${newCategory.createdBy}`);
		});
	};

	const updateRecord = async (updatedRecord) => {
		await database.action(async () => {
			const category = await categoriesCollection.find(updatedRecord.id);
			await category.update(aCategory=> {
				aCategory.name = updatedRecord.name;
				aCategory.createdBy.set(user);
			});
		});
	};

	const deleteRecord = async (id) => {
		await database.action(async () => {
			const category = await categoriesCollection.find(id);
			await category.remove();
		});
	};

	return (
		<div>
			<TopNav user={user}/>
			<div id="main-area">
				{
					<DrawerIcon />
				}
				<div id="side-nav">
					<h3 id="company" onClick={() => history.push('home')}>{company.name}</h3>
					<div id="nav-list">
						<button className="nav-item" onClick={() => history.push('products')}>Products</button>
						<button className="nav-item active" onClick={() => history.push('categories')}>Categories</button>
						<button className="nav-item" onClick={() => history.push('brands')}>Brands</button>
					</div>
					<div className="bottom-area">
						<a onClick={() => history.push('sales')}>
							<Icon icon="arrow-left" marginRight={16}/>
							Jump to Sales
						</a>
					</div>
				</div>
				<div id="main-body">
					<div>
						<CardList
							entries={categories}
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
							model={Category}
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

const EnhancedCategories = withDatabase(withObservables(["searchConfig"], ({ database, searchConfig }) => ({
	categories: database.collections.get(Category.table).query(Q.where(searchConfig.key, Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`))).observe(),
	company: database.collections.get(Company.table).find(MyLocal.companyId),
	user: database.collections.get(User.table).find(MyLocal.userId),
	users: database.collections.get(User.table).query().observe()
}))(withRouter(Categories)));




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
			<EnhancedCategories searchConfig={this.state} modelName={modelName} company={company} user={user} DrawerIcon={DrawerIcon} search={this.search} />
		);
	}
}

const EnhancedParent = withDatabase(withObservables([], ({ database }) => ({
	company: database.collections.get('companies').find(MyLocal.companyId),
	user: database.collections.get('users').find(MyLocal.userId),
}))(withRouter(Parent)));

export default EnhancedParent;

Parent.propTypes = {
	company: PropTypes.object.isRequired
};
