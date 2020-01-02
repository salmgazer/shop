import "antd/dist/antd.css";
import React, { useRef } from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import "./Sales.scss";
import { withRouter } from "react-router-dom";
import Component from "@reactions/component";
import { Q } from "@nozbe/watermelondb";
import PropTypes from "prop-types";
import pluralize from "pluralize";
import capitalize from 'capitalize';
import {
	SideSheet,
	TextInput,
	Textarea,
	Position,
	Dialog,
	Pane,
	toaster, Avatar
	// eslint-disable-next-line import/no-unresolved
} from "evergreen-ui";
import SalesCardList from "../../../components/SalesCardList";
import MyLocal from "../../../services/MyLocal";
import User from "../../../model/users/User";
import Company from "../../../model/companies/Company";
import Sale from "../../../model/sales/Sale";
import Grid from "@material-ui/core/Grid/Grid";
import Product from "../../../model/products/Product";
import Chip from "@material-ui/core/Chip/Chip";
import Customer from "../../../model/customers/Customer";
import ReactToPrint from "react-to-print";
import SaleEntry from "../../../model/saleEntries/SaleEntry";
import ProductPrice from "../../../model/productPrices/ProductPrice";
import {InputNumber, Select, Button, Icon, Form, Switch, message, Modal, Row, Col, Drawer} from "antd";
import TopNav from "../../../components/TopNav";
import Installment from "../../../model/installments/Installment";
const { Option } = Select;

const fieldNames = [
  { name: "discount", label: "Discount", type: "number" },
  { name: "customer", label: "Customer" },
  { name: "total", label: "Total" },
  { name: "createdBy", label: "Created By", type: "string" },
  { name: "phone", label: "Phone", type: "string" },
  { name: "createdAt", label: "Created", type: "string" },
  { name: "updatedAt", label: "Updated", type: "string" }
];

export class ComponentToPrint extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      saleEntries,
      discount,
      customer,
      customers,
      company,
      products,
			saleType
    } = this.props;
    const currentCustomer = customer
      ? customers.find(c => c.id === customer)
      : null;
    let count = 0;
    let saleTotal = 0;
    saleEntries.forEach(se => {
    	saleTotal += se.total;
		});

    return (
      <div id="receipt-div">
        <header className="clearfix">
          <h1>{company.name}</h1>
          <div id="company" className="clearfix">
            <div>{company.name}</div>
            <div>{company.locationName}</div>
            <div>{company.phone}</div>
            <div>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </div>
            <div>{new Date().toLocaleString("en-US")}</div>
          </div>

          {currentCustomer ? (
            <div id="project">
              <div>
                <span>Customer</span>
                {currentCustomer.name}
              </div>
              <div>
                <span>Phone</span>
                {currentCustomer.phone}
              </div>
							<div>
								<span>Type</span>
								<b>{capitalize(saleType)}</b>
							</div>
            </div>
          ) : (
            ""
          )}

          {/*
					<div id="project">
						<div><span>Customer</span>logo.png</div>
						<div><span>CLIENT</span> John Doe</div>
						<div><span>ADDRESS</span> 796 Silver Harbour, TX 79273, US</div>
						<div><span>EMAIL</span> <a href="mailto:john@example.com">john@example.com</a></div>
						<div><span>DATE</span> August 17, 2015</div>
						<div><span>DUE DATE</span> September 17, 2015</div>
					</div>
					*/}
        </header>
        <main>
          <table>
            <thead>
              <tr>
                <th></th>
                <th className="service">PRODUCT</th>
                <th>QUANTITY</th>
                <th>UNIT PRICE</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {saleEntries.map(saleEntry => {
              	let product;
              	if (saleEntry.product) {
									product = products.find(
										p => p.id === saleEntry.product.id
									);
								} else {
									product = products.find(
										p => p.id === saleEntry.productId
									);
								}
                count = count + 1;
                return (
                  <tr key={product.id}>
                    <td>({count})</td>
                    <td className="service">{product.name}</td>
										<td className="qty">{saleEntry.quantity}</td>
                    <td className="unit">{saleEntry.sellingPrice}</td>
                    <td className="total">GHS {saleEntry.total}</td>
                  </tr>
                );
              })}
              <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
              <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
              {discount && discount > 0 ? (
                <tr>
                  <td colSpan="4" className="grand total">
                    DISCOUNT
                  </td>
                  <td className="grand total">GHS {discount}</td>
                </tr>
              ) : (
                ""
              )}
              {discount && discount > 0 ? (
                <tr>
                  <td colSpan="4" className="grand total">
                    TOTAL BEFORE DISCOUNT
                  </td>
                  <td className="grand total">GHS {saleTotal}</td>
                </tr>
              ) : (
                ""
              )}
              <tr>
                <td colSpan="4" className="grand total">
                  GRAND TOTAL
                </td>
                <td className="grand total">GHS {saleTotal - discount}</td>
              </tr>
            </tbody>
          </table>
          {/*
						<div id="notices">
							<div>NOTICE:</div>
							<div className="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>
						</div>
						*/}
        </main>
        <footer>
          Invoice was created on a computer and is valid without the signature
          and seal.
        </footer>
      </div>
    );
  }
}

