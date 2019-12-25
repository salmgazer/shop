import React from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import "./Settings.css";
import { withRouter } from "react-router-dom";

import PropTypes from "prop-types";
import pluralize from "pluralize";
import { Icon } from "evergreen-ui";
import MyLocal from "../../../services/MyLocal";
import TopNav from "../../../components/TopNav";
import SyncService from "../../../services/SyncService";





class Settings extends React.Component{

  constructor(props) {
    super(props);

    this.sync = this.sync.bind(this);
  }

  async sync() {
    console.log("About to sync");
    const {database, company} = this.props;

    SyncService.sync(company, database, '')
      .then(() => {
        console.log("Done syncing");
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
						</div>
						<div className="bottom-area">
							<a onClick={() => history.push("sales")}>
								<Icon icon="arrow-left" marginRight={16}/>
								Jump to Sales
							</a>
						</div>
					</div>
					<div id="main-body">
						<div>
							here goes you
						</div>
						<div id="bottom-area">
							<button
								className="sell-btn"
								onClick={this.sync}
							>
								Sync
							</button>
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
  }))(withRouter(Settings))
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
