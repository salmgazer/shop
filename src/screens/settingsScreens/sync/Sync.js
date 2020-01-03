import React from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import "./Sync.css";
import { withRouter } from "react-router-dom";

import PropTypes from "prop-types";
import pluralize from "pluralize";
import MyLocal from "../../../services/MyLocal";
import TopNav from "../../../components/TopNav";
import SyncService from "../../../services/SyncService";
import { notification, Icon, Spin, Result, Button } from 'antd';
import { Offline, Online } from "react-detect-offline";




class Sync extends React.Component{

  constructor(props) {
    super(props);

    this.state = {
    	showSpinner: false,
			success: false
		};

    this.sync = this.sync.bind(this);
  }

  async sync() {
		this.setState({
			showSpinner: true,
			success: false
		});
		notification.open({
			message: 'Syncing your data',
			description:
				'Please wait until sync completes.',
			icon: <Icon type="info-circle" style={{ color: '#108ee9' }} />,
			onClick: () => {
				console.log('Notification Clicked!');
			},
		});
    const {database, company} = this.props;

    SyncService.sync(company, database, '')
      .then(() => {
      	this.setState({
					showSpinner: false,
					success: true
				});
				notification.open({
					message: 'Done syncing your data',
					description:
						'You can continue enjoying the app',
					icon: <Icon type="smile" style={{ color: '#09d3ac' }} />,
					onClick: () => {
						console.log('Notification Clicked!');
					},
				});
      });
  }


  render() {
		const {
			user,
			company,
			database,
			history,
			DrawerIcon,
			modelName
		} = this.props;

		const {showSpinner, success} = this.state;

		return (
			<div>
				<TopNav user={user}/>
				<div id="main-area">
					{<DrawerIcon/>}
					<div id="side-nav">
						<h3 id="company" onClick={() => history.push("home")}>
							{company.name}
						</h3>
						<div id="nav-list">
							<button className="nav-item active">
								Sync
							</button>
							<button className="nav-item" onClick={() => history.push("profile")}>
								Profile
							</button>
						</div>
						<div className="bottom-area">
							<a onClick={() => history.push("sales")}>
								<Icon type="arrow-left"/>
								Jump to Sales
							</a>
						</div>
					</div>
					<div id="main-body">
						<h1 style={{ textAlgin: 'center'}}>Click "Sync" button below</h1>
						<div>
							{
								showSpinner === true ? <Spin size='large' /> : ''
							}
							{
								success === true && showSpinner === false ?
									<Result
										status="success"
										title="Successfully Synced your data"
										subTitle="You can jump back to your work!"
										extra={[
											<Button onClick={() => history.push("home")} type="primary" key="console">
												Go to console
											</Button>,
											<Button key="sales" onClick={() => history.push("products")}>Go to inventory</Button>,
										]}
								/> : ''
							}
						</div>
						<div id="bottom-area">
							<Online>
							<Button
								shape='round'
								type='primary'
								style={{
									fontSize: '30px',
									backgroundColor: 'orange',
									border: "2px solid white"
								}}
								className="sell-btn"
								onClick={this.sync}
							>
								Sync
							</Button>
							</Online>
							<Offline>
								<p style={{
									color: 'red',
									fontSize: '15px',
									textAlign: 'center'
								}}>You are not connected to the internet!</p>
							</Offline>
						</div>
					</div>
				</div>
			</div>
		);
	}
};

const EnhancedSync = withDatabase(
  withObservables(["searchConfig"], ({ database}) => ({
    company: database.collections.get("companies").find(MyLocal.companyId),
    user: database.collections.get("users").find(MyLocal.userId),
  }))(withRouter(Sync))
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
      <EnhancedSync
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
    company: database.collections.get("companies").find(MyLocal.companyId),
    user: database.collections.get("users").find(MyLocal.userId)
  }))(withRouter(Parent))
);

export default EnhancedParent;

Parent.propTypes = {
  company: PropTypes.object.isRequired
};
