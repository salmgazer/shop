import React from 'react';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import './Debtors.css';
import { withRouter } from 'react-router-dom';

const Deptors = (props) => {

	const {history, company} = props;
	return (
		<div>
			<div id="main-area">
				<div id="side-nav">
					<h3 onClick={() => history.push('/home')} id="company">{company.name}</h3>
					<div id="nav-list">
						<button className="nav-item" onClick={() => history.push('sales')}>Sales</button>
						<button className="nav-item" onClick={() => history.push('invoice')}>Invoice</button>
						<button className="nav-item active">Debtors</button>
					</div>
				</div>
				<div id="main-body">
					<h4 id="page-name">Manage Debtors</h4>
					<div id="list-area">
					</div>
				</div>
			</div>
			<div id="bottom-area">
				<button id="sell-btn">Add debtor</button>
			</div>
		</div>
	);
};


export default withDatabase(withObservables([], ({ database }) => ({
	brands: database.collections.get('brands').query().observe(),
}))(withRouter(Deptors)));
