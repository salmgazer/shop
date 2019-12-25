import React from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import { withRouter } from "react-router-dom";
import "./Company.scss";
import Component from "@reactions/component";
import { Q } from "@nozbe/watermelondb";
import PropTypes from "prop-types";
import pluralize from "pluralize";
import Grid from "@material-ui/core/Grid";
import {
  SideSheet,
  TextInput,
  Textarea,
  Combobox,
  SelectMenu
  // eslint-disable-next-line import/no-unresolved
} from "evergreen-ui";
import WeakTable from "../../../components/WeakTable";
import Company from "../../../model/companies/Company";
import User from "../../../model/users/User";
import SyncService from "../../../services/SyncService";
import {Button, Icon} from 'antd';

const fieldNames = [
  { name: "name", label: "Name", type: "string" },
  { name: "owner", label: "Owner", type: "string" },
  { name: "description", label: "Description", type: "string" },
  { name: "createdAt", label: "Created", type: "string" },
  { name: "updatedAt", label: "Updated", type: "string" }
];

const CreateComponent = props => {
  const { createRecord, users } = props;
  return (
    <Component
      initialState={{
        isShown: false,
        newCompanyName: "",
        newCompanyDescription: "",
        newCompanyCode: "",
        newCompanyAddress: "",
        newCompanyLocation: "",
        newCompanyLocationGPS: "",
        newCompanyPhone: "",
        newCompanyLogo: null,
        newCompanyStatus: "inactive",
        newCompanyCategory: null,
        newCompanyUserId: ""
      }}
    >
      {({ state, setState }) => (
        <React.Fragment>
          <SideSheet
            isShown={state.isShown}
            onCloseComplete={() => setState({ isShown: false })}
          >
            <div style={{ width: "80%", margin: "0 auto" }}>
              <h3
                style={{
                  fontSize: "40px",
                  fontWeight: "400",
                  color: "#09d3ac"
                }}
              >
                Create new Company
              </h3>
              <Grid container spacing={2}>
                <Grid xs={6} item>
                  <TextInput
                    required
                    width={300}
                    name="name"
                    value={state.newCompanyName}
                    onChange={e => setState({ newCompanyName: e.target.value })}
                    placeholder="Name of Company"
                    style={{ marginBottom: "20px" }}
                  />
                </Grid>
                <Grid xs={6} item>
                  <TextInput
                    required
                    width={170}
                    name="code"
                    value={state.newCompanyCode}
                    onChange={e => setState({ newCompanyCode: e.target.value })}
                    placeholder="Company Code"
                    style={{ marginBottom: "20px", marginLeft: "70px" }}
                  />
                </Grid>
              </Grid>
              <TextInput
                required
                name="address"
                width="100%"
                value={state.newCompanyAddress}
                onChange={e => setState({ newCompanyAddress: e.target.value })}
                placeholder="Address"
                style={{ marginBottom: "20px" }}
              />
              <TextInput
                required
                name="phone"
                value={state.newCompanyPhone}
                onChange={e => setState({ newCompanyPhone: e.target.value })}
                placeholder="Phone"
                style={{ marginBottom: "20px" }}
              />
              <Textarea
                name="description"
                value={state.newCompanyDescription}
                onChange={e =>
                  setState({ newCompanyDescription: e.target.value })
                }
                placeholder="About company"
                style={{ marginBottom: "20px" }}
              />
              <Grid container spacing={1}>
                <Grid xs={5} item>
                  <TextInput
                    required
                    width="100%"
                    name="Location GPS"
                    value={state.newCompanyLocationGPS}
                    onChange={e =>
                      setState({ newCompanyLocationGPS: e.target.value })
                    }
                    placeholder="Location GPS"
                    style={{ marginBottom: "20px" }}
                  />
                </Grid>
                <Grid xs={5} item>
                  <TextInput
                    required
                    name="Location name"
                    value={state.newCompanyLocation}
                    onChange={e =>
                      setState({ newCompanyLocation: e.target.value })
                    }
                    placeholder="Location name"
                    style={{ marginBottom: "20px", marginLeft: "10px" }}
                  />
                </Grid>
              </Grid>
              <Combobox
                items={["active", "inactive"]}
                onChange={selected => setState({ newCompanyStatus: selected })}
                placeholder="Status"
                autocompleteProps={{
                  // Used for the title in the autocomplete.
                  title: "Company status"
                }}
                style={{ marginBottom: "20px" }}
              />
              <Combobox
                items={["Construction", "Photography"]}
                onChange={selected =>
                  setState({ newCompanyCategory: selected })
                }
                placeholder="Category"
                autocompleteProps={{
                  // Used for the title in the autocomplete.
                  title: "Company category"
                }}
                style={{ marginBottom: "20px" }}
              />
              <label>Select owner</label>:
              <SelectMenu
                title="Owner of company"
                options={users.map(user => {
                  user.label = `${user.name} | ${user.email}`;
                  user.value = user.id;
                  return user;
                })}
                selected={state.newCompanyUserId}
                onSelect={item => setState({ newCompanyUserId: item.value })}
              >
                <Button>
                  {state.newCompanyUserId
                    ? users.find(u => u.id === state.newCompanyUserId).name
                    : "Select owner of company..."}
                </Button>
              </SelectMenu>
              <div style={{ margin: "0 auto", marginTop: "20px" }}>
                <Button
                  onClick={() => setState({ isShown: false })}
                  intent="danger"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    await createRecord({
                      name: state.newCompanyName,
                      description: state.newCompanyDescription,
                      code: state.newCompanyCode,
                      address: state.newCompanyAddress,
                      locationName: state.newCompanyLocation,
                      locationGPS: state.newCompanyLocationGPS,
                      phone: state.newCompanyPhone,
                      status: state.newCompanyStatus,
                      category: state.newCompanyCategory,
                      logo: state.newCompanyLogo,
                      userId: state.newCompanyUserId
                    });
                    setState({
                      isShown: false,
                      newCompanyName: "",
                      newCompanyDescription: ""
                    });
                  }}
                  intent="success"
                  style={{ marginLeft: "20px" }}
                >
                  Save
                </Button>
              </div>
            </div>
          </SideSheet>
					<Button
						onClick={() => setState({ isShown: true })}
						shape="circle"
						icon="plus"
						size='large'
						style={{
							float: 'right',
							marginRight: '20px',
							marginBottom: '20px',
							backgroundColor: 'orange',
							color: 'white',
							width: '60px',
							height: '60px'
						}}
					/>
        </React.Fragment>
      )}
    </Component>
  );
};

