import React from 'react';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import './Products.scss';
import { withRouter } from 'react-router-dom';
import Component from "@reactions/component";
import { Q } from '@nozbe/watermelondb';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import Chip from '@material-ui/core/Chip';
import {
	SideSheet,
	TextInput,
	Textarea,
	Pane,
	Dialog,
	FilePicker,
	SearchInput,
	toaster,
	SelectMenu,
	Avatar,
	Button,
	Icon,
	// eslint-disable-next-line import/no-unresolved
} from 'evergreen-ui';
import ProductCardList from "../../../components/ProductCardList";
import MyLocal from "../../../services/MyLocal";
import Product from "../../../model/products/Product";
import ProductPrice from "../../../model/productPrices/ProductPrice";
import Grid from "@material-ui/core/Grid/Grid";
import Brand from "../../../model/brand/Brand";
import Category from "../../../model/categories/Category";
import Papa from "papaparse";
import capitalize from 'capitalize';
import TopNav from "../../../components/TopNav";

const fieldNames = [
	{ name: 'name', label: 'Name', type: 'string' },
	{ name: 'quantity', label: 'Quantity', type: 'number' },
	{ name: 'sellingPrice', label: 'Selling price', type: 'number' },
	{ name: 'brand', label: 'Brand', type: 'string' },
	{ name: 'category', label: 'Category', type: 'string' },
];

const CreateComponent = (props) => {
	const {createRecord, categories, brands} = props;

	return (
		<Component
			initialState={{ isShown: false, pricesIsShown: false, newProductName: '', newDescription: '', newQuantity: 0, newCostPrice: 0, newSellingPrice: 0, selectedCategoryId: '', selectedBrandId: ''}}
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
							<br/><label>Cost Price (GH₵):  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
							<TextInput
								required
								name="newCostPrice"
								value={state.newCostPrice}
								onChange={(e) => setState({newCostPrice: parseInt(e.target.value, 10) || 0})}
								placeholder="Cost Price"
								style={{marginBottom: '20px'}}
							/>
							<br/><label>Selling Price (GH₵): &nbsp;&nbsp;&nbsp;&nbsp;</label>
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
							<h4 style={{marginTop: '70px', fontWeight: 'normal'}}>Import CSV for batch creation of products</h4>
							<FilePicker
								width={250}
								marginBottom={100}
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
													createRecord(item, {brand: item.brand, category: item.category});
												});
											}
										});
									}
								}}
								placeholder="Select the csv file here!"
							/>
						</div>
					</SideSheet>
					<Avatar
						style={{
							backgroundColor: 'orange',
							float: 'right',
							marginRight: '20px',
							marginBottom: '20px',
							cursor: 'pointer'
						}}
						onClick={() => setState({ isShown: true })} isSolid name="+" size={60} />
				</React.Fragment>
			)}
		</Component>
	);
};

