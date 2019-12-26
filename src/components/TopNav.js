import {Menu, Avatar, Popover, Position} from "evergreen-ui";
import MyLocal from "../services/MyLocal";
import React from "react";
import {Icon, Divider} from 'antd';
import { withRouter } from 'react-router-dom';

const TopNav = ({user, history}) => {
	return (
		<div id='user-icon-area'>
			<Popover
				position={Position.BOTTOM_LEFT}
				content={
					<Menu>
						<Menu.Item
							onSelect={() => history.push('sync')}
							style={{color: 'black'}}
						>
							Settings <Icon type="setting" />
						</Menu.Item>
						<Divider/>
						<Menu.Item
							onSelect={() => MyLocal.logout()}
							style={{color: 'red'}}
						>
							Logout <Icon type="poweroff"/>
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
	);
};


export default withRouter(TopNav);
