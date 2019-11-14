import React from 'react';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import './Control.scss';
import {withRouter} from 'react-router-dom';
import {toaster, Avatar, Menu, Position, Popover, Icon} from "evergreen-ui";
import MyLocal from "../../services/MyLocal";


const Control = (props) => {

	const {history, company, user} = props;

	if (!company) {
		toaster.danger('You need to login');
		history.push('/');
	}

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
			<div id="control-area">
				<h1 id="heading" className="center-text"> {company.name} Control Panel</h1>
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