const SaleEntryComponentRaw = props => {
  const {
    products,
    updateSaleEntry,
    saleEntry,
    removeSaleEntry,
    productPrices,
    saleEntries,
  } = props;

  const {getFieldDecorator, getFieldValue} = props.form;

  const [selectedProductId, setSelectedProductId] = React.useState(
    saleEntry.product ? saleEntry.product.id : null
  );

  const [stateQuantity, setStateQuantity] = React.useState(
    saleEntry.quantity || 0
  );

  let productTotalCount = 0;

  const prices = selectedProductId
    ? productPrices.filter(pp => pp._raw.product_id === selectedProductId)
    : [];

  prices.forEach(productPrice => {
    productTotalCount += productPrice.quantity;
  });

  const product = selectedProductId
    ? products.find(p => p.id === selectedProductId)
    : null;

  return (
    <Grid container spacing={1} className="sale-entry">
      <Grid item style={{ marginRight: "7px" }}>
        {/*
					<SelectMenu
						filterPlaceholder='Select product'
						title="Select product"
						options={
							products.map(product => ({ label: product.name, value: product.id }))
						}
						selected={selectedProduct}
						onSelect={item => {
							setSelectedProduct(item.value);
							const p = products.find(p => p.id === item.value);
							updateSaleEntry({
								sellingPrice: p.sellingPrice,
								quantity: stateQuantity,
								type: saleEntry.type,
								total: p.sellingPrice * stateQuantity || 0,
								productId: p.id,
								key: saleEntry.key,
								product: p
							});
						}}
						style={{marginBottom: '20px'}}
					>
						<Button>{product ? product.name : 'Select product...'}</Button>
					</SelectMenu>
					*/}
				{getFieldDecorator('selectedProduct', {
					initialValue: product && product.id ? product.name : null,
					rules: [{ required: true, message: 'Please select product' }],
				})(
					<Select
						showSearch
						style={{ width: 120 }}
						placeholder="Select a product"
						optionFilterProp="children"
						onChange={item => {
							setSelectedProductId(item);
							const p = products.find(p => p.id === item);
							updateSaleEntry({
								sellingPrice: p.sellingPrice,
								quantity: stateQuantity,
								type: saleEntry.type,
								total: p.sellingPrice * stateQuantity || 0,
								productId: p.id,
								key: saleEntry.key,
								product: p
							});
						}}
						filterOption={(input, option) =>
							option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
							0
						}
					>
						{products.filter(p => !saleEntries.map(se => se.productId).includes(p.id)).map(product => (
							<Option key={product.id} value={product.id}>
								{product.name}
							</Option>
						))}
					</Select>
				)}
      </Grid>
      <Grid item>
        <Chip
          label={`GH₵ ${product ? product.sellingPrice : 0}`}
          variant="outlined"
        />
        <Chip
          label={`GH₵ ${product ? product.sellingPrice * stateQuantity : 0}`}
          style={{ marginLeft: "5px" }}
        />
        <Chip
          label={`${productTotalCount.toFixed(2)} left`}
          style={{ marginLeft: "5px" }}
          variant="outlined"
        />
      </Grid>

      <Grid item style={{ marginRight: "10px", marginLeft: "5px" }}>
				{getFieldDecorator('productCount', {
					initialValue: saleEntry.quantity ? saleEntry.quantity : 0,
					rules: [{ required: true, message: 'Please select product' }],
				})(
					<InputNumber
						min={0}
						max={productTotalCount}
						style={{
							width: "80px"
						}}
						onChange={value => {
							if (value > productTotalCount) {
								toaster.danger(
									`Only ${productTotalCount} ${product.name} are left`
								);
							} else {
								setStateQuantity(value || 0);
								updateSaleEntry({
									sellingPrice: product
										? product.sellingPrice
										: saleEntry.sellingPrice,
									quantity: value || 0,
									type: saleEntry.type,
									total: product ? product.sellingPrice * value : saleEntry.total,
									productId: selectedProductId ? selectedProductId : null,
									key: saleEntry.key,
									product
								});
							}
						}}
					/>
				)}
        {/*
					<input
						type="number"
						name="quantity"
						min={1}
						max={productTotalCount.toString()}
						style={{
							fontSize: '15px',
							height: '20px',
							borderRadius: '5px',
							width: '60px'
						}}
						value={stateQuantity.toString()}
						disabled={!product}
						onChange={(e) => {
							if (e.target.value > productTotalCount) {
								toaster.danger(`Only ${productTotalCount} ${product.name} are left`);
							} else {
								setStateQuantity(parseInt(e.target.value, 10) || 0);
								updateSaleEntry({
									sellingPrice: product ? product.sellingPrice : saleEntry.sellingPrice,
									quantity: parseInt(e.target.value, 10) || 0,
									type: saleEntry.type,
									total: product ? product.sellingPrice * parseInt(e.target.value, 10) : saleEntry.total,
									productId: selectedProduct ? selectedProduct : '',
									key: saleEntry.key,
									product
								});
							}
						}}
					/>
					*/}
        {/*
					<TextInput
						required
						width={50}
						name="quantity"
						value={stateQuantity}
						onChange={(e) => {
							setStateQuantity(parseInt(e.target.value, 10) || 0);
							updateSaleEntry({
								sellingPrice: product ? product.sellingPrice : saleEntry.sellingPrice,
								quantity: parseInt(e.target.value, 10) || 0,
								type: saleEntry.type,
								total: product ? product.sellingPrice * parseInt(e.target.value, 10) : saleEntry.total,
								productId: selectedProduct ? selectedProduct : '',
								key: saleEntry.key,
								product
							});
						}}
					/>
					*/}
      </Grid>
      <Grid item>
        <Button
          style={{ color: "red" }}
          onClick={() => removeSaleEntry(saleEntry.key)}
        >
          -
        </Button>
      </Grid>
    </Grid>
  );
};

