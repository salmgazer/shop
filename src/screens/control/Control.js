import React from 'react';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import './Control.scss';
import {withRouter} from 'react-router-dom';
import {toaster} from "evergreen-ui";
import MyLocal from "../../services/MyLocal";
import { PageHeader } from 'antd';
import TopNav from "../../components/TopNav";


const Control = (props) => {

	const {history, company, user} = props;

	if (!company) {
		toaster.danger('You need to login');
		history.push('/');
	}

	return (
		<div>
			<TopNav user={user}/>
			<div id="control-area">
				<PageHeader
					id="heading"
					style={{
						border: '1px solid rgb(235, 237, 240)',
						marginBottom: '200px',
						backgroundColor: 'white',
						boxShadow: '0 2px 3px 0 rgba(0,0,0,0.2)'
					}}
					title={<h2 style={{marginTop: '7px'}}>{company.name} Control Panel</h2>}
				/>
				{ /*<h1 id="heading" className="center-text"> {company.name} Control Panel</h1> */ }
				<div className="row center-text">
					<a onClick={() => history.push('sales')}>Sales</a>
					<a onClick={() => history.push('products')}>Inventory</a>
					<a onClick={() => history.push('settings')}>Settings</a>
				</div>
			</div>
			<div className="row" id="play-store">
				<a onClick={() => history.push('playstore')}>Install New Features</a>
			</div>
		</div>
	);
};


export default withDatabase(withObservables([], ({ database }) => ({
	brands: database.collections.get('brands').query().observe(),
	company: database.collections.get('companies').find(MyLocal.companyId),
	user: database.collections.get('users').find(MyLocal.userId)
}))(withRouter(Control)));
