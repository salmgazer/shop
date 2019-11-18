import React from 'react';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import './Brands.css';
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
	FilePicker,
	toaster
	// eslint-disable-next-line import/no-unresolved
} from 'evergreen-ui';
import Papa from 'papaparse';
import CardList from "../../../components/CardList";
import MyLocal from "../../../services/MyLocal";
import Brand from "../../../model/brand/Brand";
import TopNav from "../../../components/TopNav";

const fieldNames = [
	{name: 'name', label: 'Name', type: 'string' },
	{name: 'notes', label: 'Notes', type: 'string' },
	{name: 'createdBy', label: 'Created By', type: 'string' },
	{name: 'createdAt', label: 'Created', type: 'string' },
	{name: 'updatedAt', label: 'Updated', type: 'string' }
];

const CreateComponent = (props) => {
	const {createRecord} = props;
	return (
		<Component initialState={{ isShown: false, newBrandName: '', newBrandNotes: '' }}>
			{({ state, setState }) => (
				<React.Fragment>
					<SideSheet
						isShown={state.isShown}
						onCloseComplete={() => setState({ isShown: false })}
					>
						<div style={{ width: '80%', margin: '0 auto'}}>
							<h3 style={{fontSize: '40px', fontWeight: '400', color: '#09d3ac'}}>Create new Brand</h3>
							<TextInput
								required
								name="name"
								value={state.newBrandName}
								onChange={(e) => setState({newBrandName: e.target.value})}
								placeholder="Name of brand"
								style={{marginBottom: '20px'}}
							/>
							<Textarea
								name="notes"
								value={state.newBrandNotes}
								onChange={(e) => setState({newBrandNotes: e.target.value})}
								placeholder="Note about brand"
							/>
							<div style={{ margin: '0 auto', marginTop: '20px'}}>
								<Button onClick={() => setState({ isShown: false })} intent='danger'>Cancel</Button>
								<Button onClick={async () => {
									await createRecord({ name: state.newBrandName, notes: state.newBrandNotes });
									setState({ isShown: false, newBrandName: '', newBrandNotes: '' })
								}} intent='success' style={{marginLeft: '20px'}}>Save</Button>
							</div>

							<h4 style={{marginTop: '70px', fontWeight: 'normal'}}>Import CSV for batch creation of brands</h4>
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
						Add Brand
					</button>
				</React.Fragment>
			)}
		</Component>
	);
};

const EditComponent = (props) => {
	const {row, modelName, keyFieldName, updateRecord} = props;
	return (
		<Component initialState={{ isShown: false, newBrandName: row.name || '', newBrandNotes: row.notes || '' }}>
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
								value={state.newBrandName}
								onChange={(e) => setState({newBrandName: e.target.value})}
								placeholder="Name of brand"
								style={{marginBottom: '20px', fontSize: '25px', height: '50px'}}
							/>
							<Textarea
								name="notes"
								value={state.newBrandNotes}
								onChange={(e) => setState({newBrandNotes: e.target.value})}
								placeholder="Note about brand"
								style={{marginBottom: '20px', fontSize: '25px'}}
							/>
							<div style={{ margin: '0 auto', marginTop: '20px'}}>
								<Button onClick={() => setState({ isShown: false })} intent='danger'>Cancel</Button>
								<Button onClick={() => {
									updateRecord({ id: row[keyFieldName], name: state.newBrandName, notes: state.newBrandNotes });
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


const Brands = (props) => {
	const {user, company, users, brands, database, history, parentLocation, search, DrawerIcon, modelName} = props;
	const brandsCollection = database.collections.get(pluralize(modelName));

	const createRecord = async (brandToCreate) => {
		await database.action(async () => {
			const existingBrand = await brandsCollection.query(Q.where('name', brandToCreate.name)).fetch();
			if (existingBrand[0]) {
				toaster.warning(`Brand ${brandToCreate.name} already exists`);
				return;
			}
			const newBrand = await brandsCollection.create(brand => {
				brand.name = brandToCreate.name;
				brand.notes = brandToCreate.notes;
				brand.createdBy.set(user);
			});

			console.log(`Created ${newBrand.name}`);
			console.log(`Created by ${newBrand.createdBy}`);
		});
	};

	const updateRecord = async (updatedRecord) => {
		await database.action(async () => {
			const brand = await brandsCollection.find(updatedRecord.id);
			await brand.update(aBrand => {
				aBrand.name = updatedRecord.name;
				aBrand.notes = updatedRecord.notes;
			});
			// search({ key: 'name', value: ''});

		});
	};

	const deleteRecord = async (id) => {
		await database.action(async () => {
			const brand = await brandsCollection.find(id);
			await brand.remove();
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
						<button className="nav-item" onClick={() => history.push('categories')}>Categories</button>
						<button className="nav-item active" onClick={() => history.push('brands')}>Brands</button>
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
							entries={brands}
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
							model={Brand}
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

const EnhancedBrands = withDatabase(withObservables(["searchConfig"], ({ database, searchConfig }) => ({
	brands: database.collections.get('brands').query(Q.where(searchConfig.key, Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`))).observe(),
	company: database.collections.get('companies').find(MyLocal.companyId),
	user: database.collections.get('users').find(MyLocal.userId),
	users: database.collections.get('users').query().observe()
}))(withRouter(Brands)));




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
			<EnhancedBrands searchConfig={this.state} modelName={modelName} company={company} user={user} DrawerIcon={DrawerIcon} search={this.search} />
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
