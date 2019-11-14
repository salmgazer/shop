import React from 'react';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import './Products.css';
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
	toaster, Popover, Position, Menu, Avatar, SelectMenu
	// eslint-disable-next-line import/no-unresolved
} from 'evergreen-ui';
import ProductCardList from "../../../components/ProductCardList";
import MyLocal from "../../../services/MyLocal";
import Product from "../../../model/products/Product";

const fieldNames = [
	{ name: 'name', label: 'Name', type: 'string' },
	{ name: 'quantity', label: 'Quantity', type: 'number' },
	{ name: 'sellingPrice', label: 'Selling price', type: 'number' },
	{ name: 'constPrice', label: 'Cost price', type: 'number' },
	{ name: 'brand', label: 'Brand', type: 'string' },
	{ name: 'category', label: 'Category', type: 'string' },
];

const CreateComponent = (props) => {
	const {createRecord, categories, brands} = props;

	return (
		<Component
			initialState={{ isShown: false, newProductName: '', newDescription: '', newQuantity: 0, newCostPrice: 0, newSellingPrice: 0, selectedCategoryId: '', selectedBrandId: ''}}
		>
			{({ state, setState }) => (
				<React.Fragment>
					<SideSheet
						isShown={state.isShown}
						onCloseComplete={() => setState({ isShown: false })}
					>
						<div style={{ width: '80%', margin: '0 auto'}}>
							<h3 style={{fontSize: '40px', fontWeight: '400', color: '#09d3ac'}}>Create new Product</h3>
							<label>Name of product: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
							<TextInput
								required
								name="name"
								value={state.newProductName}
								onChange={(e) => setState({newProductName: e.target.value})}
								placeholder="Name of Product"
								style={{marginBottom: '20px'}}
							/>
							<br/><label>Description: </label>
							<Textarea
								name="newDescription"
								placeholder="Description of product"
								value={state.newDescription}
								onChange={(e) => setState({newDescription: e.target.value})}
								style={{marginBottom: '20px', float: 'right'}}
							/>
							<br/><br/>
							<label>Quantity : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
							<TextInput
								required
								name="newQuantity"
								value={state.newQuantity}
								onChange={(e) => setState({newQuantity: parseInt(e.target.value, 10) || 0})}
								placeholder="Quantity"
								style={{marginBottom: '20px'}}
							/>
							<br/><label>Cost Price (GHS):  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
							<TextInput
								required
								name="newCostPrice"
								value={state.newCostPrice}
								onChange={(e) => setState({newCostPrice: parseInt(e.target.value, 10) || 0})}
								placeholder="Cost Price"
								style={{marginBottom: '20px'}}
							/>
							<br/><label>Selling Price (GHS): &nbsp;&nbsp;&nbsp;&nbsp;</label>
							<TextInput
								required
								name="newSellingPrice"
								value={state.newSellingPrice}
								onChange={(e) => {
									setState({newSellingPrice: parseInt(e.target.value, 10) || 0});
								}}
								placeholder="Selling Price"
								style={{marginBottom: '20px'}}
							/>
							<br/>
							<br/><label>Select Brand: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
							<SelectMenu
								filterPlaceholder='Select category'
								title="Select category"
								options={
									categories.map(category => ({ label: category.name, value: category.id }))
								}
								selected={state.selectedCategoryId}
								onSelect={item => setState({ selectedCategoryId: item.value })}
								style={{marginBottom: '20px'}}
							>
								<Button>{state.selectedCategoryId ? categories.find(cat => cat.id === state.selectedCategoryId).name : 'Select category...'}</Button>
							</SelectMenu>
							<br /><br />
							<label>Select category: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								&nbsp;&nbsp;</label>
							<SelectMenu
								filterPlaceholder='Select brand'
								title="Select brand"
								options={
									brands.map(brand => ({ label: brand.name, value: brand.id }))
								}
								selected={state.selectedBrandId}
								onSelect={item => setState({ selectedBrandId: item.value })}
								style={{marginBottom: '20px'}}
							>
								<Button>{state.selectedBrandId ? brands.find(brand => brand.id === state.selectedBrandId).name : 'Select brand...'}</Button>
							</SelectMenu><br/>
							<div style={{ margin: '0 auto', marginTop: '20px'}}>
								<Button onClick={() => setState({ isShown: false })} intent='danger'>Cancel</Button>
								<Button onClick={async () => {
									if (!state.newProductName) {
										toaster.danger('Product must have a name');
										return;
									}
									if (state.newCostPrice === 0 || state.newSellingPrice === 0) {
										toaster.danger('Cost price and Selling price cannot be zero (0)');
										return;
									}
									if (state.newSellingPrice < state.newCostPrice) {
										toaster.danger('Selling price cannot be smaller than cost price. You will make a loss');
										return;
									}
									if (state.newSellingPrice === state.newCostPrice) {
										toaster.warning('Selling price must be greater than cost price in order to make profit');
									}
									await createRecord({
										name: state.newProductName,
										description: state.newDescription,
										quantity: state.newQuantity,
										costPrice: state.newCostPrice,
										sellingPrice: state.newSellingPrice,
										categoryId: state.selectedCategoryId,
										brandId: state.selectedBrandId
									});
									setState({ isShown: false, newProductName: '' })
								}} intent='success' style={{marginLeft: '20px'}}>Save</Button>
							</div>
						</div>
					</SideSheet>
					<button id="sell-btn" onClick={() => setState({ isShown: true })}>
						Add Product
					</button>
				</React.Fragment>
			)}
		</Component>
	);
};

