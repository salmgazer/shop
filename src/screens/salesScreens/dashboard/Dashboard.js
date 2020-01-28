import React from "react";
import moment from 'moment';
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import "./Dashboard.scss";
import { withRouter } from "react-router-dom";
import MyLocal from "../../../services/MyLocal";
import User from "../../../model/users/User";
import Company from "../../../model/companies/Company";
import TopNav from "../../../components/TopNav";
import Installment from "../../../model/installments/Installment";
import Expense from "../../../model/expenses/Expense";
import Sale from "../../../model/sales/Sale";
import SaleEntry from "../../../model/saleEntries/SaleEntry";
import {Button, Icon, DatePicker, Row, Col, Statistic, Card, Divider, Tag, Collapse, Table} from 'antd';
import Product from "../../../model/products/Product";
import _ from "underscore";
import Customer from "../../../model/customers/Customer";
import * as Q from "@nozbe/watermelondb/QueryDescription";
import ExpenseCategory from "../../../model/expenseCategories/ExpenseCategory";
import {Pie, Doughnut} from 'react-chartjs-2';
const {RangePicker} = DatePicker;
const {Panel} = Collapse;
const {Column} = Table;


class Dashboard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			startDate: null,
			endDate: null
		};

		this.updateFilterDate = this.updateFilterDate.bind(this);
	}


	updateFilterDate(date, dateString) {
		const [startDate, endDate] = dateString;
		this.setState({
			startDate: moment(startDate).unix(),
			endDate: moment(endDate).unix()
		});
	}

	render() {
		const {
			user,
			company,
			history,
			installments,
			sales,
			expenses,
			saleEntries,
			products,
			customers,
			users,
			expenseCategories,
			database
		} = this.props;

		const { startDate, endDate } = this.state;

		/*
			database.action(async () => {
				const installments = await database.collections.get(Installment.table).query().fetch();
				const ses = await database.collections.get(SaleEntry.table).query().fetch();
				const sas = await database.collections.get(Sale.table).query().fetch();
				installments.forEach(async i => await i.remove());
				ses.forEach(async i => await i.remove());
				sas.forEach(async i => await i.remove());

			});
			*/



		const productSalesColumns = [
			{
				title: "Product",
				dataIndex: "productName",
				key: "productName"
			},
			{
				title: "Quantity sold",
				dataIndex: "quantity",
				key: "quantity",
				sorter: (a, b) => a.quantity - b.quantity,
			},
			{
				title: "Total Sales",
				dataIndex: "totalSales",
				key: "totalSales",
				sorter: (a, b) => a.totalSales - b.totalSales,
			},
			{
				title: "Total Cost Price",
				dataIndex: "totalCostPrice",
				key: "totalCostPrice",
				sorter: (a, b) => a.totalCostPrice - b.totalCostPrice,
			},
			{
				title: "Profit",
				dataIndex: "profit",
				key: "profit",
				sorter: (a, b) => a.profit - b.profit,
			}
		];

		const customersWithArrearsColumns = [
			{
				title: "Name",
				dataIndex: "name",
				key: "name"
			},
			{
				title: "Owing (GHS)",
				dataIndex: "arrears",
				key: "arrears",
				sorter: (a, b) => a.arrears - b.arrears,
			}
		];

		let filteredInstallments = installments;
		let filteredSales = sales;
		let filteredExpenses = expenses;
		let filteredSaleEntries = saleEntries;

		if (startDate && endDate) {
			filteredInstallments = filteredInstallments.filter(installment => moment(installment.createdAt).unix() >= startDate && moment(installment.createdAt).unix() <= endDate);
			filteredSales = filteredSales.filter(sale => moment(sale.createdAt).unix() >= startDate && moment(sale.createdAt).unix() <= endDate);
			filteredExpenses = filteredExpenses.filter(expense => moment(expense.date).unix() >= startDate && moment(expense.date).unix() <= endDate);
			filteredSaleEntries = filteredSaleEntries.filter(saleEntry => moment(saleEntry.createdAt).unix() >= startDate && moment(saleEntry.createdAt).unix() <= endDate);
		}


		// user sales
		let usersCashInRows = [];
		users.forEach(user => {
			const userInstallments = filteredInstallments.filter(installment => installment.createdBy.id === user.id);
			const userExpenses = filteredExpenses.filter(expense => expense.createdBy.id === user.id);

			let totalUserCashIn = 0;
			userInstallments.forEach(i => {
				totalUserCashIn += i.amount;
			});

			let totalUserExpenses = 0;
			let userExpenseCategories = [];
			userExpenses.forEach(e => {
				totalUserExpenses += e.amount;
				userExpenseCategories.push(expenseCategories.find(ec => ec.id === e.expenseCategory.id).name + `(GHS ${e.amount})`);
			});

			usersCashInRows.push({
				userId: user.id,
				name: user.name,
				sales: totalUserCashIn,
				expenses: totalUserExpenses,
				cashInHand: (totalUserCashIn - totalUserExpenses),
				userExpenseCategories: userExpenseCategories
			});
		});




		let totalCashReceived = 0;
		filteredInstallments.forEach(installment => {
			totalCashReceived += installment.amount;
		});

		let totalArrears = 0;
		filteredSales.filter(s => s.arrears > 0).forEach(sale => {
			totalArrears += sale.arrears;
		});

		let totalExpenses = 0;
		filteredExpenses.forEach(expense => {
			totalExpenses += expense.amount;
		});


		let totalCompletedSales = 0;
		let totalCompletedSalesCount = 0;
		filteredSales.filter(s => s.arrears === 0 && s.paymentStatus === 'full payment').forEach(cs => {
			totalCompletedSalesCount += 1;
			totalCompletedSales += cs.salesTotal - cs.discount;
		});


		let totalPartlyPaidSales = 0;
		let totalPartlyPaidSalesCount = 0;
		filteredSales.filter(s => s.arrears > 0 && s.paymentStatus === 'part payment').forEach(pps => {
			totalPartlyPaidSalesCount += 1;
			totalPartlyPaidSales += (pps.salesTotal - pps.arrears);
		});


		const totalUnpaidSales = 0;
		let totalUnpaidSalesCount = 0;
		filteredSales.filter(s => s.arrears === s.salesTotal && s.paymentStatus === 'unpaid').forEach(ups => {
			totalUnpaidSalesCount += 1;
		});

		// { productId, quantity, totalSales, totalCostPrice}
		// allocations : {price: quantity}
		let productSales = [];
		filteredSaleEntries.forEach(se => {
			const existingSaleEntry = productSales.find(ps => ps.productId === se.product.id);
			let totalCostPrice = 0;
			for (let m = 0; m < se.costPriceAllocations.length; m++) {
				totalCostPrice += (se.costPriceAllocations[m].price * se.costPriceAllocations[m].quantity);
			}

			if (existingSaleEntry) {
				existingSaleEntry.quantity += se.quantity;
				existingSaleEntry.totalSales += se.total;
				existingSaleEntry.totalCostPrice += totalCostPrice;
				existingSaleEntry.profit += (se.total - totalCostPrice);
			} else {
				productSales.push({
					productId: se.product.id,
					quantity: se.quantity,
					totalSales: se.total,
					totalCostPrice: totalCostPrice,
					productName: se.productName,
					profit: se.total - totalCostPrice
				});
			}
		});

		const sortedProductSalesFromHighestSales = productSales.sort((a, b) => b.totalSales - a.totalSales);
		const soldProductIds = sortedProductSalesFromHighestSales.map(item => item.productId);
		const nonSoldProducts = products.filter(p => !soldProductIds.includes(p.id));

		nonSoldProducts.forEach(p => {
			sortedProductSalesFromHighestSales.push({
				productId: p.id,
				quantity: 0,
				totalSales: 0,
				totalCostPrice: 0,
				productName: p.name,
				profit: 0
			});
		});

		/* Arrears */
		const salesWithArrears = sales.filter(s => s.paymentStatus !== 'full payment');
		const uniqueSalesWithArrears = _.uniq(salesWithArrears, function (sale, key, a) {
			return sale.customerId;
		});

		const filteredCustomersWithArrears = customers.filter(c => uniqueSalesWithArrears.map(s => s.customerId).includes(c.id));
		const customerWithArrearsTableRows = [];
		let allCustomersArrears = 0;
		filteredCustomersWithArrears.forEach(c => {
			const customerSalesWithArrears = salesWithArrears.filter(swa => swa.customerId === c.id);
			let totalArrears = 0;
			for (let m = 0; m < customerSalesWithArrears.length; m++) {
				totalArrears += customerSalesWithArrears[m].arrears;
			}
			allCustomersArrears += totalArrears;
			customerWithArrearsTableRows.push({
				name: c.name,
				arrears: totalArrears
			});
		});



		const expensesPieChartOptions = {
			datasets: [{
				data: expenseCategories.map(ec => {
					const categoryExpenses = filteredExpenses.filter(e => e.categoryId === ec.id);
					let totalCategoryExpense = 0;
					for (let m = 0; m < categoryExpenses.length; m++) {
						totalCategoryExpense += categoryExpenses[m].amount;
					}
					return totalCategoryExpense;
				}),
				backgroundColor: [
					'#FF6384',
					'#36A2EB',
					'#FFCE56',
					'#09d3ac',
					'brown',
					'purple'
				]
			}],

			// These labels appear in the legend and in the tooltips when hovering different arcs
			labels: expenseCategories.map(ec => ec.name)
		};


		return (
			<div>
				<TopNav user={user}/>
				<div id="main-area">
					{/*<DrawerIcon />*/}
					<div id="side-nav">
						<h3 id="company" onClick={() => history.push("home")}>
							{company.name}
						</h3>
						<div id="nav-list">
							<Button className="nav-item" onClick={() => history.push("sales")}>
								Sales
							</Button>
							<Button
								className="nav-item"
								onClick={() => history.push("customers")}
							>
								Customers
							</Button>
							<Button className="nav-item"
											onClick={() => history.push("debtors")}
							>
								Debtors
							</Button>
							<Button
								className="nav-item active"
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
					<div id="main-body" style={{overflow: 'auto'}}>
						<div className="list-div">
							<div style={{marginBottom: '40px'}}>
								<RangePicker onChange={this.updateFilterDate}/>
							</div>
							<div id="list-area">
								<div>
									<Row gutter={16} style={{width: '95%'}}>
										<Collapse defaultActiveKey={['1']}>
											<Panel header='Sales Personnel' key="1">
												<Table dataSource={usersCashInRows}>
													<Column title="Name" dataIndex="name" key="name" />
													<Column title="Sales" dataIndex="sales" key="sales" />
													<Column title="Expenses" dataIndex="expenses" key="expenses" />
													<Column
														title="Expense Categories"
														dataIndex="userExpenseCategories"
														key="tags"
														render={userExpenseCategories => (
															<span>
																{userExpenseCategories.map(tag => (
																	<Tag color="blue" key={tag}>
																		{tag}
																	</Tag>
																))}
															</span>
														)}
													/>
													<Column title="Cash In hand" dataIndex="cashInHand" key="cashInHand" />
												</Table>
											</Panel>
										</Collapse>
									</Row>
									<Row style={{width: '95%'}}>
										<Divider />
									</Row>
									<Row gutter={16} style={{width: '95%'}}>
										<Collapse defaultActiveKey={['1']}>
											<Panel header="Expenses" key="1">
												<Pie
													data={expensesPieChartOptions}
												/>
											</Panel>
										</Collapse>
									</Row>
									<Row style={{width: '95%'}}>
										<Divider />
									</Row>
									<Row gutter={16} style={{width: '95%'}}>
										<Collapse defaultActiveKey={['1']}>
											<Panel header="Sales Breakdown" key="1">
												<Col span={8} style={{marginBottom: '20px'}}>
													<Card>
														<Statistic
															precision={2}
															valueStyle={{ color: '#3f8600' }}
															title="Cash Sales"
															value={`GHS ${totalCashReceived}`}
														/>
													</Card>
												</Col>
												<Col span={8}>
													<Card>
														<Statistic
															precision={2}
															valueStyle={{ color: 'orange' }}
															title="Credit Sales"
															value={`GHS ${totalArrears}`}
														/>
													</Card>
												</Col>
												<Col span={8}>
													<Card>
														<Statistic
															precision={2}
															valueStyle={{ color: 'orange' }}
															title="Total Sales"
															value={`GHS ${totalArrears + totalCashReceived}`}
														/>
													</Card>
												</Col>
											</Panel>
										</Collapse>
									</Row>
									<Row style={{width: '95%'}}>
										<Divider />
									</Row>
									<Row gutter={16} style={{width: '95%'}}>
										<Collapse defaultActiveKey={['1']}>
											<Panel header="Cash Sales Breakdown" key="1">
												<Col span={8} style={{marginBottom: '20px'}}>
													<Card>
														<Tag color='green'>{totalCompletedSalesCount} sale(s)</Tag><br/>
														<Statistic
															precision={2}
															valueStyle={{ color: '#3f8600' }}
															title="Completed Sales"
															value={`GHS ${totalCompletedSales}`}
														/>
													</Card>
												</Col>
												<Col span={8}>
													<Card>
														<Tag color='orange'>{totalPartlyPaidSalesCount} sale(s)</Tag><br/>
														<Statistic
															precision={2}
															valueStyle={{ color: 'orange' }}
															title="Partly paid for"
															value={`GHS ${totalPartlyPaidSales}`}
														/>
													</Card>
												</Col>
												<Col span={8}>
													<Card>
														<Tag color='red'>Total cash</Tag><br/>
														<Statistic
															title="Total"
															precision={2}
															valueStyle={{ color: 'red' }}
															value={`GHS ${totalCompletedSales + totalPartlyPaidSales}`}
														/>
													</Card>
												</Col>
											</Panel>
										</Collapse>
									</Row>
									<Row style={{width: '95%'}}>
										<Divider />
									</Row>
									<Row gutter={16} style={{width: '95%'}}>
										<Collapse defaultActiveKey={['1']}>
											<Panel header="Revenue" key="1">
												<Col span={8}>
													<Card>
														<Tag color='green'>Total cash sales</Tag><br/>
														<Statistic
															precision={2}
															valueStyle={{ color: '#3f8600' }}
															value={`GHS ${totalCompletedSales + totalPartlyPaidSales}`}
														/>
													</Card>
												</Col>
												<Col span={8} style={{marginBottom: '20px'}}>
													<Card>
														<Tag color='red'>Total Expenses</Tag><br/>
														<Statistic
															precision={2}
															valueStyle={{ color: 'red' }}
															value={`GHS ${totalExpenses}`}
														/>
													</Card>
												</Col>
													<Col span={8} style={{marginBottom: '20px'}}>
														<Card>
															<Tag color='green'>Cash in hand</Tag><br/>
															<Statistic
																precision={2}
																valueStyle={{ color: '#3f8600' }}
																value={`GHS ${(totalCompletedSales + totalPartlyPaidSales) - totalExpenses}`}
															/>
														</Card>
												</Col>
											</Panel>
										</Collapse>
									</Row>
									<Row style={{width: '95%'}}>
										<Divider />
									</Row>
									<Row gutter={16} style={{width: '95%'}}>
										<Collapse defaultActiveKey={['1']}>
											<Panel header="Product Performance" key="1">
												<Table
													columns={productSalesColumns}
													dataSource={sortedProductSalesFromHighestSales}
													pagination={{ pageSize: 5 }}
												/>
											</Panel>
										</Collapse>
									</Row>
									<Row style={{width: '95%'}}>
										<Divider />
									</Row>
									<Row gutter={16} style={{width: '95%', marginBottom: '200px'}}>
										<Collapse>
											<Panel header={`Customers with Arrears (GHS ${allCustomersArrears})`} key="1">
												<Table
													columns={customersWithArrearsColumns}
													dataSource={customerWithArrearsTableRows}
													pagination={{ pageSize: 5 }}
												/>
											</Panel>
										</Collapse>
									</Row>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}


const EnhancedDashboard = withDatabase(
  withObservables([], ({ database }) => ({
    company: database.collections.get(Company.table).find(MyLocal.companyId),
    user: database.collections.get(User.table).find(MyLocal.userId),
    users: database.collections
      .get(User.table)
      .query(Q.on("users_companies", "company_id", MyLocal.companyId)),
    installments: database.collections
      .get(Installment.table)
      .query(Q.where("company_id", MyLocal.companyId))
      .observe(),
    expenses: database.collections
      .get(Expense.table)
      .query(Q.where("company_id", MyLocal.companyId))
      .observe(),
    expenseCategories: database.collections
      .get(ExpenseCategory.table)
      .query(Q.where("company_id", MyLocal.companyId))
      .observe(),
    sales: database.collections
      .get(Sale.table)
      .query(Q.where("company_id", MyLocal.companyId))
      .observe(),
    saleEntries: database.collections
      .get(SaleEntry.table)
      .query(Q.where("company_id", MyLocal.companyId))
      .observe(),
    products: database.collections
      .get(Product.table)
      .query(Q.where("company_id", MyLocal.companyId))
      .observe(),
    customers: database.collections
      .get(Customer.table)
      .query(Q.where("company_id", MyLocal.companyId))
      .observe()
  }))(withRouter(Dashboard))
);

export default EnhancedDashboard;