const SaleEntryComponent = Form.create()(SaleEntryComponentRaw);


const CreateComponent = props => {
  const [open, setOpen] = React.useState(false);
  const [salesEntries, setSaleEntries] = React.useState([]);
  const [count, setCount] = React.useState(0);
  const {
    createRecord,
    products,
    customers,
    company,
    database,
    productPrices
  } = props;
  const [salesTotal, setSalesTotal] = React.useState(0);
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);
  const [discount, setDiscount] = React.useState(0);
  const componentRef = useRef();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const removeSaleEntry = key => {
    const newSalesEntries = salesEntries.filter(se => se.key !== key);
    setSaleEntries(newSalesEntries);
    let newSalesTotal = 0;
    newSalesEntries.forEach(se => {
      newSalesTotal += se.total;
    });
    setSalesTotal(newSalesTotal.toFixed(2));
  };

  const handleClose = () => {
    // setSaleEntries([]);
    setOpen(false);
  };

  const upateSaleEntry = saleEntry => {
    const newSaleEntries = salesEntries;
    const entry = newSaleEntries.find(se => se.key === saleEntry.key);
    entry.productId = saleEntry.productId;
    entry.quantity = saleEntry.quantity;
    entry.sellingPrice = saleEntry.sellingPrice;
    entry.type = saleEntry.type;
    entry.total = saleEntry.total;
    setSaleEntries(newSaleEntries);
    let newSalesTotal = 0;
    salesEntries.forEach(se => {
      newSalesTotal += se.total;
    });
    setSalesTotal(newSalesTotal.toFixed(2));
  };

  return (
    <div>
      <React.Fragment>
				<Drawer
					title="Sales and Invoice"
					width='100%'
					onClose={handleClose}
					visible={open}
					bodyStyle={{ paddingBottom: 80 }}
				>
					<Row>
						<Col span={8} id="calculator-view">
							<h1 style={{ fontSize: "50px", color: "red" }}>Total</h1>
							<div style={{ fontSize: "60px" }}>
								<b style={{ color: "#09d3ac" }}>GH₵</b>
								<br /> {(salesTotal - discount).toFixed(2)}
							</div>
							{discount && discount > 0 ? (
								<div style={{ marginTop: "50px" }}>
									<h1 style={{ fontSize: "30px", color: "red" }}>
										<b>Discount</b>
										<br />
										GH₵ {discount}
									</h1>
								</div>
							) : (
								""
							)}
							{discount && discount > 0 ? (
								<div style={{ marginTop: "20px" }}>
									<h1 style={{ fontSize: "25px" }}>
										<b>Before discount</b>
										<br />
										GH₵ {salesTotal}
									</h1>
								</div>
							) : (
								""
							)}
						</Col>
						<Col span={2}></Col>
						<Col span={14}>
							<div id="add-item">
								<Button
									type="primary"
									shape="round"
									icon="plus"
									size="large"
									onClick={() => {
										if (salesEntries.length === products.length) {
											return;
										}
										setCount(count + 1);
										setSaleEntries(
											salesEntries.concat([
												{
													productId: "",
													quantity: "",
													sellingPrice: "",
													type: "sold",
													key: count,
													total: 0
												}
											])
										);
									}}
								>
									Add Item
								</Button>
							</div>
							<div style={{ marginBottom: '20px' }}>
								<b
									style={{
										marginLeft: "50px",
										marginRight: "20px",
										fontWeight: "normal"
									}}
								>
									Select customer:
								</b>
								<Select
									showSearch
									style={{ width: '60%' }}
									placeholder="Select a customer"
									optionFilterProp="children"
									onChange={item => setSelectedCustomer(item)}
									filterOption={(input, option) =>
										option.props.children
											.toLowerCase()
											.indexOf(input.toLowerCase()) >= 0
									}
								>
									{customers.map(customer => (
										<Option key={customer.id} value={customer.id}>
											{customer.name} - {customer.phone}
										</Option>
									))}
								</Select>
							</div>
							<div  style={{ marginBottom: "40px"}}>
								<b
									style={{
										marginLeft: "50px",
										marginRight: "67px",
										fontWeight: "normal"
									}}
								>
									Discount:
								</b>
								<InputNumber
									min={0}
									defaultValue={0}
									style={{
										width: "200px"
									}}
									onChange={value => setDiscount(value)}
								/>
							</div>
							{salesEntries.map(saleEntry => (
								<SaleEntryComponent
									removeSaleEntry={removeSaleEntry}
									key={saleEntry.key}
									updateSaleEntry={upateSaleEntry}
									saleEntry={saleEntry}
									saleEntries={salesEntries}
									database={database}
									products={products}
									productPrices={productPrices}
								/>
							))}
							{salesEntries.filter(
								se => se.quantity && se.sellingPrice && se.productId
							).length > 0 ? (
								<div style={{ marginTop: "20px", marginBottom: "50px" }}>
									<Component initialState={{ isShown: false }}>
										{({ state, setState }) => (
											<Pane id="sale-save">
												<Dialog
													isShown={state.isShown}
													title="Invoice"
													onCloseComplete={() => setState({ isShown: false })}
													hasFooter={false}
												>
													<Pane height={1800} width="1000px">
														<div>
															<ReactToPrint
																trigger={() => (
																	<button
																		style={{
																			fontSize: "15px",
																			backgroundColor: "orange",
																			color: "black",
																			padding: "10px",
																			width: "100px",
																			margin: "0 auto",
																			borderRadius: "5px",
																			bottom: 0
																		}}
																	>
																		Print
																	</button>
																)}
																content={() => componentRef.current}
															/>
															<ComponentToPrint
																customers={customers}
																saleTotal={salesTotal}
																products={products}
																company={company}
																customer={selectedCustomer}
																saleEntries={salesEntries}
																discount={discount}
																saleType="invoice"
																ref={componentRef}
															/>
														</div>
													</Pane>
												</Dialog>
												<Button
													shape="round"
													icon="save"
													size="large"
													onClick={() => {
														setSaleEntries(
															salesEntries.filter(
																se => se.sellingPrice && se.productId && se.quantity
															)
														);
														createRecord(
															salesEntries,
															salesTotal,
															selectedCustomer,
															discount,
															"invoice"
														);

														setOpen(false);
														setState({ isShown: true });
													}}
												>
													Save
												</Button>
											</Pane>
										)}
									</Component>
									{/*
              <Component initialState={{ isShown: false }}>
                {({ state, setState }) => (
                  <Pane>
                    <Dialog
                      isShown={state.isShown}
                      title="Sale"
                      onCloseComplete={() => setState({ isShown: false })}
                      hasFooter={false}
                    >
                      <Pane height={1800} width="1000px">
                        <div>
                          <ReactToPrint
                            trigger={() => (
                              <button
                                style={{
                                  fontSize: "15px",
                                  backgroundColor: "orange",
                                  color: "black",
                                  padding: "10px",
                                  width: "100px",
                                  margin: "0 auto",
                                  borderRadius: "5px",
                                  bottom: 0
                                }}
                              >
                                Print
                              </button>
                            )}
                            content={() => componentRef.current}
                          />
                          <ComponentToPrint
                            customers={customers}
                            saleTotal={salesTotal}
                            products={products}
                            company={company}
                            customer={selectedCustomer}
                            saleEntries={salesEntries}
                            discount={discount}
                            ref={componentRef}
                          />
                        </div>
                      </Pane>
                    </Dialog>
                    <Button
                      size={"large"}
                      style={{
                        width: "200px",
                        fontSize: "40px",
                        height: "100px",
                        float: "right",
                        marginRight: "20px",
                        marginBottom: "50px",
                        borderRadius: "10px",
                        backgroundColor: "orange",
                        color: "white",
                        padding: "10px"
                      }}
                      onClick={() => {
                        setSaleEntries(
                          salesEntries.filter(
                            se => se.sellingPrice && se.productId && se.quantity
                          )
                        );
                        createRecord(
                          salesEntries,
                          salesTotal,
                          selectedCustomer,
                          discount,
                          "sale"
                        );
                        setState({ isShown: true });
                      }}
                    >
                      Sell
                    </Button>
                  </Pane>
                )}
              </Component>
              */}
								</div>
							) : (
								""
							)}
						</Col>
					</Row>
				</Drawer>
				<Avatar
					style={{
						backgroundColor: 'orange',
						float: 'right',
						marginRight: '20px',
						marginBottom: '20px',
            cursor: 'pointer'
					}}
					onClick={handleClickOpen}
          isSolid name="+"
          size={60}
        />
      </React.Fragment>
    </div>
  );
};