const EditComponent = (props) => {
	const {row, modelName, brands, categories, keyFieldName, updateRecord} = props;
	return (
		<Component initialState={{
			isShown: false,
			newProductName: row.name,
			newDescription: row.description,
			newQuantity: row.quantity,
			newCostPrice: row.costPrice,
			newSellingPrice: row.sellingPrice,
			newBrandId: row.brandId,
			newCategoryId: row.categoryId
		}}>
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
								value={state.newProductName}
								onChange={(e) => setState({newProductName: e.target.value})}
								placeholder="Name of Product"
								style={{marginBottom: '20px'}}
							/>
							<br/><label>Description: </label>
							<Textarea
								name="newDescription"
								placeholder="Description of product"
								value={state.newDescription}
								onChange={(e) => setState({newDescription: e.target.value})}
								style={{marginBottom: '20px', float: 'right'}}
							/>
							<br/><br/>
							<label>Quantity: &nbsp;&nbsp;&nbsp;{state.newQuantity}</label><br/>
							<br/><label>Cost Price (GHS):  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
							<TextInput
								required
								name="newCostPrice"
								value={state.newCostPrice}
								onChange={(e) => setState({newCostPrice: parseInt(e.target.value, 10) || 0})}
								placeholder="Cost Price"
								style={{marginBottom: '20px'}}
							/>
							<br/><label>Selling Price (GHS): &nbsp;&nbsp;&nbsp;&nbsp;</label>
							<TextInput
								required
								name="newSellingPrice"
								value={state.newSellingPrice}
								onChange={(e) => {
									setState({newSellingPrice: parseInt(e.target.value, 10) || 0});
								}}
								placeholder="Selling Price"
								style={{marginBottom: '20px'}}
							/>
							<br/>
							<br/><label>Select category: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
							<SelectMenu
								filterPlaceholder='Select category'
								title="Select category"
								options={
									categories.map(category => ({ label: category.name, value: category.id }))
								}
								selected={state.newCategoryId}
								onSelect={item => setState({ newCategoryId: item.value })}
								style={{marginBottom: '20px'}}
							>
								<Button>{state.newCategoryId ? categories.find(cat => cat.id === state.newCategoryId).name : 'Select category...'}</Button>
							</SelectMenu>
							<br /><br />
							<label>Select brand: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								&nbsp;&nbsp;</label>
							<SelectMenu
								filterPlaceholder='Select brand'
								title="Select brand"
								options={
									brands.map(brand => ({ label: brand.name, value: brand.id }))
								}
								selected={state.newBrandId}
								onSelect={item => setState({ newBrandId: item.value })}
								style={{marginBottom: '20px'}}
							>
								<Button>{state.newBrandId ? brands.find(brand => brand.id === state.newBrandId).name : 'Select brand...'}</Button>
							</SelectMenu><br/>
							<div style={{ margin: '0 auto', marginTop: '20px'}}>
								<Button onClick={() => setState({ isShown: false })} intent='danger'>Cancel</Button>
								<Button onClick={() => {
									updateRecord({
										id: row[keyFieldName],
										name: state.newProductName,
										description: state.newDescription,
										quantity: state.newQuantity,
										costPrice: state.newCostPrice,
										sellingPrice: state.newSellingPrice,
										categoryId: state.newCategoryId,
										brandId: state.newBrandId
									});
									setState({ isShown: false })
								}} intent='success' style={{marginLeft: '20px'}}>Save</Button>
							</div>
						</div>
					</SideSheet>
					<Icon icon="edit" onClick={() => setState({ isShown: true })} size={20} color='primary' marginRight={16}/>
				</React.Fragment>
			)}
		</Component>
	);
};

