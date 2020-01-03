import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import { withRouter } from "react-router-dom";
import _ from 'underscore';
import "date-fns";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import Customer from "../../../model/customers/Customer";
import Sale from "../../../model/sales/Sale";
import { Q } from "@nozbe/watermelondb";
import Installment from "../../../model/installments/Installment";
import TopNav from "../../../components/TopNav";
import Company from "../../../model/companies/Company";
import MyLocal from "../../../services/MyLocal";
import User from "../../../model/users/User";
import {Icon, Tag, Select, Button} from 'antd';
const {Option} = Select;

const CardListItem = props => {
	const { sales, installments, customer } = props;

	let totalArrears = 0;
	sales.filter(s => s.customerId === customer.id).forEach(sale => totalArrears += sale.arrears);

	return (
		<Grid container spacing={1}>
			<Grid item xs={4} style={{ marginTop: "7px" }}>
				<div id="name-column">{customer.name}</div>
				<div style={{ color: "#7B8B9A", fontSize: "12px" }}>
					{customer.phone}
				</div>
			</Grid>
			<Grid item xs={2} style={{ marginTop: "16px" }}>
				<div id="name-column" style={{marginTop: '5px'}}>
					<Tag color="#f5222d">GHS {totalArrears}</Tag>
				</div>
			</Grid>
			<Grid item xs={4} style={{ marginTop: "16px" }}>
				<div style={{ color: "#7B8B9A", fontSize: "14px" }}>

				</div>
			</Grid>
		</Grid>
	);
};

const EnhancedCardListItem = withDatabase(
	withObservables([], ({ database, sale }) => ({
		installments: database.collections.get(Installment.table).query(Q.where('sale_id', sale.id)).fetch(),
		customer: database.collections.get(Customer.table).findAndObserve(sale.customerId)
	}))(CardListItem)
);

class Debtors extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedCustomerId: null
		};
	}

	render() {
		const { sales, customers } = this.props;
		const {selectedCustomerId} = this.state;

		const uniqueSalesWithArrears = _.uniq(sales, function (sale, key, a) {
			return sale.customerId;
		});


		let filteredSales = uniqueSalesWithArrears;


		const filteredCustomers = customers.filter(c => uniqueSalesWithArrears.map(s => s.customerId).includes(c.id));

		if (selectedCustomerId && selectedCustomerId !== 'all') {
			filteredSales = uniqueSalesWithArrears.filter(s => s.customerId === selectedCustomerId);
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
					<Grid item xs={2}></Grid>
					<Grid
						item
						xs={6}
						style={{
							color: "darkgrey",
						}}
					>
						<b style={{color: 'black', marginRight: '10px', fontWeight: 'normal'}}>Select customer:</b>
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
								filteredCustomers.map(c => <Option value={c.id}>{c.name}</Option>)
							}
						</Select>
					</Grid>
					<Grid item xs={2}>
						<p style={{ color: "grey", marginBottom: "-5px" }}>

						</p>
					</Grid>
					<Grid item xs={2} style={{ color: "grey" }}>
						<p style={{ color: "grey", marginBottom: "-5px" }}></p>
					</Grid>
				</Grid>
				<div className="list-div">
					<div id="list-area">
						{filteredSales.map(sale => (
							<div key={sale.id} className="card-list-item">
								{EnhancedCardListItem({
									selectedCustomerId,
									sale,
									sales: filteredSales
								})}
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}
}

const EnhancedDebtors = withDatabase(
	withObservables([], ({ database }) => ({
		sales: database.collections.get(Sale.table).query(Q.where('payment_status', Q.notIn(['full payment'])), Q.where('type', 'sale')),
		customers: database.collections.get(Customer.table).query().observe()
	}))(Debtors)
);

Debtors.propTypes = {
	sales: PropTypes.array.isRequired,
	database: PropTypes.object.isRequired,
};

CardListItem.propTypes = {
	sale: PropTypes.object.isRequired
};


const Parent = props => {
	const {
		user,
		company,
		users,
		database,
		history,
		DrawerIcon
	} = props;


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
						<Button className="nav-item" onClick={() => history.push("sales")}>
							Sales
						</Button>
						<Button
							className="nav-item"
							onClick={() => history.push("customers")}
						>
							Customers
						</Button>
						<Button className="nav-item active">
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
							<Icon type="arrow-left" marginRight={16} />
							Jump to Inventory
						</a>
					</div>
				</div>
				<div id="main-body">
					<div>
						<EnhancedDebtors
							company={company}
							users={users}
							user={user}
							database={database}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

const EnhancedParent = withDatabase(
	withObservables([], ({ database }) => ({
		company: database.collections.get(Company.table).find(MyLocal.companyId),
		user: database.collections.get(User.table).find(MyLocal.userId)
	}))(withRouter(Parent))
);


export default EnhancedParent;
