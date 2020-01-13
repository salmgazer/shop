import React, {useRef} from "react";
import PropTypes from "prop-types";
import pluralize from "pluralize";
import {
  Dialog,
  Pane
} from "evergreen-ui";
import Grid from "@material-ui/core/Grid";
import Component from "@reactions/component";
import capitalize from "capitalize";
import "date-fns";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import Chip from "@material-ui/core/Chip";
import Installment from "../model/installments/Installment";
import { Q } from "@nozbe/watermelondb";
import { ComponentToPrint } from '../screens/salesScreens/sales/Sales';
import ReactToPrint from "react-to-print";
import Functions from "../utilities/Functions";
import {Table, Icon, Drawer, Row, Col, Modal, InputNumber, message, Badge, Tag,
  Avatar, Empty, Divider, Button, Select} from "antd";
const {Option} = Select;
const {numberWithCommas} = Functions;


const CardListItem = props => {
  const {
    entry,
    saleEntries,
    customer,
    removeProductPrice,
    saveProductPrice,
    user,
    productPrices,
    EditComponent,
    deleteRecord,
    updateRecord,
    keyFieldName,
    modelName,
    displayNameField,
    database,
    products,
    customers,
    company,
    installments,
    users,
    createdBy
  } = props;

	const componentRef = useRef();

  let totalQuantity = 0;
  [].forEach(productPrice => {
    totalQuantity += productPrice.quantity;
  });

  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName"
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity"
    },
    {
      title: "Selling Price (GH₵)",
      dataIndex: "sellingPrice",
      key: "sellingPrice"
    },
    {
      title: "Total (GH₵)",
      dataIndex: "total",
      key: "total"
    }
  ];

	const installmentColumns = [
		{
			title: "Amount",
			dataIndex: "amount",
			key: "amount"
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date"
		},
		{
			title: "Received by",
			dataIndex: "createdBy",
			key: "createdBy"
		},
	];

  const costPricesColumns = [
    {
      title: "Cost Price",
      dataIndex: "price",
      key: "price"
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity"
    }
  ];

  let totalSales = 0;
  saleEntries.forEach(se => {
    totalSales += se.total;
  });

  let totalAmountPaid = 0;
  installments.forEach(ins => {
    totalAmountPaid += ins.amount;
  });

	const [isShown, setIsShown] = React.useState(false);
	const [openInstallmentForm, setOpenInstallmentForm] = React.useState(false);
	const [installmentAmount, setInstallmentAmount] = React.useState(0);

  const expandedRowRender = record => {
    const item = saleEntries.find(se => se.id === record.key);
    console.log(item);
    let counter = 0;
    const data = item.costPriceAllocations.map(a => {
      const newA = a;
      newA.key = counter;
      counter++;
      return newA;
    });
    return (
      <Table columns={costPricesColumns} dataSource={data} pagination={false} />
    );
  };

  const saveInstallment = async () => {
    const arrears = totalSales - entry.discount - totalAmountPaid;
    let paymentStatus = 'part payment';
    if (installmentAmount < 1) {
      message.error(`You cannot pay installment of GHS ${installmentAmount}`);
      return;
		} else if (installmentAmount > arrears) {
      message.warning(`Installment (GHS ${installmentAmount}) should not be greater than arrears (GHS ${arrears})`);
      return;
    }

    if (installmentAmount === arrears) {
      paymentStatus = 'full payment';
    }
		await database.action(async () => {
      await database.collections.get(Installment.table).create(newInstallment => {
        newInstallment.amount = installmentAmount;
        newInstallment.createdBy.set(user);
        newInstallment.companyId = company.id;
        newInstallment.sale.set(entry);
      });

      await entry.update(updatedSale => {
        updatedSale.paymentStatus = paymentStatus;
        updatedSale.arrears = arrears - installmentAmount;
      });
    });

    setOpenInstallmentForm(false);
  };

  const isSale = () => entry.type === 'sale';
  const isInvoice = () => entry.type === 'invoice';
  const isFullyPaidFor = () => entry.paymentStatus === 'full payment';
  const isPartlyPaidFor = () => entry.paymentStatus === 'part payment';
  const isNotPaidFor = () => entry.paymentStatus === 'unpaid';

  let paymentStatusComponent = <div></div>;

  const payStatusStyle = { color: 'darkgrey' };

  if (isSale()) {
    if (isFullyPaidFor()) {
      paymentStatusComponent = <Badge status="success" text={entry.paymentStatus} style={payStatusStyle}/>;
    } else if (isPartlyPaidFor()) {
      paymentStatusComponent = <Badge status="warning" text={entry.paymentStatus} style={payStatusStyle}/>;
    } else if (isNotPaidFor()) {
      paymentStatusComponent = <Badge status="error" text={entry.paymentStatus} style={payStatusStyle}/>;
    }
  }


  const [userFirstName, userLastName] = createdBy.name.split(" ");

  return (
    <Grid container spacing={1}>
      <Grid item xs={1} style={{ marginTop: "7px" }}>
        <div>
          <Drawer
            title={customer && customer.name ? `${capitalize(entry.type)} : ${customer.name} - (${customer.phone})` : `Details of ${entry.type}`}
            width='800px'
            onClose={() => setIsShown(false)}
            visible={isShown}
            bodyStyle={{paddingBottom: 80}}
          >
            <div style={{width: '90%', margin: "0 auto"}}>
              <b>Sale items</b>
              {
                isSale() ?
									<Table
										expandedRowRender={expandedRowRender}
										columns={columns}
										dataSource={saleEntries.map(saleEntry => {
											// const product = await saleEntry.product.fetch();
											const value = {
												key: saleEntry._raw.id,
												productName: saleEntry.productName,
												quantity: saleEntry._raw.quantity,
												sellingPrice: saleEntry._raw.selling_price,
												total: saleEntry._raw.total
											};
											return value;
										})}
									/> : <Table
										columns={columns}
										dataSource={saleEntries.map(saleEntry => {
											// const product = await saleEntry.product.fetch();
											const value = {
												key: saleEntry._raw.id,
												productName: saleEntry.productName,
												quantity: saleEntry._raw.quantity,
												sellingPrice: saleEntry._raw.selling_price,
												total: saleEntry._raw.total
											};
											return value;
										})}
									/>
              }
              {
                isSale() && entry.status !== 'full payment' ?
                  <div>
										<Divider dashed/>
                    <Row>
                      <Col><b style={{float: 'left'}}>Payments</b></Col>
                      <Col>
												{
													(totalSales - entry.discount) > totalAmountPaid ?
														<Button
															icon='wallet'
															type='primary'
															style={{ float: 'right' }}
															onClick={() => {
																setOpenInstallmentForm(true);
															}}>
															Pay
														</Button> : ''
												}
                      </Col>
                    </Row>
                    <Table
                      columns={installmentColumns}
                      dataSource={installments.map(installment => {
                        // const product = await saleEntry.product.fetch();
                        const receivedBy = users.find(u => u.id === installment.createdBy.id);
                        const value = {
                          key: installment.id,
                          amount: installment.amount,
                          date: installment.updatedAt.toLocaleString().split(",")[0],
                          createdBy: receivedBy ? receivedBy.name : ''
                        };
                        return value;
                      })}
                    />
                  </div> : ''
              }
							<Modal
								title={`Pay installment - Arrears (GHS ${(totalSales - entry.discount - totalAmountPaid)})`}
								visible={openInstallmentForm}
								onOk={saveInstallment}
								onCancel={() => setOpenInstallmentForm(false)}
								footer={[
									<Button key="back" onClick={() => setOpenInstallmentForm(false)}>
										Cancel
									</Button>,
									<Button key="submit" type="primary" onClick={() => saveInstallment()}>
										Save
									</Button>,
								]}
							>
								<InputNumber
									min={0}
									style={{
										width: "200px"
									}}
									onChange={value => setInstallmentAmount(value)}
								/>
							</Modal>
							<Divider dashed>{capitalize(entry.type)} Details</Divider>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "lighter",
                  marginBottom: "20px"
                }}
              >
                <b style={{fontWeight: "300"}}>Total: GH₵ {totalSales}</b>
              </div>
              {entry.discount && entry.discount > 0 ? (
                <div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "lighter",
                      marginBottom: "20px"
                    }}
                  >
                    <b style={{fontWeight: "300"}}>
                      Discount: GH₵ {entry.discount}
                    </b>
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "lighter",
                      marginBottom: "20px"
                    }}
                  >
                    <b style={{fontWeight: "300"}}>
                      Total after discount: GH₵{" "}
                      {totalSales - entry.discount}
                    </b>
                  </div>
                </div>
              ) : (
                ""
              )}
              {
                entry.type === 'sale' && totalAmountPaid < (totalSales - entry.discount) ?
                  <div
										style={{
											fontSize: "20px",
											fontWeight: "lighter",
											marginBottom: "20px"
										}}
                  >
										<b style={{fontWeight: "300", color: 'red'}}>
											Owing: GH₵ { (totalSales - entry.discount ) - totalAmountPaid }
										</b>
                  </div> : ''
              }
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "lighter",
                  marginBottom: "20px"
                }}
              >
                {customer && customer.name ? (
                  <b style={{fontWeight: "300"}}>
                    Customer:{" "}
                    <Chip label={customer.name} variant="outlined"/>
                  </b>
                ) : (
                  ""
                )}
              </div>
              {
                isSale() ? <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "lighter",
                    marginBottom: "20px"
                  }}
                >
                  <b style={{fontWeight: "300"}}>
                    Payment status:{" "}
                    <Chip label={entry.paymentStatus} variant="outlined"/>
                  </b>
                </div> : ''
              }
							<Divider dashed style={{marginTop: '50px'}}>Actions</Divider>
              <Row gutter={16} style={{marginTop: '20px', margin: '0 auto', textAlign: 'center'}}>
                  <Col span={7} />
                  <Col span={3}>
                    <Component initialState={{isShownPrint: false}}>
                      {({state, setState}) => (
                        <Pane>
                          <Dialog
                            isShown={state.isShownPrint}
                            title="Invoice"
                            onCloseComplete={() => setState({isShownPrint: false})}
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
                                  saleTotal={entry.total}
                                  products={products}
                                  company={company}
                                  customer={entry.customer.id}
                                  saleEntries={saleEntries}
                                  discount={entry.discount}
                                  saleType={entry.type}
                                  ref={componentRef}
                                />
                              </div>
                            </Pane>
                          </Dialog>
                          <Button
                            onClick={() => {
                              setIsShown(false);
                              setState({isShownPrint: true});
                            }}
                          >
                            Print
                          </Button>
                        </Pane>
                      )}
                    </Component>
                  </Col>
                  <Col span={3}>
                    <Button
                      onClick={() => setIsShown(false)}
                      type="danger"
                    >
                      Close
                    </Button>
                  </Col>
                  <Col span={3}>
                    {
                      isInvoice() ?
                        <Button type='primary' style={{marginLeft: '10px'}}>
                          <EditComponent
                            sale={entry}
                            modelName={modelName}
                            updateRecord={updateRecord}
                            keyFieldName={keyFieldName}
                            totalQuantity={totalQuantity}
                            productPrices={productPrices}
                            removeProductPrice={removeProductPrice}
                            saveProductPrice={saveProductPrice}
                            products={products}
                            customers={customers}
                            company={company}
                          />
                        </Button> : ''
                    }
                  </Col>
                </Row>
            </div>
          </Drawer>
          <Button
            icon="eye-open"
            onClick={() => setIsShown(true)}
            className="card-list-item-view-button"
          >
            View
          </Button>
        </div>
      </Grid>
      <Grid item xs={2} style={{ marginTop: "7px" }}>
        <div style={{ paddingLeft: '10px' }}>{capitalize(entry.type)}</div>
        {
          paymentStatusComponent
        }
      </Grid>
      <Grid item xs={2} >
        <b>GHS {numberWithCommas(entry.salesTotal)}</b>
        <div className='sub-name'>
          Sales total
        </div>
      </Grid>
			<Grid item xs={3} style={{ marginTop: "7px" }}>
				{isSale() ?
					<div>
						<div style={{marginTop: '-10px'}}>
							Paid &nbsp;&nbsp;&nbsp;<Tag color="green">GHS {numberWithCommas(totalAmountPaid)}</Tag>
						</div>
						<div style={{marginTop: '5px'}}>
							Owing <Tag color="red">GHS {numberWithCommas(entry.arrears)}</Tag>
						</div>
					</div> : ''
				}
      </Grid>
      <Grid item xs={2}>
        {customer && customer.name ? (
          <div>
            <div style={{fontSize: '13px'}}>{customer.name}</div>
            <div className='sub-name'>Customer</div>
          </div>
        ) : (
          ""
        )}
      </Grid>
      <Grid item xs={1} style={{ marginTop: "8px" }}>
				<Avatar style={{}}>
          {capitalize(userFirstName[0])}{capitalize(userLastName[0])}
				</Avatar>
      </Grid>
      <Grid item xs={1} container style={{ marginTop: "16px" }}>
        <Grid item style={{ marginRight: "15px" }}>
					{/*
						isInvoice() ?
							<EditComponent
								sale={entry}
								modelName={modelName}
								updateRecord={updateRecord}
								keyFieldName={keyFieldName}
								totalQuantity={totalQuantity}
								productPrices={productPrices}
								removeProductPrice={removeProductPrice}
								saveProductPrice={saveProductPrice}
								products={products}
								customers={customers}
								company={company}
							/> : ''
					*/}
        </Grid>
        <Grid item>
          {
            isInvoice() ?
              <Component initialState={{ isShown: false }}>
							{({ state, setState }) => (
								<Pane>
									<Dialog
										isShown={state.isShown}
										onCloseComplete={() => setState({ isShown: false })}
										hasHeader={false}
										onConfirm={async () => {
											deleteRecord(entry.id);
											setState({ isShown: false });
										}}
										intent="danger"
									>
										Are you sure you want to delete the{" "}
										{pluralize.singular(modelName)}{" "}
										<b style={{ color: "red" }}>{entry[displayNameField]}</b>?
									</Dialog>

									<Icon
										type="delete"
										size={"large"}
										color="muted"
										className="hand-pointer"
										onClick={() => setState({ isShown: true })}
									/>
								</Pane>
							)}
						</Component> : ''

          }

        </Grid>
      </Grid>
    </Grid>
  );
};