const Products = (props) => {
	const {user, company, users, products, brands, categories, database, history, parentLocation, search, DrawerIcon, modelName} = props;
	const productsCollection = database.collections.get(pluralize(modelName));

	const createRecord = async (productToCreate) => {
		console.log(productToCreate);
		await database.action(async () => {
			const newProduct = await productsCollection.create(aProduct => {
				aProduct.name = productToCreate.name;
				aProduct.description = productToCreate.description;
				aProduct.quantity = productToCreate.quantity;
				// do some magic here
				aProduct.costPrice = productToCreate.costPrice;
				aProduct.sellingPrice = productToCreate.sellingPrice;
				aProduct.categoryId = productToCreate.categoryId;
				aProduct.brandId = productToCreate.brandId;
				aProduct.createdBy.set(user);
			});

			console.log(`Created ${newProduct}`);
		});
	};

	const deleteRecord = async (id) => {
		await database.action(async () => {
			const product = await productsCollection.find(id);
			await product.markAsDeleted();

			console.log(`Deleted ${product.id}`);
		});
	};

	const updateRecord = async (updatedRecord) => {
		await database.action(async () => {
			const product = await productsCollection.find(updatedRecord.id);
			product.observe();
			await product.update(aProduct => {
				aProduct.name = updatedRecord.name;
				aProduct.description = updatedRecord.description;
				aProduct.quantity = updatedRecord.quantity;
				aProduct.costPrice = updatedRecord.costPrice;
				aProduct.sellingPrice = updatedRecord.sellingPrice;
			});

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
						<button className="nav-item active" onClick={() => history.push('products')}>Products</button>
						<button className="nav-item" onClick={() => history.push('categories')}>Categories</button>
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
						<ProductCardList
							entries={products}
							users={users}
							brands={brands}
							categories={categories}
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
							model={Product}
						/>
					</div>
					<div id="bottom-area">
						<CreateComponent createRecord={createRecord} categories={categories} brands={brands} />
					</div>
				</div>
			</div>
		</div>
	);
};

const EnhancedProducts = withDatabase(withObservables(["searchConfig"], ({ database, searchConfig }) => ({
	products: database.collections.get('products').query(Q.where(searchConfig.key, Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`))).observe(),
	company: database.collections.get('companies').find(MyLocal.companyId),
	user: database.collections.get('users').find(MyLocal.userId),
	users: database.collections.get('users').query().observe()
}))(withRouter(Products)));




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
		const {company, DrawerIcon, modelName, user, categories, brands} = this.props;
		return (
			<EnhancedProducts
				searchConfig={this.state}
				modelName={modelName}
				company={company}
				user={user}
				DrawerIcon={DrawerIcon}
				search={this.search}
				categories={categories}
				brands={brands}
			/>
		);
	}
}

const EnhancedParent = withDatabase(withObservables([], ({ database }) => ({
	company: database.collections.get('companies').find(MyLocal.companyId),
	user: database.collections.get('users').find(MyLocal.userId),
	categories: database.collections.get('categories').query().observe(),
	brands: database.collections.get('brands').query().observe()
}))(withRouter(Parent)));

export default EnhancedParent;

Parent.propTypes = {
	company: PropTypes.object.isRequired
};
