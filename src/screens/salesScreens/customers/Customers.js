import React from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import "./Customers.scss";
import { withRouter } from "react-router-dom";
import Component from "@reactions/component";
import { Q } from "@nozbe/watermelondb";
import PropTypes from "prop-types";
import pluralize from "pluralize";
import {
  SideSheet,
  // eslint-disable-next-line import/no-unresolved
} from "evergreen-ui";
import {Button, Icon, Input} from 'antd';
import CardList from "../../../components/CardList";
import MyLocal from "../../../services/MyLocal";
import User from "../../../model/users/User";
import Company from "../../../model/companies/Company";
import Customer from "../../../model/customers/Customer";
import TopNav from "../../../components/TopNav";

const {TextArea} = Input;
const fieldNames = [
  { name: "name", label: "Name", type: "string" },
  { name: "note", label: "Note", type: "string" },
  { name: "createdBy", label: "Created By", type: "string" },
  { name: "phone", label: "Phone", type: "string" },
  { name: "createdAt", label: "Created", type: "string" },
  { name: "updatedAt", label: "Updated", type: "string" }
];

const CreateComponent = props => {
  const { createRecord } = props;
  return (
    <Component
      initialState={{
        isShown: false,
        newCustomerName: "",
        newCustomerNotes: "",
        newCustomerPhone: ""
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
                Create new Customer
              </h3>
              <label>Name: &nbsp;&nbsp;&nbsp;</label>
              <Input
                required
                name="name"
                value={state.newCustomerName}
                onChange={e => setState({ newCustomerName: e.target.value })}
                placeholder="Name of customer"
                style={{ marginBottom: "20px" }}
              />
              <br />
              <label>Phone: &nbsp;&nbsp;</label>
              <Input
                required
                name="phone"
                value={state.newCustomerPhone}
                onChange={e => setState({ newCustomerPhone: e.target.value })}
                placeholder="Phone number of customer"
                style={{ marginBottom: "20px" }}
              />
              <br />
              <label>Note about customer:</label>
              <br />
              <TextArea
                rows={4}
                name="note"
                value={state.newCustomerNotes}
                onChange={e => setState({ newCustomerNotes: e.target.value })}
                placeholder="Note about customer"
              />
              <div style={{ margin: "0 auto", marginTop: "50px" }}>
                <Button
                  onClick={() => setState({ isShown: false })}
                  intent="danger"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    await createRecord({
                      name: state.newCustomerName,
                      note: state.newCustomerNotes,
                      phone: state.newCustomerPhone
                    });
                    setState({
                      isShown: false,
                      newCustomerName: "",
                      newCustomerNotes: "",
                      newCustomerPhone: ""
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
        newCustomerName: row.name || "",
        newCustomerNotes: row.note || "",
        newCustomerPhone: row.phone || ""
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
              <Input
                required
                name="name"
                value={state.newCustomerName}
                onChange={e => setState({ newCustomerName: e.target.value })}
                placeholder="Name of customer"
                style={{ marginBottom: "20px" }}
              />
              <Input
                required
                name="phone"
                value={state.newCustomerPhone}
                onChange={e => setState({ newCustomerPhone: e.target.value })}
                placeholder="Phone number of customer"
                style={{ marginBottom: "20px" }}
              />
              <TextArea
                name="note"
                value={state.newCustomerNotes}
                onChange={e => setState({ newCustomerNotes: e.target.value })}
                placeholder="Note about customer"
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
                  onClick={() => {
                    updateRecord({
                      id: row[keyFieldName],
                      name: state.newCustomerName,
                      note: state.newCustomerNotes,
                      phone: state.newCustomerPhone
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
            icon="edit"
            onClick={() => setState({ isShown: true })}
            className="hand-pointer"
            size={20}
            color="muted"
            marginRight={20}
          />
        </React.Fragment>
      )}
    </Component>
  );
};

const Customers = props => {
  const {
    user,
    company,
    customers,
    users,
    database,
    history,
    parentLocation,
    search,
    DrawerIcon,
    modelName
  } = props;
  const customersCollection = database.collections.get(pluralize(modelName));

  const createRecord = async customerToCreate => {
    await database.action(async () => {
      const newCustomer = await customersCollection.create(customer => {
        customer.name = customerToCreate.name;
        customer.note = customerToCreate.note;
        customer.phone = customerToCreate.phone;
        customer.companyId = company.id;
        customer.createdBy.set(user);
      });

      console.log(`Created ${newCustomer.name}`);
      console.log(`Created by ${newCustomer.createdBy}`);
    });
  };

  const updateRecord = async updatedRecord => {
    await database.action(async () => {
      const customer = await customersCollection.find(updatedRecord.id);
      await customer.update(aCustomer => {
        aCustomer.name = updatedRecord.name;
        aCustomer.note = updatedRecord.note;
        aCustomer.phone = updatedRecord.phone;
      });
      // search({ key: 'name', value: ''});
    });
  };

  const deleteRecord = async id => {
    await database.action(async () => {
      const customer = await customersCollection.find(id);
      await customer.remove();
    });
  };

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
              className="nav-item active"
              onClick={() => history.push("customers")}
            >
              Customers
            </Button>
						<Button className="nav-item"
              onClick={() => history.push("debtors")}
            >
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
              <Icon icon="arrow-left" marginRight={16} />
              Jump to Inventory
            </a>
          </div>
        </div>
        <div id="main-body">
          <div>
            <CardList
              entries={customers}
              users={users}
              EditComponent={EditComponent}
              updateRecord={updateRecord}
              displayNameField="name"
              keyFieldName="id"
              fieldNames={fieldNames}
              modelName={modelName}
              database={database}
              deleteRecord={deleteRecord}
              search={search}
              user={user}
              model={Customer}
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

const EnhancedCustomers = withDatabase(
  withObservables(["searchConfig"], ({ database, searchConfig }) => ({
    customers: database.collections
      .get(Customer.table)
      .query(
        Q.where(
          searchConfig.key,
          Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`)
        )
      )
      .observe(),
    company: database.collections.get(Company.table).find(MyLocal.companyId),
    user: database.collections.get(User.table).find(MyLocal.userId),
    users: database.collections
      .get(User.table)
      .query()
      .observe()
  }))(withRouter(Customers))
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
      <EnhancedCustomers
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
    company: database.collections.get(Company.table).find(MyLocal.companyId),
    user: database.collections.get(User.table).find(MyLocal.userId)
  }))(withRouter(Parent))
);

export default EnhancedParent;

Parent.propTypes = {
  company: PropTypes.object.isRequired
};