const EditComponent = props => {
	const {
		updateRecord,
		products,
		customers,
		company,
		database,
		productPrices,
    customer,
    sale,
    saleEntries
	} = props;
	const [open, setOpen] = React.useState(false);
	const [acceptCredit, setAcceptCredit] = React.useState(false);
	const [count, setCount] = React.useState(0);
	const [salesEntries, setSaleEntries] = React.useState(saleEntries.map(se => {
	  return {
	    id: se.id,
      type: se.type,
      costPrice: se.costPrice,
      sellingPrice: se.sellingPrice,
      total: se.total,
      productName: se.productName,
      companyId: se.companyId,
      product: se.product,
			quantity: se.quantity,
			productId: se.product.id
    };
  }));

	let oldSalesTotal = 0;
	salesEntries.forEach(se => {
		oldSalesTotal += se.total;
	});

	const [salesTotal, setSalesTotal] = React.useState(oldSalesTotal);
	const [selectedCustomer, setSelectedCustomer] = React.useState(sale.customerId);
	const [discount, setDiscount] = React.useState(sale.discount);
	const [cashReceived, setCashReceived] = React.useState(0);
	const componentRef = useRef();



	const handleClickOpen = () => {
		setOpen(true);
	};

	const removeSaleEntry = key => {
		const newSalesEntries = salesEntries.filter(se => se.key !== key);
		setSaleEntries(newSalesEntries);
		let newSalesTotal = 0;
		newSalesEntries.forEach(se => {
			newSalesTotal += se.total;
		});
		setSalesTotal(newSalesTotal);
	};

	const handleClose = () => {
		setSaleEntries([]);
		setOpen(false);
	};

	const upateSaleEntry = async saleEntry => {
		const newSaleEntries = salesEntries;
		const entry = newSaleEntries.find(se => se.key === saleEntry.key);
		entry.productId = saleEntry.productId;
		entry.quantity = saleEntry.quantity;
		entry.sellingPrice = saleEntry.sellingPrice;
		entry.type = saleEntry.type;
		entry.total = saleEntry.total;
		setSaleEntries(newSaleEntries);
		let newSalesTotal = 0;
		salesEntries.forEach(se => {
			newSalesTotal += se.total;
		});
		setSalesTotal(newSalesTotal);

		/*
		await database.action(async () => {
			const saleEntryToUpdate = await database.collections.get(SaleEntry.table).find(saleEntry.id);
			await saleEntryToUpdate.update(aSaleEntry => {

			});
		});
		*/
	};


	return (
		<div>
			<React.Fragment>
				<Drawer
					title="Sales and Invoice"
					width='100%'
					onClose={handleClose}
					visible={open}
					bodyStyle={{ paddingBottom: 80 }}
				>
					<Row>
						<Col span={8} id="calculator-view">
							<h1 style={{ fontSize: "50px", color: "red" }}>Total</h1>
							<div style={{ fontSize: "60px" }}>
								<b style={{ color: "#09d3ac" }}>GH₵</b>
								<br /> {(salesTotal - discount).toFixed(2)}
							</div>
							{discount && discount > 0 ? (
								<div style={{ marginTop: "50px" }}>
									<h1 style={{ fontSize: "30px", color: "red" }}>
										<b>Discount</b>
										<br />
										GH₵ {discount}
									</h1>
								</div>
							) : (
								""
							)}
							{discount && discount > 0 ? (
								<div style={{ marginTop: "20px" }}>
									<h1 style={{ fontSize: "25px" }}>
										<b>Before discount</b>
										<br />
										GH₵ {salesTotal}
									</h1>
								</div>
							) : (
								""
							)}
						</Col>
						{/*<SideSheet isShown={open} onCloseComplete={handleClose} style={{}}>*/}
						<Col span={2}></Col>
						<Col span={14}>
							<div id="add-item">
								<Button
									type="primary"
									shape="round"
									icon="plus"
									size="large"
									onClick={() => {
										if (salesEntries.length === products.length) {
											return;
										}
										setCount(count + 1);
										setSaleEntries(
											salesEntries.concat([
												{
													productId: "",
													quantity: "",
													sellingPrice: "",
													type: "sold",
													key: count,
													total: 0
												}
											])
										);
									}}
								>
									Add Product
								</Button>
							</div>
							<div style={{ marginBottom: '20px' }}>
								<b
									style={{
										marginLeft: "50px",
										marginRight: "20px",
										fontWeight: "normal"
									}}
								>
									Select customer:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</b>
								<Select
									showSearch
									style={{ width: '60%' }}
									placeholder="Select a customer"
									optionFilterProp="children"
									value={customer.id}
									onChange={item => setSelectedCustomer(item)}
									filterOption={(input, option) =>
										option.props.children
											.toLowerCase()
											.indexOf(input.toLowerCase()) >= 0
									}
								>
									{customers.map(customer => (
										<Option key={customer.id} value={customer.id}>
											{customer.name} - {customer.phone}
										</Option>
									))}
								</Select>
							</div>
							<div  style={{ marginBottom: "20px"}}>
								<b
									style={{
										marginLeft: "50px",
										marginRight: "50px",
										fontWeight: "normal"
									}}
								>
									Discount (GHS):
								</b>
								<InputNumber
									min={0}
									defaultValue={0}
									style={{
										width: "200px"
									}}
									value={discount}
									onChange={value => setDiscount(value)}
								/>
							</div>
							<div  style={{ marginBottom: "20px"}}>
								<b
									style={{
										marginLeft: "16px",
										marginRight: "50px",
										fontWeight: "normal"
									}}
								>
									Cash received (GHS):
								</b>
								<InputNumber
									min={0}
									defaultValue={0}
									style={{
										width: "200px"
									}}
									onChange={value => setCashReceived(value)}
								/>
							</div>
							<div  style={{ marginBottom: "40px"}}>
								<b
									style={{
										marginLeft: "50px",
										marginRight: "20px",
										fontWeight: "normal"
									}}
								>
									Change (GHS):
								</b>
								<Chip label={(cashReceived - (salesTotal - discount)).toFixed(2)} variant="outlined" />
								<b style={{marginLeft: '50px', fontWeight: 'normal', marginRight: '20px'}} color="red">Accept credit</b>
								<Switch checkedChildren="Yes" unCheckedChildren="No" onChange={setAcceptCredit} />
							</div>
							{salesEntries.map(saleEntry => (
								<SaleEntryComponent
									removeSaleEntry={removeSaleEntry}
									key={saleEntry.id}
									updateSaleEntry={upateSaleEntry}
									saleEntry={saleEntry}
									saleEntries={salesEntries}
									database={database}
									products={products}
									productPrices={productPrices}
								/>
							))}
							{salesEntries.filter(
								se => se.quantity && se.sellingPrice && se.productId
							).length > 0 ? (
								<div style={{ marginTop: "20px", marginBottom: "50px" }}>
									<Component initialState={{ isShown: false, actualSaleType: sale.type }}>
										{({ state, setState }) => (
											<Pane id="sale-save">
												<Dialog
													isShown={state.isShown}
													title="Invoice"
													onCloseComplete={() => setState({ isShown: false })}
													hasFooter={false}
												>
													<Pane height={1800} width="1000px">
														<div>
															<ReactToPrint
																trigger={() => (
																	<button
																		style={{
																			fontSize: "15px",
																			backgroundColor: "orange",
																			color: "black",
																			padding: "10px",
																			width: "100px",
																			margin: "0 auto",
																			borderRadius: "5px",
																			bottom: 0
																		}}
																	>
																		Print
																	</button>
																)}
																content={() => componentRef.current}
															/>
															<ComponentToPrint
																customers={customers}
																saleTotal={salesTotal}
																products={products}
																company={company}
																customer={selectedCustomer}
																saleEntries={salesEntries}
																discount={discount}
																ref={componentRef}
																saleType={state.actualSaleType}
															/>
														</div>
													</Pane>
												</Dialog>
												<Row gutter={16} style={{ margin: '0 auto' }}>
													<Col span={8}>
														<Button
															type='danger'
															onClick={() => {
																setSaleEntries(
																	salesEntries.filter(
																		se => se.sellingPrice && se.productId && se.quantity
																	)
																);
																updateRecord({
																	salesEntries,
																	salesTotal,
																	selectedCustomer,
																	discount,
																	sale,
																	cashReceived,
																	saleType: "sale",
																	acceptCredit
																});
																setState({ isShown: true, actualSaleType: "sale" });
															}}
														>
															Sell
														</Button>
													</Col>
													<Col span={8}>
														<Button
															onClick={() => {
																setSaleEntries(
																	salesEntries.filter(
																		se => se.sellingPrice && se.productId && se.quantity
																	)
																);

																updateRecord({
																	salesEntries,
																	salesTotal,
																	selectedCustomer,
																	discount,
																	sale,
																	cashReceived,
																	saleType: "invoice",
																	acceptCredit
																});
																setOpen(false);
																setState({ isShown: true, actualSaleType: "invoice" });
															}}
														>
															Save
														</Button>
													</Col>
													<Col span={8}>
														<Button
															type='primary'
															onClick={() => {
																setSaleEntries(
																	salesEntries.filter(
																		se => se.sellingPrice && se.productId && se.quantity
																	)
																);

																setOpen(false);
																setState({ isShown: true });
															}}
														>
															Print
														</Button>
													</Col>
												</Row>
											</Pane>
										)}
									</Component>
								</div>
							) : (
								""
							)}
						</Col>
						{/*</SideSheet>*/}
						</Row>
				</Drawer>
				<Icon
					type="edit"
					onClick={handleClickOpen}
				/>
			</React.Fragment>
		</div>
	);
};