const EditComponent = props => {
  const { row, modelName, keyFieldName, updateRecord } = props;
  return (
    <Component
      initialState={{
        isShown: false,
        newCompanyName: row.name || "",
        newCompanyDescription: row.description || ""
      }}
    >
      {({ state, setState }) => (
        <React.Fragment>
          <SideSheet
            isShown={state.isShown}
            onCloseComplete={() => setState({ isShown: false })}
          >
            <div style={{ width: "80%", margin: "0 auto" }}>
              <h3
                style={{
                  fontSize: "40px",
                  fontWeight: "400",
                  color: "#09d3ac"
                }}
              >
                Update {modelName}
              </h3>
              <TextInput
                required
                name="name"
                value={state.newCompanyName}
                onChange={e => setState({ newCompanyName: e.target.value })}
                placeholder="Name of company"
                style={{
                  marginBottom: "20px",
                  fontSize: "25px",
                  height: "50px"
                }}
              />
              <Textarea
                name="description"
                value={state.newCompanyDescription}
                onChange={e =>
                  setState({ newCompanyDescription: e.target.value })
                }
                placeholder="Description of company"
                style={{ marginBottom: "20px", fontSize: "25px" }}
              />
              <div style={{ margin: "0 auto", marginTop: "20px" }}>
                <Button
                  onClick={() => setState({ isShown: false })}
                  intent="danger"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateRecord({
                      id: row[keyFieldName],
                      name: state.newCompanyName,
                      description: state.newCompanyDescription
                    });
                    setState({ isShown: false });
                  }}
                  intent="success"
                  style={{ marginLeft: "20px" }}
                >
                  Save
                </Button>
              </div>
            </div>
          </SideSheet>
					<Icon
						type="edit"
						onClick={() => setState({ isShown: true })}
						className="hand-pointer"
						size={20}
						color="muted"
					/>
        </React.Fragment>
      )}
    </Component>
  );
};

