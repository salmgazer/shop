import React from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import { withRouter } from "react-router-dom";
import "./Users.scss";
import Component from "@reactions/component";
import { Q } from "@nozbe/watermelondb";
import pluralize from "pluralize";
import Grid from "@material-ui/core/Grid";
import {
  SideSheet,
  TextInput,
  Textarea,
  toaster,
  Combobox
  // eslint-disable-next-line import/no-unresolved
} from "evergreen-ui";
import { Button } from 'antd';
import WeakTable from "../../../components/WeakTable";
import User from "../../../model/users/User";
import SyncService from "../../../services/SyncService";
import {Icon} from 'antd';

const fieldNames = [
  { name: "name", label: "Name", type: "string" },
  { name: "username", label: "Username", type: "string" },
  { name: "email", label: "Email", type: "string" },
  { name: "phone", label: "Phone", type: "string" },
  { name: "address", label: "Address", type: "string" },
  { name: "status", label: "Status", type: "string" },
  { name: "password", label: "Password", type: "string" },
  { name: "createdAt", label: "Created", type: "string" },
  { name: "updatedAt", label: "Updated", type: "string" }
];

const CreateComponent = props => {
  const { createRecord } = props;
  return (
    <Component
      initialState={{
        isShown: false,
        newUserName: "",
        newUserUserName: "",
        newUserAddress: "",
        newUserPassword: "",
        confirmPassword: "",
        newUserEmail: "",
        newUserStatus: "inactive",
        newUserPhone: ""
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
                Create new User
              </h3>
              <Grid container spacing={1}>
                <Grid xs={6} item>
                  <TextInput
                    required
                    width={300}
                    name="name"
                    value={state.newUserName}
                    onChange={e => setState({ newUserName: e.target.value })}
                    placeholder="Name of User"
                    style={{ marginBottom: "20px" }}
                  />
                </Grid>
                <Grid xs={6} item>
                  <TextInput
                    required
                    width={170}
                    name="username"
                    value={state.newUserUserName}
                    onChange={e =>
                      setState({ newUserUserName: e.target.value })
                    }
                    placeholder="Username"
                    style={{ marginBottom: "20px", marginLeft: "70px" }}
                  />
                </Grid>
              </Grid>
              <TextInput
                required
                name="address"
                width="100%"
                value={state.newUserAddress}
                onChange={e => setState({ newUserAddress: e.target.value })}
                placeholder="Address"
                style={{ marginBottom: "20px" }}
              />
              <Grid container spacing={1}>
                <Grid xs={5} item>
                  <TextInput
                    required
                    name="phone"
                    width={230}
                    value={state.newUserPhone}
                    onChange={e => setState({ newUserPhone: e.target.value })}
                    placeholder="Phone"
                    style={{ marginBottom: "20px" }}
                  />
                </Grid>
                <Grid xs={5} item>
                  <TextInput
                    required
                    name="email"
                    width={230}
                    value={state.newUserEmail}
                    onChange={e => setState({ newUserEmail: e.target.value })}
                    placeholder="Email"
                    style={{ marginBottom: "20px", marginLeft: "55px" }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid xs={5} item>
                  <TextInput
                    required
                    name="password"
                    type="password"
                    width={230}
                    value={state.newUserPassword}
                    onChange={e =>
                      setState({ newUserPassword: e.target.value })
                    }
                    placeholder="password"
                    style={{ marginBottom: "20px" }}
                  />
                </Grid>
                <Grid xs={5} item>
                  <TextInput
                    required
                    width={230}
                    name="confirmPassword"
                    type="password"
                    value={state.confirmPassword}
                    onChange={e =>
                      setState({ confirmPassword: e.target.value })
                    }
                    placeholder="confirm password"
                    style={{ marginBottom: "20px", marginLeft: "55px" }}
                  />
                </Grid>
              </Grid>
              <Combobox
                items={["active", "inactive"]}
                onChange={selected => setState({ newUserStatus: selected })}
                placeholder="Status"
                autocompleteProps={{
                  // Used for the title in the autocomplete.
                  title: "User status"
                }}
                style={{ marginBottom: "20px" }}
              />
              <div style={{ margin: "0 auto", marginTop: "20px" }}>
                <Button
                  onClick={() => setState({ isShown: false })}
                  intent="danger"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (state.newUserPassword !== state.confirmPassword) {
                      toaster.danger("Passwords do not match");
                      return;
                    }
                    await createRecord({
                      name: state.newUserName,
                      phone: state.newUserPhone,
                      username: state.newUserUserName,
                      email: state.newUserEmail,
                      password: state.newUserPassword,
                      address: state.newUserAddress,
                      status: state.newUserStatus,
                      deleted: false
                    });
                    setState({
                      isShown: false,
                      newUserName: "",
                      newUserUserName: "",
                      newUserPhone: "",
                      newUserEmail: "",
                      newUserPassword: "",
                      confirmPassword: "",
                      newUserAddress: "",
                      newUserStatus: "inactive"
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
        newUserName: row.name || "",
        newUserDescription: row.description || ""
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
                value={state.newUserName}
                onChange={e => setState({ newUserName: e.target.value })}
                placeholder="Name of user"
                style={{
                  marginBottom: "20px",
                  fontSize: "25px",
                  height: "50px"
                }}
              />
              <Textarea
                name="description"
                value={state.newUserDescription}
                onChange={e => setState({ newUserDescription: e.target.value })}
                placeholder="Description of user"
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
                      name: state.newUserName,
                      description: state.newUserDescription
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

const Users = props => {
  const {
    users,
    allUsers,
    database,
    history,
    search,
    DrawerIcon,
    modelName
  } = props;
  const usersCollection = database.collections.get(pluralize(modelName));

  const createRecord = async userToCreate => {
    await database.action(async () => {
      usersCollection.create(user => {
        user.name = userToCreate.name;
        user.phone = userToCreate.phone;
        user.address = userToCreate.address;
        user.email = userToCreate.email;
        user.username = userToCreate.username;
        user.password = userToCreate.password;
        user.status = userToCreate.status;
        user.profilePicture = userToCreate.profilePicture;
        // user.createdBy = userToCreate.createdBy;
      }).then(async (createdUser) => {
				console.log(`Created ${createdUser.name}`);
				await SyncService.sync(null, database, 'superadmin');
      });
    });
  };

  const updateRecord = async updatedRecord => {
    await database.action(async () => {
      const user = await usersCollection.find(updatedRecord.id);
      await user.update(aUser => {
        aUser.name = updatedRecord.name;
        // auser.notes = updatedRecord.notes;
      });
    });
  };

  const deleteRecord = async id => {
    await database.action(async () => {
      const user = await usersCollection.find(id);
      await user.remove();
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
            <button
              className="nav-item"
              onClick={() => history.push("kiosks")}
            >
              Companies
            </button>
            <button className="nav-item active">Users</button>
						<button onClick={() => SyncService.sync(null, database, 'superadmin')}>Sync</button>
          </div>
        </div>
        <div id="main-body">
          <div>
            <WeakTable
              entries={users}
              allEntries={allUsers}
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
              model={User}
            />
          </div>
          <div id="bottom-area">
            <CreateComponent createRecord={createRecord} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Enhancedusers = withDatabase(
  withObservables(["searchConfig"], ({ database, searchConfig }) => ({
    users: database.collections
      .get(User.table)
      .query(
        Q.where(
          searchConfig.key,
          Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`)
        )
      )
      .observe(),
    allUsers: database.collections
      .get(User.table)
      .query()
      .observe()
  }))(withRouter(Users))
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
      <Enhancedusers
        searchConfig={this.state}
        modelName={modelName}
        company={company}
        DrawerIcon={DrawerIcon}
        search={this.search}
      />
    );
  }
}