const EnhancedEditComponent = withDatabase(
	withObservables([], ({ database, sale }) => ({
		saleEntries: database.collections.get(SaleEntry.table).query(Q.where('sale_id', sale.id)).observe(),
    customer: database.collections.get(Customer.table).find(sale.customerId),
	}))(withRouter(EditComponent))
);

/*
const EditComponent = props => {
  const { row, modelName, keyFieldName, updateRecord } = props;
  return (
    <Component
      initialState={{
        isShown: false,
        newSaleNotes: row.note || "",
        newSalePhone: row.phone || ""
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
                Update {modelName}
              </h3>
              <TextInput
                required
                name="phone"
                value={state.newSalePhone}
                onChange={e => setState({ newSalePhone: e.target.value })}
                placeholder="Phone number of sale"
                style={{
                  marginBottom: "20px",
                  fontSize: "25px",
                  height: "50px"
                }}
              />
              <Textarea
                name="note"
                value={state.newSaleNotes}
                onChange={e => setState({ newSaleNotes: e.target.value })}
                placeholder="Note about sale"
                style={{ marginBottom: "20px", fontSize: "25px" }}
              />
              <div style={{ margin: "0 auto", marginTop: "20px" }}>
                <Button
                  onClick={() => setState({ isShown: false })}
                  intent="danger"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateRecord({
                      id: row[keyFieldName],
                      name: state.newSaleName,
                      note: state.newSaleNotes,
                      phone: state.newSalePhone
                    });
                    setState({ isShown: false });
                  }}
                  intent="success"
                  style={{ marginLeft: "20px" }}
                >
                  Save
                </Button>
              </div>
            </div>
          </SideSheet>
          {
            row.type === 'invoice' ?
							<Icon
								type="edit"
								onClick={() => setState({ isShown: true })}
								className="hand-pointer"
								size={20}
								color="muted"
							/> : ''
          }
        </React.Fragment>
      )}
    </Component>
  );
};
*/

