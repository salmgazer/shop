import React from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import "./Categories.scss";
import { withRouter } from "react-router-dom";
import Component from "@reactions/component";
import { Q } from "@nozbe/watermelondb";
import PropTypes from "prop-types";
import pluralize from "pluralize";
import {
  SideSheet,
  TextInput,
  FilePicker,
  toaster,
  Pane,
  Dialog
  // eslint-disable-next-line import/no-unresolved
} from "evergreen-ui";
import {
  Drawer,
  Icon,
  Form,
  Row,
  Col,
  Select,
  Input,
  Button,
  Divider
} from "antd";
import Papa from "papaparse";
import CardList from "../../../components/CardList";
import MyLocal from "../../../services/MyLocal";
import TopNav from "../../../components/TopNav";
import ExpenseCategory from "../../../model/expenseCategories/ExpenseCategory";
import User from "../../../model/users/User";
import Company from "../../../model/companies/Company";
import UserCompany from "../../../model/userCompanies/UserCompany";

const fieldNames = [
  { name: "name", label: "Name", type: "string" },
  { name: "companyId", label: "Company ID", type: "string" },
  { name: "createdBy", label: "Created By", type: "string" },
  { name: "createdAt", label: "Created", type: "string" },
  { name: "updatedAt", label: "Updated", type: "string" }
];

