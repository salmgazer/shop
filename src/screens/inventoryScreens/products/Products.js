import React from 'react';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import './Products.scss';
import { withRouter } from 'react-router-dom';
import Component from "@reactions/component";
import { Q } from '@nozbe/watermelondb';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import {
	FilePicker,
	Avatar,
	// eslint-disable-next-line import/no-unresolved
} from 'evergreen-ui';
import {Icon, Form, message,Select, Row, Col, Input, Drawer, InputNumber, Modal, Button, Divider} from 'antd';
import ProductCardList from "../../../components/ProductCardList";
import MyLocal from "../../../services/MyLocal";
import Product from "../../../model/products/Product";
import ProductPrice from "../../../model/productPrices/ProductPrice";
import Brand from "../../../model/brand/Brand";
import Category from "../../../model/categories/Category";
import Papa from "papaparse";
import capitalize from 'capitalize';
import TopNav from "../../../components/TopNav";

const { Option } = Select;
const {Search} = Input;

const fieldNames = [
	{ name: 'name', label: 'Name', type: 'string' },
	{ name: 'sellingPrice', label: 'Selling price', type: 'number' },
	{ name: 'brand', label: 'Brand', type: 'string' },
	{ name: 'category', label: 'Category', type: 'string' },
];

const CreateComponentRaw = (props) => {
	const {createRecord, categories, brands} = props;
	const {getFieldDecorator, getFieldValue} = props.form;

	return (
		<Component
			initialState={{ isShown: false, pricesIsShown: false }}
		>
			{({ state, setState }) => (
				<React.Fragment>
					<Drawer
						title="Create product"
						width={720}
						onClose={() => setState({ isShown: false })}
						visible={state.isShown}
						bodyStyle={{ paddingBottom: 80 }}
					>
						<Form layout="vertical">
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item label="Name">
										{getFieldDecorator('name', {
											rules: [{ required: true, message: 'Please enter name of product' }],
										})(
											<Input placeholder="Enter name of product" />
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24}>
									<Form.Item label="Description">
										{getFieldDecorator('description', {
											rules: [
												{
													required: false,
												},
											],
										})(<Input.TextArea rows={4} placeholder="Please enter product description" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={8}>
									<Form.Item label="Cost Price (GHS)">
										{getFieldDecorator('costPrice', {
											rules: [{ required: true, message: 'Please enter cost price' }],
										})(
											<InputNumber style={{ width: 200 }} placeholder="Enter cost price" />
										)}
									</Form.Item>
								</Col>
								<Col span={8}>
									<Form.Item label="Selling Price (GHS)">
										{getFieldDecorator('sellingPrice', {
											rules: [{ required: true, message: 'Please enter selling price' }],
										})(
											<InputNumber style={{ width: 200 }} placeholder="Enter selling price" />
										)}
									</Form.Item>
								</Col>
								<Col span={8}>
									<Form.Item label="Quantity">
										{getFieldDecorator('quantity', {
											rules: [{ required: true, message: 'Please enter quantity'}],
										})(
											<InputNumber style={{ width: 200 }} placeholder="Enter quantity" />
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={10}>
									<Form.Item label="Category">
										{getFieldDecorator('category', {
											rules: [{ required: false, message: 'Please select category' }],
										})(
											<Select
												showSearch
												style={{ width: 200 }}
												placeholder="Select category"
												optionFilterProp="children"
												filterOption={(input, option) =>
													option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
											>
												{
													categories.map(category => <Option key={category.id} value={category.id}>{category.name}</Option>)
												}
											</Select>
										)}
									</Form.Item>
								</Col>
								<Col span={10}>
									<Form.Item label="Brand">
										{getFieldDecorator('brand', {
											rules: [{ required: false, message: 'Please select category' }],
										})(
											<Select
												showSearch
												style={{ width: 200 }}
												placeholder="Select brand"
												optionFilterProp="children"
												filterOption={(input, option) =>
													option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
											>
												{
													brands.map(brand => <Option key={brand.id} value={brand.id}>{brand.name}</Option>)
												}
											</Select>
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row>
								<h4 style={{marginTop: '10px', fontWeight: 'normal'}}>Import CSV for batch creation of products</h4>
								<FilePicker
									width={250}
									marginBottom={32}
									onChange={async files => {
										const [file] = files;
										if (!file) {
											message.error("File was not imported correctly...");
										} else if (file.type !== "text/csv") {
											message.error("File is not a csv");
										} else {
											Papa.parse(file, {
												header: true,
												dynamicTyping: true,
												complete: function(results) {
													const items = results.data;
													message.info(
														"Importing records... please wait patiently"
													);
													items.forEach(item => {
														createRecord(item, {brand: item.brand, category: item.category});
													});
												}
											});
										}
									}}
									placeholder="Select the csv file here!"
								/>
							</Row>
						</Form>
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
								onClick={() => setState({ isShown: false })} style={{ marginRight: 8 }}
								type='danger'
							>
								Cancel
							</Button>
							<Button
								onClick={async () => {
									if (!getFieldValue('name')) {
										message.error('Product must have a name');
										return;
									}
									if (getFieldValue('costPrice') === 0 || getFieldValue('sellingPrice') === 0) {
										message.error('Cost price and Selling price cannot be zero (0)');
										return;
									}
									if (getFieldValue('sellingPrice') < getFieldValue('costPrice')) {
										message.error('Selling price cannot be smaller than cost price. You will make a loss');
										return;
									}
									if (getFieldValue('sellingPrice')  === getFieldValue('costPrice')) {
										message.warning('Selling price must be greater than cost price in order to make profit');
									}

									await createRecord({
										name: getFieldValue('name'),
										description: getFieldValue('description'),
										quantity: getFieldValue('quantity'),
										costPrice: getFieldValue('costPrice'),
										sellingPrice: getFieldValue('sellingPrice'),
										categoryId: getFieldValue('category'),
										brandId: getFieldValue('brand')
									});

									setState({ isShown: false })
								}}
								type="primary"
							>
								Save
							</Button>
						</div>
					</Drawer>
					<Avatar
						className="create-avatar"
						onClick={() => setState({ isShown: true })}
						isSolid
						name="+"
						size={60}
					/>
				</React.Fragment>
			)}
		</Component>
	);
};

const CreateComponent = Form.create()(CreateComponentRaw);



const EditComponentRaw = (props) => {
	const {row, modelName, removeProductPrice, brands, totalQuantity, productPrices, categories, keyFieldName, updateRecord, saveProductPrice} = props;
	let count = 0;
	const {getFieldDecorator, getFieldValue} = props.form;
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
					<Drawer
						title="Update Product"
						width={720}
						onClose={() => setState({ isShown: false })}
						visible={state.isShown}
						bodyStyle={{ paddingBottom: 80 }}
					>
						<Form layout="vertical">
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item label="Name">
										{getFieldDecorator('name', {
											initialValue: row.name,
											rules: [{ required: true, message: 'Please enter name of product' }],
										})(
											<Input placeholder="Enter name of product" />
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={18}>
									<Form.Item label="Description">
										{getFieldDecorator('description', {
											initialValue: row.description,
											rules: [{ required: false, message: 'Please enter description of product' }],
										})(
											<Input.TextArea placeholder="Enter description of product" />
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={6}>
									<Form.Item label="Quantity">
										<InputNumber disabled defaultValue={totalQuantity} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item label="Selling Price (GHS)">
										{getFieldDecorator('sellingPrice', {
											initialValue: row.sellingPrice,
											rules: [{ required: true, message: 'Please enter selling price' }],
										})(
											<InputNumber placeholder="Enter selling price" />
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={10}>
									<Form.Item label="Category">
										{getFieldDecorator('category', {
											initialValue: row.categoryId,
											rules: [{ required: false, message: 'Please select category' }],
										})(
											<Select
												showSearch
												style={{ width: 200 }}
												placeholder="Select category"
												optionFilterProp="children"
												filterOption={(input, option) =>
													option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
											>
												{
													categories.map(category => <Option key={category.id} value={category.id}>{category.name}</Option>)
												}
											</Select>
										)}
									</Form.Item>
								</Col>
								<Col span={10}>
									<Form.Item label="Brand">
										{getFieldDecorator('brand', {
											initialValue: row.brandId,
											rules: [{ required: false, message: 'Please select category' }],
										})(
											<Select
												showSearch
												style={{ width: 200 }}
												placeholder="Select brand"
												optionFilterProp="children"
												filterOption={(input, option) =>
													option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
											>
												{
													brands.map(brand => <Option key={brand.id} value={brand.id}>{brand.name}</Option>)
												}
											</Select>
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={12}>
									<Modal
										title={`Cost Prices for ${state.newProductName}`}
										visible={state.viewPrices}
										onOk={() => setState({ viewPrices: false })}
										onCancel={() => setState({ viewPrices: false })}
										footer={null}
									>
										<div style={{marginBottom: '20px'}}>
											<Search
												placeholder="Search cost prices"
												onChange= {e => {
													if (e.target.value) {
														setState({stateProductPrices: productPrices.filter(pp => pp.price === parseInt(e.target.value, 10))});
													} else {
														setState({stateProductPrices: productPrices});
													}
												}}
												onSearch={value => {
													console.log(value);
													if (value) {
														setState({stateProductPrices: productPrices.filter(pp => pp.price === parseInt(value, 10))});
													} else {
														setState({stateProductPrices: productPrices});
													}
												}}
												style={{ width: 200 }}
											/>
											<Button
												type='primary'
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
															backgroundColor: productPrice.id ? 'none' : '#D4EEE2',
														}}>
															{state.deleted === false ?
																<Row gutter={20} key={productPrice.id || count} className="product_price_item">
																	<Col span={5} style={{ textAlign: 'center'}}>
																		Cost Price
																		<InputNumber
																			required
																			size={20}
																			name="price"
																			disabled={!!productPrice.id}
																			value={state.price}
																			onChange={(value) => {
																				setState({price: parseFloat(value) || productPrice.price});
																			}}
																			placeholder="Price"
																		/>
																	</Col>
																	<Col span={5}>
																		Quantity
																		<InputNumber
																			name="quantity"
																			value={state.quantity}
																			onChange={(value) => {
																				setState({quantity: parseFloat(value).toFixed(2) || productPrice.quantity});
																			}}
																			placeholder="Quantity"
																		/>
																	</Col>
																	<Col span={8}>
																		Actions
																		<div>
																			<Button
																				intent="success" style={{marginRight: '5px'}}
																				onClick={() => {
																					// setState({ price: state.price, quantity: state.quantity });
																					console.log(state);
																					saveProductPrice({
																						price: state.price,
																						quantity: state.quantity,
																						id: state.id
																					}, row);
																				}}>Save</Button>
																			<Button type='danger' onClick={() =>
																				Modal.confirm({
																					title: 'Are you sure delete this cost price?',
																					content: 'Some descriptions',
																					okText: 'Yes',
																					okType: 'danger',
																					cancelText: 'No',
																					onOk() {
																						if (productPrice.id) {
																							removeProductPrice(productPrice);
																						}
																						setState({ deleted: true, showDeleteDialog: false });
																					},
																					onCancel() {
																						setState({ showDeleteDialog: false })
																					},
																				})
																			}>
																				-
																			</Button>
																		</div>
																	</Col>
																	<Col span={6}></Col>
																</Row> : ''
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
												Close
											</Button>
										</div>
									</Modal>
									<Button onClick={() => setState({ viewPrices: true })}>Product cost prices</Button>
								</Col>
							</Row>
						</Form>
						<Divider dashed />
						<Button
							onClick={() => setState({ isShown: false })} style={{ marginRight: '20px' }}
							type='danger'
						>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								await updateRecord({
									id: row.id,
									name: getFieldValue('name'),
									description: getFieldValue('description'),
									quantity: getFieldValue('quantity'),
									costPrice: getFieldValue('costPrice'),
									sellingPrice: getFieldValue('sellingPrice'),
									categoryId: getFieldValue('category'),
									brandId: getFieldValue('brand'),
								});
								setState({ isShown: false })
							}}
							type="primary"
						>
							Save
						</Button>
					</Drawer>
					<Icon
						type="edit"
						onClick={() => setState({ isShown: true })}
						size={20}
						color='primary'
					/>
				</React.Fragment>
			)}
		</Component>
	);
};

const EditComponent = Form.create()(EditComponentRaw);

const Products = (props) => {
	const {user, company, users, products, brands, categories, database, history, search, DrawerIcon, modelName} = props;
	const productsCollection = database.collections.get(pluralize(modelName));
	const productPricesCollection = database.collections.get(ProductPrice.table);


	const createRecord = async (productToCreate, options={}) => {
		console.log(productToCreate);
		console.log(options);
		await database.action(async () => {
			if (productToCreate.costPrice > productToCreate.sellingPrice) {
				message.error(`The product ${productToCreate.name} has cost price grater than selling price. You will be making a loss!`);
			}
			if (productToCreate.costPrice === productToCreate.sellingPrice) {
				message.error(`The product ${productToCreate.name} has cost price equal to selling price. You will make no profit!`);
			}
			const productExists = await productsCollection.query(Q.where('name', productToCreate.name)).fetch();
			if (productExists[0]) {
				message.warning(`Product with the name ${productToCreate.name} already exists`);
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
				message.warning(`The product ${productToCreate.name} has no brand`);
			}
			if (!category) {
				message.warning(`The product ${productToCreate.name} has no category`);
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
				productPrice.companyId = company.id;
				productPrice.createdBy.set(user);
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
				console.log(productPrice);
				console.log(record.quantity);
				await productPrice.update(aProductPrice => {
					aProductPrice.quantity = parseFloat(record.quantity);
				});
				const updatedProductPrice = await productPricesCollection.find(record.id);
				console.log(updatedProductPrice);

				message.success('Successfully updated product cost price');
			} else {
				const newProductPrice = await productPricesCollection.create(aProductPrice => {
					aProductPrice.price = record.price;
					aProductPrice.quantity = parseFloat(record.quantity);
					aProductPrice.product.set(product);
				});
				if (newProductPrice.id) {
					message.success('Successfully created product cost price');
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
				aProduct.categoryId = updatedRecord.categoryId;
				aProduct.brandId = updatedRecord.brandId;
			});

			message.success(`Successfully updated the product ${updatedRecord.name}`);
		});
	};

	return (
		<div>
			<TopNav user={user}/>
			<div id="main-area">
				{
					/*<DrawerIcon />*/
				}
				<div id="side-nav">
					<h3 id="company" onClick={() => history.push('home')}>{company.name}</h3>
					<div id="nav-list">
						<button className="nav-item active" onClick={() => history.push('products')}>Products</button>
						<button className="nav-item" onClick={() => history.push('categories')}>Categories</button>
						<button className="nav-item" onClick={() => history.push('brands')}>Brands</button>
					</div>
					<div className="bottom-area">
						<a onClick={() => history.push("sales")}>
							<Icon type="arrow-left"/>
							&nbsp; Sales
						</a><br/><br/>
						<a onClick={() => history.push("expenses")}>
							<Icon type="arrow-left"/>
							&nbsp; Expenditure
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