const Sales = props => {
  const {
    user,
    company,
    sales,
    users,
    database,
    history,
    parentLocation,
    products,
    search,
    DrawerIcon,
    modelName,
    productPrices,
    customers
  } = props;
  const salesCollection = database.collections.get(pluralize(modelName));
  const saleEntriesCollection = database.collections.get(SaleEntry.table);
  const productsCollection = database.collections.get(Product.table);
	const installmentsCollection = database.collections.get(Installment.table);

  const createRecord = async (
  	saleEntries,
		salesTotal,
		selectedCustomer,
		discount,
		saleType,
		cashReceived
		) => {
			const currentCustomer =
				customers.find(c => c.id === selectedCustomer) || null;

			await database.action(async () => {
				const newSale = await salesCollection.create(sale => {
					sale.discount = discount;
					sale.type = saleType;
					sale.companyId = company.id;
					sale.createdBy.set(user);
					if (currentCustomer) {
						sale.customer.set(currentCustomer);
					}
				});



      	if (newSale && newSale.id) {
        	saleEntries.forEach(async saleEntry => {
						const product = await productsCollection.find(saleEntry.productId);
						const currentProductPrices = await product.productPrices.fetch();

						let totalProductPriceQuantity = 0; //fetched so far, belongs to saleEntry
						const costPriceAllocations = [];
						currentProductPrices
							.sort((a, b) => b.createdAt - a.createdAt)
							.forEach(async pp => {
								if (totalProductPriceQuantity < saleEntry.quantity) {
									let newProductPriceQuantity = pp.quantity;
									if (pp.quantity < saleEntry.quantity) {
										totalProductPriceQuantity += pp.quantity;
										newProductPriceQuantity = 0;
									} else {
										totalProductPriceQuantity += saleEntry.quantity;
										newProductPriceQuantity = pp.quantity - saleEntry.quantity;
									}
									if (newProductPriceQuantity !== pp.quantity) {
										if (saleType === "sale") {
											// dont make changes to productPrice when dealing with invoice
											costPriceAllocations.push({
												price: pp.price,
												quantity: pp.quantity - newProductPriceQuantity
											});

											/*
											await database.action(async () => {
												await pp.update(aPp => {
													aPp.quantity = newProductPriceQuantity;
												});
											});
											*/
										}

										await database.action(async () => {
											const createdSE = await saleEntriesCollection.create(newSaleEntry => {
												newSaleEntry.quantity = saleEntry.quantity;
												newSaleEntry.sellingPrice = saleEntry.sellingPrice;
												newSaleEntry.type = saleEntry.type;
												newSaleEntry.total = saleEntry.total;
												newSaleEntry.product.set(product);
												newSaleEntry.productName = product.name;
												newSaleEntry.sale.set(newSale);
												newSaleEntry.costPriceAllocations = costPriceAllocations;
											});
											console.log("!!!!!!!!!!!!!!!!!!!");
											console.log(createdSE);
											console.log("!!!!!!!!!!!!!!!!!!!");
										});
									}
								}
							});
        	});
      	}
    });
  };

	const updateRecord = async (options) => {
		console.log(options);
		const { sale, selectedCustomer, discount, salesEntries, saleType, cashReceived, salesTotal, acceptCredit } = options;

		const currentCustomer =
			customers.find(c => c.id === selectedCustomer) || null;

		await database.action(async () => {

			const installments = await installmentsCollection.query(Q.where('sale_id', sale.id)).fetch();
			let totalPaid = 0;
			installments.forEach(ins => {
				totalPaid += ins.amount;
			});

			let paymentStatus = 'unpaid';
			if ((totalPaid + cashReceived + discount) >= salesTotal) {
				paymentStatus = 'full payment'
			} else if ((totalPaid + cashReceived + discount) < salesTotal && (totalPaid + cashReceived) > 0 ) {
				paymentStatus = 'part payment';
			}

			console.log(paymentStatus);
			console.log(paymentStatus);
			console.log(paymentStatus);
			console.log(totalPaid);
			console.log(totalPaid);
			console.log(totalPaid);
			console.log(totalPaid + cashReceived);
			console.log(totalPaid + cashReceived);
			console.log(totalPaid + cashReceived);
			console.log(cashReceived);
			console.log(cashReceived);
			console.log(cashReceived);

			const updatedSale = await salesCollection.find(sale.id);
			console.log(updatedSale);
			console.log(saleType);
			await updatedSale.update(aSale => {
				aSale.discount = discount;
				console.log(aSale);
				aSale.type = saleType;
				aSale.paymentStatus = paymentStatus;
				aSale.createdBy.set(user);
				aSale.customer.set(currentCustomer);
			});

			if (saleType === 'sale') {
				if (cashReceived < (salesTotal - discount - totalPaid) && acceptCredit === false) {
					message.error(`You need to enter adequate cash amount received`);
					return;
				}

				if (cashReceived > (salesTotal - discount - totalPaid)) {
					const change = (cashReceived - (salesTotal - discount - totalPaid)).toFixed(2);
					Modal.warning({
						title: `Give change to ${currentCustomer.name}`,
						content: <b>You need to give change of GHS {change}</b>,
					});
				}

				if (cashReceived && cashReceived > 0) {
					// add installment
					await installmentsCollection.create(installment => {
						installment.sale.set(updatedSale);
						installment.createdBy.set(user);
						installment.amount = cashReceived <= (salesTotal - totalPaid) ?  cashReceived : salesTotal - totalPaid;
					});
				}
			}


			const oldSaleEntries = await saleEntriesCollection.query(Q.where('sale_id', sale.id)).fetch();
			oldSaleEntries.forEach(async se => await se.remove());

			salesEntries.forEach(async saleEntry => {
				const product = await productsCollection.find(saleEntry.productId);
				const currentProductPrices = await product.productPrices.fetch();

				let totalProductPriceQuantity = 0; //fetched so far, belongs to saleEntry
				const costPriceAllocations = [];
				currentProductPrices
					.sort((a, b) => b.createdAt - a.createdAt)
					.forEach(async pp => {
						if (totalProductPriceQuantity < saleEntry.quantity) {
							let newProductPriceQuantity = pp.quantity;
							if (pp.quantity < saleEntry.quantity) {
								totalProductPriceQuantity += pp.quantity;
								newProductPriceQuantity = 0;
							} else {
								totalProductPriceQuantity += saleEntry.quantity;
								newProductPriceQuantity = pp.quantity - saleEntry.quantity;
							}
							if (newProductPriceQuantity !== pp.quantity) {
								// dont make changes to productPrice when dealing with invoice
								costPriceAllocations.push({
									price: pp.price,
									quantity: pp.quantity - newProductPriceQuantity
								});

								if (saleType === "sale") {
									await database.action(async () => {
										await pp.update(aPp => {
											aPp.quantity = newProductPriceQuantity;
										});
									});
								}

								await database.action(async () => {
									await saleEntriesCollection.create(newSaleEntry => {
										newSaleEntry.quantity = saleEntry.quantity;
										newSaleEntry.sellingPrice = saleEntry.sellingPrice;
										newSaleEntry.type = saleEntry.type;
										newSaleEntry.total = saleEntry.total;
										newSaleEntry.product.set(product);
										newSaleEntry.productName = product.name;
										newSaleEntry.sale.set(sale);
										newSaleEntry.costPriceAllocations = costPriceAllocations;
									});
								});
							}
						}
					});
			});
		});
	};

  const clearAll = () => {
    database.action(async () => {
      const saleEntries = await saleEntriesCollection.query().fetch();
      saleEntries.forEach(async se => {
        console.log(`About to remove  sale entry${se.id}`);
        await se.remove();
      });

      const sales = await salesCollection.query().fetch();
      sales.forEach(async sale => {
        console.log(`About to remove sale ${sale.id}`);
        await sale.remove();
      });
    });
  };

  const deleteRecord = async id => {
    await database.action(async () => {
      const sale = await salesCollection.find(id);
      await sale.remove();
    });
  };

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
            <button
              className="nav-item active"
              onClick={() => history.push("sales")}
            >
              Sales
            </button>
            <button
              className="nav-item"
              onClick={() => history.push("customers")}
            >
              Customers
            </button>
            <button
              className="nav-item"
              onClick={() => history.push("dashboard")}
            >
              Dashboard
            </button>
          </div>
          <div className="bottom-area">
            <a onClick={() => history.push("products")}>
              <Icon type="arrow-left" />
              Jump to Inventory
            </a>
          </div>
        </div>
        <div id="main-body">
          <div>
            <SalesCardList
              entries={sales.sort((a, b) => b.updatedAt - a.updatedAt)}
              users={users}
              EditComponent={EnhancedEditComponent}
              updateRecord={updateRecord}
              displayNameField="name"
              keyFieldName="id"
              fieldNames={fieldNames}
              modelName={modelName}
              database={database}
              deleteRecord={deleteRecord}
              search={search}
              user={user}
              model={Sale}
              customers={customers}
              products={products}
              productPrices={productPrices}
							company={company}
            />
          </div>
          <div id="bottom-area">
            <CreateComponent
              productPrices={productPrices}
              database={database}
              customers={customers}
              company={company}
              createRecord={createRecord}
              products={products}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const EnhancedSales = withDatabase(
  withObservables(["searchConfig"], ({ database, searchConfig }) => ({
    sales: database.collections
      .get(Sale.table)
      .query(
        Q.where(
          searchConfig.key,
          Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`)
        )
      )
      .observe(),
    company: database.collections.get(Company.table).find(MyLocal.companyId),
    user: database.collections.get(User.table).find(MyLocal.userId),
    users: database.collections
      .get(User.table)
      .query()
      .observe(),
    products: database.collections
      .get(Product.table)
      .query()
      .observe(),
    customers: database.collections
      .get(Customer.table)
      .query()
      .observe(),
    productPrices: database.collections
      .get(ProductPrice.table)
      .query()
      .observe()
  }))(withRouter(Sales))
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
      <EnhancedSales
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
    company: database.collections.get(Company.table).find(MyLocal.companyId),
    user: database.collections.get(User.table).find(MyLocal.userId)
  }))(withRouter(Parent))
);

export default EnhancedParent;

Parent.propTypes = {
  company: PropTypes.object.isRequired
};