const DrawerCreateComponent = props => {
  const { createRecord } = props;
  const { getFieldDecorator, setFieldsValue } = props.form;

  const handleChange = e => {
    setFieldsValue({
      name: e.target.value
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        createRecord(values);
      }
    });
  };

  return (
    <Component initialState={{ visible: false, newExpenseCategoryName: "" }}>
      {({ state, setState }) => (
        <React.Fragment>
          <Drawer
            title={`Update ${ExpenseCategory.displayName}`}
            width={720}
            onClose={() => setState({ visible: false })}
            visible={state.visible}
            bodyStyle={{ paddingBottom: 80 }}
          >
            <Form layout="vertical" hideRequiredMark onSubmit={handleSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Name">
                    {getFieldDecorator("name", {
                      rules: [
                        {
                          required: true,
                          message: "Please expense category name"
                        }
                      ]
                    })(
                      <Input
                        onChange={handleChange}
                        placeholder="Please enter name of expense category"
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Divider dashed />
            <Button
              type="danger"
              onClick={() => setState({ visible: false })}
              style={{ marginRight: 20 }}
            >
              Cancel
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              onClick={e => {
                handleSubmit(e);
                setState({ visible: false });
              }}
            >
              Save
            </Button>
          </Drawer>
          <Button
            onClick={() => setState({ visible: true })}
            shape="circle"
            icon="plus"
            size="large"
            style={{
              float: "right",
              marginRight: "20px",
              marginBottom: "20px",
              backgroundColor: "orange",
              color: "white",
              width: "60px",
              height: "60px"
            }}
          />
        </React.Fragment>
      )}
    </Component>
  );
};
const CreateComponent = Form.create()(DrawerCreateComponent);

const DrawerEditComponent = props => {
  const { getFieldDecorator, setFieldsValue } = props.form;
  const { row, updateRecord } = props;

  const handleChange = e => {
    setFieldsValue({
      name: e.target.value
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        values.id = row.id;
        updateRecord(values);
      }
    });
  };

  return (
    <Component initialState={{ visible: false }}>
      {({ state, setState }) => (
        <React.Fragment>
          <Drawer
            title={`Update ${ExpenseCategory.displayName}`}
            width={720}
            onClose={() => setState({ visible: false })}
            visible={state.visible}
            bodyStyle={{ paddingBottom: 80 }}
          >
            <Form layout="vertical" hideRequiredMark onSubmit={handleSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Name">
                    {getFieldDecorator("name", {
                      initialValue: row.name,
                      rules: [
                        {
                          required: true,
                          message: "Please expense category name"
                        }
                      ]
                    })(
                      <Input
                        onChange={handleChange}
                        placeholder="Please enter user name"
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Divider dashed />
            <Button
              type="danger"
              onClick={() => setState({ visible: false })}
              style={{ marginRight: 20 }}
            >
              Cancel
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              onClick={e => {
                handleSubmit(e);
                setState({ visible: false });
              }}
            >
              Save
            </Button>
          </Drawer>
          <Icon
            className="hand-pointer"
            onClick={() => setState({ visible: true })}
            type="edit"
          />
        </React.Fragment>
      )}
    </Component>
  );
};

const EditComponent = Form.create()(DrawerEditComponent);

const DeleteComponent = ({ deleteRecord, entry, displayNameField }) => {
  return (
    <Component initialState={{ isShown: false }}>
      {({ state, setState }) => (
        <Pane>
          <Dialog
            isShown={state.isShown}
            onCloseComplete={() => setState({ isShown: false })}
            hasHeader={false}
            onConfirm={async () => {
              deleteRecord(entry.id);
              setState({ isShown: false });
            }}
            intent="danger"
          >
            Are you sure you want to delete the {ExpenseCategory.displayName}{" "}
            <b style={{ color: "red" }}>{entry[displayNameField]}</b>?
          </Dialog>

          <Button onClick={() => setState({ isShown: true })}>
            <Icon
              type="delete"
              style={{ color: "red" }}
              className="hand-pointer"
            />
          </Button>
        </Pane>
      )}
    </Component>
  );
};

const Categories = props => {
  const {
    user,
    company,
    database,
    history,
    DrawerIcon,
    modelName,
    expenseCategories,
    users,
    search
  } = props;
  const expenseCategoriesCollection = database.collections.get(
    pluralize(modelName)
  );

  const createRecord = async expenseCategoryToCreate => {
    await database.action(async () => {
      const existingExpenseCategory = await expenseCategoriesCollection
        .query(Q.where("name", expenseCategoryToCreate.name))
        .fetch();
      if (existingExpenseCategory[0]) {
        toaster.warning(
          `Expense Category ${expenseCategoryToCreate.name} already exists`
        );
        return;
      }
      const newExpenseCategory = await expenseCategoriesCollection.create(
        expenseCategory => {
          expenseCategory.name = expenseCategoryToCreate.name;
          expenseCategory.companyId = company.id;
          expenseCategory.createdBy.set(user);
        }
      );

      console.log(`Created ${newExpenseCategory.name}`);
      console.log(`Created by ${newExpenseCategory.createdBy}`);
    });
  };

  const updateRecord = async updatedRecord => {
    await database.action(async () => {
      const expenseCategory = await expenseCategoriesCollection.find(
        updatedRecord.id
      );
      await expenseCategory.update(anExpenseCategory => {
        anExpenseCategory.name = updatedRecord.name;
      });
    });
  };

  const deleteRecord = async id => {
    await database.action(async () => {
      const expenseCategory = await expenseCategoriesCollection.find(id);
      await expenseCategory.remove();
    });
  };

  const tableColumns = [
    {
      title: "",
      key: "view",
      render: (text, record) => (
        <span>
          <Button>View</Button>
        </span>
      )
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.length - b.name.length,
      defaultSortOrder: "descend"
    },
    {
      title: "Created on",
      dataIndex: "createdAt",
      key: "createdAt"
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <span>
          <EditComponent record={record} updateRecord={updateRecord} />
          <DeleteComponent
            entry={record}
            deleteRecord={deleteRecord}
            displayNameField="name"
          />
        </span>
      )
    }
  ];

  const tableData = expenseCategories.map(expenseCategory => {
    // const product = await saleEntry.product.fetch();
    const value = {
      key: expenseCategory.id,
      name: expenseCategory.name,
      createdAt: expenseCategory.createdAt.toLocaleString().split(",")[0],
      id: expenseCategory.id
    };
    return value;
  });

  return (
    <div>
      <TopNav user={user} />
      <div id="main-area">
        {/*<DrawerIcon />*/}
        <div id="side-nav">
          <h3 id="company" onClick={() => history.push("home")}>
            {company.name}
          </h3>
          <div id="nav-list">
            <button
              className="nav-item"
              onClick={() => history.push("expenses")}
            >
              Expenses
            </button>
            <button className="nav-item active">Categories</button>
          </div>
          <div className="bottom-area">
            <a onClick={() => history.push("sales")}>
              <Icon type="arrow-left" />
              &nbsp; Sales
            </a>
            <br />
            <br />
            <a onClick={() => history.push("products")}>
              <Icon type="arrow-left" />
              &nbsp; Inventory
            </a>
          </div>
        </div>
        <div id="main-body">
          <div>
            <CardList
              entries={expenseCategories}
              users={users}
              columns={tableColumns}
              tableData={tableData}
              EditComponent={EditComponent}
              updateRecord={updateRecord}
              displayNameField="name"
              keyFieldName="id"
              fieldNames={fieldNames}
              modelName={modelName}
              displayName={ExpenseCategory.displayName}
              database={database}
              deleteRecord={deleteRecord}
              user={user}
              search={search}
              model={ExpenseCategory}
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

const EnhancedCategories = withDatabase(
  withObservables(["searchConfig"], ({ database, searchConfig }) => ({
    expenseCategories: database.collections
      .get(ExpenseCategory.table)
      .query(
        Q.where(
          searchConfig.key,
          Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`),
          Q.where("company_id", MyLocal.companyId)
        )
      )
      .observe(),
    users: database.collections
      .get(User.table)
      .query(Q.on(UserCompany.table, "company_id", MyLocal.companyId))
      .observe()
  }))(withRouter(Categories))
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
      <EnhancedCategories
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