const EditComponent = (props) => {
	const {row, modelName, removeProductPrice, brands, totalQuantity, productPrices, categories, keyFieldName, updateRecord, saveProductPrice} = props;
	let count = 0;
	return (
		<Component initialState={{
			isShown: false,
			newProductName: row.name,
			newDescription: row.description,
			newSellingPrice: row.sellingPrice,
			newBrandId: row.brandId,
			newCategoryId: row.categoryId,
			stateProductPrices: productPrices
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
							<label>Quantity: &nbsp;&nbsp;&nbsp;<Chip variant='outlined' label={totalQuantity} /></label><br/>
							<br/><label>Selling Price (GH₵): &nbsp;&nbsp;&nbsp;&nbsp;</label>
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
							<br/><label>Select category: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
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
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
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
							</SelectMenu><br/><br/>

							<Pane>
								<Dialog
									isShown={state.viewPrices}
									title={`Cost Prices for ${state.newProductName}`}
									onCloseComplete={() => setState({ viewPrices: false, stateProductPrices: productPrices })}
									hasFooter={false}
								>
									<div style={{marginBottom: '20px'}}>
										<SearchInput
											onChange={e => {
												if (e.target.value) {
													setState({stateProductPrices: productPrices.filter(pp => pp.price === parseInt(e.target.value, 10))});
												} else {
													setState({stateProductPrices: productPrices});
												}
											}}
											placeholder="Search Cost Price"
										/>
										<Button
											onClick={() => {
												count += 1;
												setState({ stateProductPrices : state.stateProductPrices.concat([{ price: 0, quantity: 0, tempId: count, createdAt: new Date()}])})
											}}
											style={{float: 'right'}} appearance="primary" intent="success" iconBefore="add">
											Add cost price
										</Button>
									</div>
									{
										state.stateProductPrices.filter(pp => !pp.deleted)
											.sort((a, b) => b.createdAt - a.createdAt).map(productPrice =>
											<Component
												key={productPrice.id || productPrice.tempId}
												initialState={{ price: productPrice.price, quantity: productPrice.quantity, id: productPrice.id, deleted: false, showDeleteDialog: false }}
											>
												{({ state, setState }) => (
													<div style={{
														marginBottom: '20px',
														backgroundColor: productPrice.id ? 'none' : '#D4EEE2',
													}}>
														{state.deleted === false ?
															<Grid key={productPrice.id || count} container spacing={1} className="product_price_item">
																<Grid item>
																	Price: &nbsp;&nbsp;
																	<TextInput
																		required
																		name="price"
																		width={70}
																		disabled={!!productPrice.id}
																		value={state.price}
																		onChange={(e) => {
																			setState({price: parseInt(e.target.value, 10) || productPrice.price});
																		}}
																		placeholder="Price"
																	/>
																</Grid>
																<Grid item style={{marginLeft: '40px', marginRight: '20px'}}>
																	Quantity: &nbsp;&nbsp;
																	<TextInput
																		required
																		width={70}
																		name="quantity"
																		value={state.quantity}
																		onChange={(e) => {
																			setState({quantity: parseInt(e.target.value, 10) || productPrice.quantity});
																		}}
																		placeholder="Quantity"
																	/>
																</Grid>
																<Grid xs={3} item container style={{marginLeft: '20px'}}>
																	<Grid item>
																		<Button
																			intent="success" style={{marginRight: '5px'}}
																			onClick={() => {
																				saveProductPrice({
																					price: state.price,
																					quantity: state.quantity,
																					id: state.id
																				}, row);
																				setState({ price: state.price, quantity: state.quantity });
																			}}>Save</Button>
																	</Grid>
																	<Grid item>
																		<Pane>
																			<Dialog
																				isShown={state.showDeleteDialog}
																				title="Delete cost price"
																				intent="danger"
																				onCloseComplete={() => setState({ showDeleteDialog: false })}
																				confirmLabel="Delete"
																				onConfirm={() => {
																					if (productPrice.id) {
																						removeProductPrice(productPrice);
																					}
																					setState({ deleted: true, showDeleteDialog: false });
																				}}
																			>
																				Are you sure you want to remove the cost price ({state.price}) and its items ({state.quantity}) ?
																			</Dialog>
																			<Button intent="danger" onClick={() => setState({ showDeleteDialog: true })}>-</Button>
																		</Pane>
																	</Grid>
																</Grid>
															</Grid> : ''
														}</div>
												)}
											</Component>
										)
									}
									<div style={{marginTop: '30px'}}>
										<Button
											onClick={() => setState({ viewPrices: false, stateProductPrices: productPrices })}
											appearance="primary"
											intent="danger"
											style={{marginRight: '20px'}}
										>
											Cancel
										</Button>
									</div>
								</Dialog>
								<Button onClick={() => setState({ viewPrices: true })}>View Cost Prices of Product</Button>
							</Pane>

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
	const {user, company, users, products, brands, categories, database, history, search, DrawerIcon, modelName} = props;
	const productsCollection = database.collections.get(pluralize(modelName));
	const productPricesCollection = database.collections.get(ProductPrice.table);

	const createRecord = async (productToCreate, options={}) => {
		await database.action(async () => {
			if (productToCreate.costPrice > productToCreate.sellingPrice) {
				toaster.danger(`The product ${productToCreate.name} has cost price grater than selling price. You will be making a loss!`);
			}
			if (productToCreate.costPrice === productToCreate.sellingPrice) {
				toaster.danger(`The product ${productToCreate.name} has cost price equal to selling price. You will make no profit!`);
			}
			const productExists = await productsCollection.query(Q.where('name', productToCreate.name)).fetch();
			if (productExists[0]) {
				toaster.warning(`Product with the name ${productToCreate.name} already exists`);
				return;
			}
			let brand;
			let category;

			if (options.brand) {
				brand = await database.collections.get(Brand.table).query(Q.where('name', capitalize(options.brand))).fetch();
				brand = brand[0];
			} else if (productToCreate.brandId) {
				brand = await database.collections.get(Brand.table).find(productToCreate.brandId);
			}

			if (options.category) {
				category = await database.collections.get(Category.table).query(Q.where('name', capitalize(options.category))).fetch();
				category = category[0];
			} else if (productToCreate.categoryId) {
				category = await database.collections.get(Category.table).find(productToCreate.categoryId);
			}

			if (!brand) {
				toaster.warning(`The product ${productToCreate.name} has no brand`);
			}
			if (!category) {
				toaster.warning(`The product ${productToCreate.name} has no category`);
			}

			const newProduct = await productsCollection.create(aProduct => {
				aProduct.name = productToCreate.name;
				aProduct.description = productToCreate.description;
				aProduct.quantity = productToCreate.quantity;
				aProduct.sellingPrice = productToCreate.sellingPrice;
				aProduct.companyId = company.id;
				if (brand) {
					aProduct.brand.set(brand);
				}
				if (category) {
					aProduct.category.set(category);
				}
				aProduct.createdBy.set(user);
			});

			await productPricesCollection.create(productPrice => {
				productPrice.product.set(newProduct);
				productPrice.price = productToCreate.costPrice;
				productPrice.quantity = productToCreate.quantity;
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

	const saveProductPrice = async (record, product) => {
		await database.action(async () => {
			if (record.id) {
				const productPrice = await productPricesCollection.find(record.id);
				const updatedProductPrice = await productPrice.update(aProductPrice => {
					aProductPrice.quantity = record.quantity;
				});
				if (updatedProductPrice.id) {
					toaster.success('Successfully updated product cost price');
				}
			} else {
				const newProductPrice = await productPricesCollection.create(aProductPrice => {
					aProductPrice.price = record.price;
					aProductPrice.quantity = record.quantity;
					aProductPrice.product.set(product);
				});
				if (newProductPrice.id) {
					toaster.success('Successfully saved product cost price');
				}
			}
		});
	};

	const removeProductPrice = async (productPrice) => {
		await database.action(async () => {
			await productPrice.markAsDeleted();

			console.log(`Deleted ${productPrice.id}`);
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
				// aProduct.costPrice = updatedRecord.costPrice;
				aProduct.sellingPrice = updatedRecord.sellingPrice;
			});

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
							saveProductPrice={saveProductPrice}
							removeProductPrice={removeProductPrice}
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