const EnhancedCardListItem = withDatabase(
  withObservables([], ({ database, modelName, entry }) => ({
    entry: database.collections
      .get(`${pluralize(modelName)}`)
      .findAndObserve(entry.id),
    customer: entry.customer,
    saleEntries: entry.saleEntries.observe(),
    createdBy: entry.createdBy,
    installments: database.collections.get(Installment.table).query(Q.where('sale_id', entry.id))
  }))(CardListItem)
);

class CardList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDate: new Date(),
      selectedName: "",
      selectedCustomerId: null,
      selectedSalespersonId: null,
    };
  }

  render() {
    const {
      entries,
      EditComponent,
      deleteRecord,
      removeProductPrice,
      updateRecord,
      fieldNames,
      database,
      brands,
      categories,
      displayNameField,
      modelName,
      saveProductPrice,
      keyFieldName,
      search,
      user,
      users,
      products,
      customers,
      productPrices,
      company,
    } = this.props;

    const {selectedCustomerId, selectedSalespersonId} = this.state;

    let filteredSales = entries;
    if (selectedCustomerId && selectedCustomerId !== 'all') {
			filteredSales = entries.filter(e => e.customerId === selectedCustomerId);
		}

		if (selectedSalespersonId && selectedSalespersonId !== 'all') {
			filteredSales = entries.filter(e => e.createdBy.id === selectedSalespersonId);
		}

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
          <Grid
            item
            xs={5}
            style={{
              color: "darkgrey",
            }}
          >
            <b style={{color: 'black', fontWeight: 'normal'}}>Select customer: </b>
						<Select
							showSearch
							style={{ width: 200 }}
							placeholder="Select a customer"
							optionFilterProp="children"
							onChange={(value) => this.setState({ selectedCustomerId: value})}
							onSearch={(value) => this.setState({ selectedCustomerId: value})}
							filterOption={(input, option) =>
								option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							<Option value="all">All</Option>
							{
								customers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)
							}
						</Select>
          </Grid>
					<Grid
						item
						xs={5}
						style={{
							color: "darkgrey",
						}}
					>
						<b style={{color: 'black', fontWeight: 'normal'}}>Select salesperson: </b>
						<Select
							showSearch
							style={{ width: 200 }}
							placeholder="Select salesperson"
							optionFilterProp="children"
							onChange={(value) => this.setState({ selectedSalespersonId: value})}
							onSearch={(value) => this.setState({ selectedSalespersonId: value})}
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
          <Grid item xs={2} style={{ color: "grey" }}>
            <p style={{ color: "grey", marginBottom: "-5px" }}>Action</p>
          </Grid>
        </Grid>
        <div className="list-div">
          <Grid container spacing={1} id="list-area">
            { filteredSales.length === 0 ?
              <Empty style={{margin: "0 auto"}}/> :
              filteredSales.map(entry => (
              <div key={entry.id} className="card-list-item">
                {EnhancedCardListItem({
                  entry,
                  EditComponent,
                  categories,
                  brands,
                  deleteRecord,
                  modelName,
                  entries,
                  fieldNames,
                  database,
                  displayNameField,
                  keyFieldName,
                  updateRecord,
                  user,
                  saveProductPrice,
                  removeProductPrice,
                  products,
                  customers,
                  productPrices,
                  company,
                  users
                })}
              </div>
            ))}
          </Grid>
        </div>
      </div>
    );
  }
}

CardList.propTypes = {
  entries: PropTypes.array.isRequired,
  displayNameField: PropTypes.string.isRequired,
  keyFieldName: PropTypes.string.isRequired,
  fieldNames: PropTypes.array.isRequired,
  updateRecord: PropTypes.func.isRequired,
  modelName: PropTypes.string.isRequired,
  EditComponent: PropTypes.func.isRequired,
  database: PropTypes.object.isRequired,
  search: PropTypes.func.isRequired,
  deleteRecord: PropTypes.func.isRequired
};

CardListItem.propTypes = {
  entry: PropTypes.object.isRequired
};
export default CardList;