const Companies = props => {
  const {
    companies,
    allCompanies,
    database,
    company,
    users,
    history,
    search,
    DrawerIcon,
    modelName
  } = props;
  const companiesCollection = database.collections.get(pluralize(modelName));

  const createRecord = async companyToCreate => {
    await database.action(async () => {
      companiesCollection.create(company => {
        company.name = companyToCreate.name;
        company.description = companyToCreate.description;
        company.code = companyToCreate.code;
        company.address = companyToCreate.address;
        company.locationName = companyToCreate.locationName;
        company.locationGPS = companyToCreate.locationGPS;
        company.phone = companyToCreate.phone;
        company.logo = companyToCreate.logo;
        company.category = companyToCreate.category;
        company.status = companyToCreate.status;
      }).then(async (createdCompany) => {
				await database.action(async () => {
					database.collections.get("users_companies").create(userCompany => {
						userCompany.userId = companyToCreate.userId;
						userCompany.companyId = createdCompany.id;
						userCompany.role = "owner";
					}).then( async (createdUserCompany) => {
						console.log(`Created ${createdCompany.name}, owned by ${createdUserCompany.userId}`);
						await SyncService.sync(null, database, 'superadmin');
					});
				});
      });
    });
  };

  const updateRecord = async updatedRecord => {
    await database.action(async () => {
      const company = await companiesCollection.find(updatedRecord.id);
      await company.update(aCompany => {
        aCompany.name = updatedRecord.name;
        // aCompany.notes = updatedRecord.notes;
      });
    });
  };

  const deleteRecord = async id => {
    await database.action(async () => {
      const company = await companiesCollection.find(id);
      await company.remove();
    });
  };

  return (
    <div>
      <div id="main-area">
        {<DrawerIcon />}
        <div id="side-nav">
          <h3 id="company" onClick={() => history.push("/")}>
            Shop Admin
          </h3>
          <div id="nav-list">
            <button className="nav-item active">Companies</button>
            <button className="nav-item" onClick={() => history.push("shoppers")}>
              Users
            </button>
            <button onClick={() => SyncService.sync(null, database, 'superadmin')}>Sync</button>
          </div>
        </div>
        <div id="main-body">
          <div>
            <WeakTable
              entries={companies}
              allEntries={allCompanies}
              EditComponent={EditComponent}
              updateRecord={updateRecord}
              displayNameField="name"
              keyFieldName="id"
              fieldNames={fieldNames}
              modelName={modelName}
              database={database}
              deleteRecord={deleteRecord}
              search={search}
              users={users}
              model={Company}
            />
          </div>
          <div id="bottom-area">
            <CreateComponent createRecord={createRecord} users={users} />
          </div>
        </div>
      </div>
    </div>
  );
};

const EnhancedCompanies = withDatabase(
  withObservables(["searchConfig"], ({ database, searchConfig }) => ({
    companies: database.collections
      .get(Company.table)
      .query(
        Q.where(
          searchConfig.key,
          Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`)
        )
      )
      .observe(),
    allCompanies: database.collections
      .get(Company.table)
      .query()
      .observe(),
    users: database.collections
      .get(User.table)
      .query()
      .observe()
  }))(withRouter(Companies))
);

export default class Parent extends React.Component {
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
    const { company, DrawerIcon, modelName } = this.props;
    return (
      <EnhancedCompanies
        searchConfig={this.state}
        modelName={modelName}
        company={company}
        DrawerIcon={DrawerIcon}
        search={this.search}
      />
    );
  }
}

Parent.propTypes = {
  company: PropTypes.object.isRequired
};
