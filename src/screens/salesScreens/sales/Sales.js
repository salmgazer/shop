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
	Dialog,
	Pane,
	Avatar,
	// eslint-disable-next-line import/no-unresolved
} from "evergreen-ui";
import {CreateComponent as CreateCustomerComponent, createCustomerRecord} from '../customers/Customers';
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
import {InputNumber, Button, Icon, Form, Switch, message, Modal, Row, Col, Drawer, Select} from "antd";
import TopNav from "../../../components/TopNav";
import Installment from "../../../model/installments/Installment";
import UserCompany from "../../../model/userCompanies/UserCompany";
import ReactSelect from 'react-select';
import Functions from '../../../utilities/Functions';
import Brand from "../../../model/brand/Brand";
import Expense from "../../../model/expenses/Expense";

const {Option} = Select;
const {numberWithCommas} = Functions;

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
                    <td className="unit">{numberWithCommas(saleEntry.sellingPrice)}</td>
                    <td className="total">GHS {numberWithCommas(saleEntry.total)}</td>
                  </tr>
                );
              })}
							{discount && discount > 0 ? (
								<tr>
									<td colSpan="4" className="grand total">
										SUB TOTAL
									</td>
									<td className="grand total">GHS {numberWithCommas(saleTotal)}</td>
								</tr>
							) : (
								""
							)}
              <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
              <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
              {discount && discount > 0 ? (
                <tr>
                  <td colSpan="4" className="grand total">
                    DISCOUNT
                  </td>
                  <td className="grand total">GHS ({numberWithCommas(discount)})</td>
                </tr>
              ) : (
                ""
              )}
              <tr>
                <td colSpan="4" className="grand total">
                  TOTAL
                </td>
                <td className="grand total">GHS {numberWithCommas(saleTotal - discount)}</td>
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
		acceptCustomSellingPrice
  } = props;

  const {getFieldDecorator} = props.form;

  const [selectedProductId, setSelectedProductId] = React.useState(
    saleEntry.productId? saleEntry.productId : saleEntry.product ? saleEntry.product.id : null
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

  console.log(acceptCustomSellingPrice);
  console.log(saleEntry);

  const selectProductOptions = products.filter(p => !saleEntries.map(se => se.productId).includes(p.id)).map(aP => ({
  	value: aP.id,
		label: aP.name
	}));

  return (
    <Grid container spacing={1} className="sale-entry" style={{borderColor: 'lightblue'}}>
      <Grid item style={{ marginRight: "5px", width: '200px' }}>
				<ReactSelect
					className="basic-single"
					isClearable={false}
					isSearchable={true}
					placeholder="Select product"
					options={selectProductOptions}
					defaultValue={selectedProductId ? {value: product.id, label: product.name} : null}
					onChange={item => {
						const p = products.find(p => p.id === item.value);
						setSelectedProductId(item.value);
						updateSaleEntry({
							sellingPrice: acceptCustomSellingPrice === true ? saleEntry.sellingPrice : p.sellingPrice,
							quantity: stateQuantity,
							type: saleEntry.type,
							total: acceptCustomSellingPrice ? saleEntry.sellingPrice * stateQuantity: p.sellingPrice * stateQuantity,
							productId: item.value,
							key: saleEntry.key,
							product: p
						});
					}}
				/>
      </Grid>
      <Grid item>
        <Chip
          label={`GH₵ ${product ? product.sellingPrice : 0}`}
          variant="outlined"
					style={{
						marginRight: '5px'
					}}
        />
				{getFieldDecorator('productSellingPrice', {
					initialValue: saleEntry ? saleEntry.sellingPrice : product.sellingPrice,
					rules: [{ required: true, message: 'Please enter selling price' }],
				})(
					<InputNumber
						min={product ? product.sellingPrice : 0}
						style={{
							width: "80px"
						}}
						disabled={!acceptCustomSellingPrice}
						onChange={value => {
							updateSaleEntry({
								sellingPrice: value || product.sellingPrice,
								quantity: stateQuantity,
								type: saleEntry.type,
								total: product ? (value || product.sellingPrice) * stateQuantity : saleEntry.total,
								productId: selectedProductId ? selectedProductId : null,
								key: saleEntry.key,
								product
							});
						}}
					/>
				)}
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
								message.error(`Only ${productTotalCount} ${product.name} are left`);
							} else {
								setStateQuantity(value);
								console.log(saleEntry);
								console.log(value);
								updateSaleEntry({
									sellingPrice: product
										&& saleEntry.sellingPrice && acceptCustomSellingPrice? saleEntry.sellingPrice
										: product.sellingPrice,
									quantity: value,
									type: saleEntry.type,
									total: product && saleEntry.sellingPrice ? saleEntry.sellingPrice * value : value * product.sellingPrice,
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
				<Chip
					label={`GH₵ ${product ? product.sellingPrice * stateQuantity : 0}`}
					style={{ marginRight: "5px" }}
				/>
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
	const [acceptCustomSellingPrice, setAcceptCustomSellingPrice] = React.useState(false);
	const [acceptCredit, setAcceptCredit] = React.useState(false);
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
    setSaleEntries([]);
    setSelectedCustomer(null);
    setAcceptCustomSellingPrice(false);
    setAcceptCredit(false);
    setDiscount(0);
    setSalesTotal(0);
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
    entry.companyId = company.id;
    setSaleEntries(newSaleEntries);
    let newSalesTotal = 0;
    salesEntries.forEach(se => {
      newSalesTotal += se.total;
    });
    setSalesTotal(newSalesTotal ? newSalesTotal.toFixed(2) : newSalesTotal);
  };

  return (
    <div>
      <React.Fragment>
				<Drawer
					title="Invoice"
					width='100%'
					onClose={handleClose}
					visible={open}
					bodyStyle={{ paddingBottom: 80 }}
				>
					<Row>
						<Col span={8} id="calculator-view">
							<h1 style={{ fontSize: "4em", color: "red", marginTop: "-0.7em", marginBottom: "-0.2em" }}>Total</h1>
							<div style={{ fontSize: "4em" }}>
								<b style={{ color: "#09d3ac" }}>GH₵</b>
								<br /> {(salesTotal - discount).toFixed(2)}
							</div>
							{discount && discount > 0 ? (
								<div style={{ marginTop: "1em" }}>
									<h1 style={{ fontSize: "2em", color: "red" }}>
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
						<Col span={14} id="actual-sales-view">
							<div id="add-item">
								<Button
									type="primary"
									shape="round"
									icon="plus"
									size="large"
									onClick={() => {
										if (salesEntries.length === products.length) {
											message.error('You have selected all items already!');
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
									style={{ width: '350px' }}
									placeholder="Select a customer"
									optionFilterProp="children"
									value={selectedCustomer}
									onChange={item => setSelectedCustomer(item)}
								>
									{customers.map(customer => (
										<Option key={customer.id} value={customer.id}>
											{customer.name} - {customer.phone}
										</Option>
									))}
								</Select>
								<CreateCustomerComponent createRecord={createCustomerRecord} database={database} company={company} buttonSize={30} buttonClass={'create-avatar-small'}/>
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
									value={discount}
									style={{
										width: "200px"
									}}
									onChange={value => setDiscount(value)}
								/>
							</div>
							<div style={{marginBottom: '20px'}}>
								<b style={{marginLeft: '50px', fontWeight: 'normal', marginRight: '20px'}} color="red">Accept custom selling price</b>
								<Switch checkedChildren="Yes" unCheckedChildren="No" onChange={setAcceptCustomSellingPrice} />
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
									acceptCustomSellingPrice={acceptCustomSellingPrice}
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
												<Row>
													<Col span={8}/>
													<Col span={8}>
														<Button
															onClick={() => {
																setSaleEntries(
																	salesEntries.filter(
																		se => se.sellingPrice && se.productId && se.quantity
																	)
																);

																createRecord({
																	salesEntries,
																	salesTotal,
																	selectedCustomer,
																	discount,
																	saleType: "invoice"
																});

																setOpen(false);
																setState({ isShown: true });
															}}
														>
															Save Invoice
														</Button>
													</Col>
													<Col span={8} />
												</Row>
											</Pane>
										)}
									</Component>
								</div>
							) : (
								""
							)}
						</Col>
					</Row>
					<div
						style={{
							position: 'absolute',
							right: 0,
							bottom: 0,
							width: '100%',
							borderTop: '1px solid #e9e9e9',
							padding: '3px 5px',
							background: '#fff',
							textAlign: 'right',
						}}
					>
						<Button
							onClick={handleClose} style={{ marginRight: 8 }}
							type='danger'
						>
							Cancel
						</Button>
					</div>
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
	const [acceptCustomSellingPrice, setAcceptCustomSellingPrice] = React.useState(false);
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
		setSelectedCustomer(null);
		setAcceptCustomSellingPrice(false);
		setAcceptCredit(false);
		setDiscount(0);
		setOpen(false);
	};

	const upateSaleEntry = async saleEntry => {
		const newSaleEntries = salesEntries;
		const entry = newSaleEntries.find(se => se.key === saleEntry.key);
		entry.productId = saleEntry.productId;
		entry.companyId = company.id;
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
	};

	const salesChange = (cashReceived - (salesTotal - discount)).toFixed(2);


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
							<h1 style={{ fontSize: "40px", color: "red" }}>Total</h1>
							<div style={{ fontSize: "35px" }}>
								<b style={{ color: "#09d3ac" }}>GH₵</b>
								{numberWithCommas((salesTotal - discount).toFixed(2))}
							</div>
							{discount && discount > 0 ? (
								<div style={{ marginTop: "30px" }}>
									<h1 style={{ fontSize: "30px", color: "red" }}>
										<b>Discount</b><br/>
										GHS {numberWithCommas(discount)}
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
										GHS {numberWithCommas(salesTotal)}
									</h1>
								</div>
							) : (
								""
							)}
							<div style={{ marginTop: "20px" }}>
								<h1 style={{ fontSize: "25px" }}>
									<b>{ salesChange < 0 ? 'Owing' : 'Change' }</b>
									<br />
									<div
										style={{
											backgroundColor: salesChange < 0 ? 'red' : 'rgb(9, 211, 172)',
											color: 'white',
											fontSize: "30px",
											borderRadius: '5px',
										}}
									>
										GHS {numberWithCommas(salesChange < 0 ? salesChange * -1 : salesChange)}
									</div>
								</h1>
							</div>
						</Col>
						{/*<SideSheet isShown={open} onCloseComplete={handleClose} style={{}}>*/}
						<Col span={2}></Col>
						<Col span={14} id='actual-sales-view'>
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
										marginRight: "42px",
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
							<div style={{ marginBottom: "40px"}}>
								<b style={{marginLeft: '50px', fontWeight: 'normal', marginRight: '20px'}} color="red">Accept credit</b>
								<Switch checkedChildren="Yes" unCheckedChildren="No" onChange={setAcceptCredit} />
								<b style={{marginLeft: '50px', fontWeight: 'normal', marginRight: '20px'}} color="red">Accept custom selling price</b>
								<Switch checkedChildren="Yes" unCheckedChildren="No" onChange={setAcceptCustomSellingPrice} />
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
									acceptCustomSellingPrice={acceptCustomSellingPrice}
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
					<div
						style={{
							position: 'absolute',
							right: 0,
							bottom: 0,
							width: '100%',
							borderTop: '1px solid #e9e9e9',
							padding: '3px 5px',
							background: '#fff',
							textAlign: 'right',
						}}
					>
						<Button
							onClick={handleClose} style={{ marginRight: 8 }}
							type='danger'
						>
							Cancel
						</Button>
					</div>
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

const Sales = props => {
  const {
    user,
    company,
    sales,
    users,
    database,
    history,
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
	const myCollection = database.collections.get(Customer.table);


	/*
	database.action(async () => {
		const values = await myCollection.query().fetch();
		console.log("###################");
		console.log(values);
		console.log("###################");
		values.forEach(async ins => {
			await ins.remove();
		});
	}).then(() => {
		console.log("Done");
	});
	*/



  const createRecord = async (options) => {
  	const { salesEntries, salesTotal, selectedCustomer, discount, saleType } = options;

			const currentCustomer = customers.find(c => c.id === selectedCustomer) || null;
			let totalSales = 0;
			salesEntries.forEach(se => {
				totalSales += (se.sellingPrice * se.quantity);
			});

			await database.action(async () => {
				const newSale = await salesCollection.create(sale => {
					sale.discount = discount;
					sale.type = saleType;
					sale.salesTotal = totalSales - discount;
					sale.companyId = company.id;
					sale.createdBy.set(user);
					if (currentCustomer) {
						sale.customer.set(currentCustomer);
					}
				});


      	if (newSale && newSale.id) {
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
										if (saleType === "sale") {
											// dont make changes to productPrice when dealing with invoice
											costPriceAllocations.push({
												price: pp.price,
												quantity: pp.quantity - newProductPriceQuantity
											});
										}

										await database.action(async () => {
											const createdInvoice = await saleEntriesCollection.create(newSaleEntry => {
												newSaleEntry.quantity = saleEntry.quantity;
												newSaleEntry.sellingPrice = saleEntry.sellingPrice;
												newSaleEntry.type = saleEntry.type;
												newSaleEntry.total = saleEntry.total;
												newSaleEntry.product.set(product);
												newSaleEntry.productName = product.name;
												newSaleEntry.sale.set(newSale);
												newSaleEntry.costPriceAllocations = costPriceAllocations;
											});
											console.info(`Successfully created Invoice ${createdInvoice.id}`);
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

			const arrears = salesTotal - (totalPaid + cashReceived + discount);
			let paymentStatus = 'unpaid';
			if ((totalPaid + cashReceived + discount) >= salesTotal) {
				paymentStatus = 'full payment'
			} else if ((totalPaid + cashReceived + discount) < salesTotal && (totalPaid + cashReceived) > 0 ) {
				paymentStatus = 'part payment';
			}

			const updatedSale = await salesCollection.find(sale.id);

			if (saleType === 'sale') {
				if (cashReceived < (salesTotal - discount - totalPaid) && acceptCredit === false) {
					message.error(`You need to enter adequate cash amount received`);
					return;
				}

				if (cashReceived > (salesTotal - discount - totalPaid)) {
					const change = (cashReceived - (salesTotal - discount - totalPaid)).toFixed(2);
					Modal.warning({
						title: `Give change to ${currentCustomer.name}`,
						content: <b>You need to give change of GHS {numberWithCommas(change)}</b>,
					});
				}

				if (cashReceived && cashReceived > 0) {
					// add installment
					await installmentsCollection.create(installment => {
						installment.sale.set(updatedSale);
						installment.createdBy.set(user);
						installment.companyId = company.id;
						installment.amount = cashReceived <= (salesTotal - totalPaid - discount) ?  cashReceived : (salesTotal - totalPaid - discount);
					});
				}
			}

			await updatedSale.update(aSale => {
				aSale.discount = discount;
				console.log(aSale);
				aSale.type = saleType;
				aSale.paymentStatus = paymentStatus;
				aSale.arrears = arrears < 0 ? 0 : arrears;
				aSale.salesTotal = salesTotal;
				aSale.createdBy.set(user);
				aSale.customer.set(currentCustomer);
			});


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
        {/*<DrawerIcon />*/}
        <div id="side-nav">
          <h3 id="company" onClick={() => history.push("home")}>
						<Icon type='home'/>&nbsp; {company.name}
          </h3>
          <div id="nav-list">
            <Button
              className="nav-item active"
            >
              Sales
            </Button>
            <Button
              className="nav-item"
              onClick={() => history.push("customers")}
            >
              Customers
            </Button>
						<Button
							className="nav-item"
							onClick={() => history.push("debtors")}
						>
							Debtors
						</Button>
            <Button
              className="nav-item"
              onClick={() => history.push("dashboard")}
            >
              Dashboard
            </Button>
          </div>
					<div className="bottom-area">
						<a onClick={() => history.push("products")}>
							<Icon type="arrow-left"/>
							&nbsp; Inventory
						</a><br/><br/>
						<a onClick={() => history.push("expenses")}>
							<Icon type="arrow-left"/>
							&nbsp; Expenditure
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
  withObservables(["searchConfig"], ({ database, searchConfig, company }) => ({
    sales: database.collections
      .get(Sale.table)
      .query(
        Q.where(
          searchConfig.key,
          Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`)
        ),
        Q.where("company_id", company.id)
      )
      .observe(),
    company: database.collections.get(Company.table).find(MyLocal.companyId),
    user: database.collections.get(User.table).find(MyLocal.userId),
    users: database.collections
      .get(User.table)
      .query(Q.on(UserCompany.table, "company_id", MyLocal.companyId))
      .observe(),
    products: database.collections
      .get(Product.table)
      .query(Q.where("company_id", company.id))
      .observe(),
    customers: database.collections
      .get(Customer.table)
      .query(Q.where("company_id", company.id))
      .observe(),
    productPrices: database.collections
      .get(ProductPrice.table)
      .query(Q.where("company_id", company.id))
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
