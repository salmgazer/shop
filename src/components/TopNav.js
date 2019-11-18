import {Menu, Avatar, Popover, Position} from "evergreen-ui";
import MyLocal from "../services/MyLocal";
import React from "react";
import {Icon} from 'antd';

const TopNav = ({user}) => {
	return (
		<div id='user-icon-area'>
			<Popover
				position={Position.BOTTOM_LEFT}
				content={
					<Menu>
						<Menu.Item
							onSelect={() => MyLocal.logout()}
							style={{color: 'red', fontWeight: 'bold'}}
						>
							Logout <Icon type="poweroff" style={{ marginTop: '5px' }} />
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


export default TopNav;
