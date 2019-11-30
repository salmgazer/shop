import React from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import "./Expenses.scss";
import { withRouter } from "react-router-dom";
import Component from "@reactions/component";
import { Q } from "@nozbe/watermelondb";
import PropTypes from "prop-types";
import pluralize from "pluralize";
import moment from "moment";
import {
  Drawer,
  Form,
  Row,
  Col,
  Select,
  Input,
  Icon,
  Button,
  InputNumber,
  DatePicker
} from "antd";
import {
  Textarea,
  FilePicker,
  toaster
  // eslint-disable-next-line import/no-unresolved
} from "evergreen-ui";
import Papa from "papaparse";
import ExpenseCardList from "../../../components/ExpenseCardList";
import MyLocal from "../../../services/MyLocal";
import TopNav from "../../../components/TopNav";
import Expense from "../../../model/expenses/Expense";
import ExpenseCategory from "../../../model/expenseCategories/ExpenseCategory";
import User from "../../../model/users/User";

const { Option } = Select;

const fieldNames = [
  { name: "amount", label: "Amount", type: "string" },
  { name: "purpose", label: "Purpose", type: "string" },
  { name: "expenseCategory", label: "Expense Category", type: "string" },
  { name: "date", label: "Date", type: "string" },
  { name: "createdBy", label: "Created By", type: "string" },
  { name: "createdAt", label: "Created", type: "string" },
  { name: "updatedAt", label: "Updated", type: "string" }
];

const DrawerCreateComponent = props => {
  const { createRecord, expenseCategories } = props;
  const { getFieldDecorator, setFieldsValue } = props.form;

  const handleAmountChange = amount => {
    setFieldsValue({ amount });
  };

  const handlePurposeChange = purpose => {
    setFieldsValue({ purpose });
  };

  const handleCategoryChange = expenseCategory => {
    setFieldsValue({ expenseCategory });
  };

  const handleDateChange = date => {
    setFieldsValue({ date });
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
    <Component initialState={{ visible: false }}>
      {({ state, setState }) => (
        <React.Fragment>
          <Drawer
            title={`Update ${Expense.displayName}`}
            width={720}
            onClose={() => setState({ visible: false })}
            visible={state.visible}
            bodyStyle={{ paddingBottom: 80 }}
          >
            <Form layout="vertical" hideRequiredMark onSubmit={handleSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Amount">
                    {getFieldDecorator("amount", {
                      rules: [
                        {
                          required: true,
                          message: "Please enter amount"
                        }
                      ]
                    })(<InputNumber min={0} onChange={handleAmountChange} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Expense category">
                    {getFieldDecorator("expenseCategory", {
                      rules: [
                        {
                          required: true,
                          message: "Select category of expense"
                        }
                      ]
                    })(
                      <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select category"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {expenseCategories.map(expenseCategory => (
                          <Option
                            key={expenseCategory.id}
                            value={expenseCategory.id}
                          >
                            {expenseCategory.name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Purpose">
                    {getFieldDecorator("purpose", {
                      rules: [
                        {
                          required: true,
                          message: "Add purpose of expense"
                        }
                      ]
                    })(
                      <Textarea
                        placeholder="Enter purpose of expense"
                        onChange={handlePurposeChange}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Date of expense">
                    {getFieldDecorator("date", {
                      rules: [
                        {
                          required: true,
                          message: "Add date of expense"
                        }
                      ]
                    })(<DatePicker onChange={handleDateChange} />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <div
              style={{
                width: "100%",
                borderTop: "1px solid #e9e9e9",
                padding: "10px 16px",
                background: "#fff",
                textAlign: "right"
              }}
            >
              <Button
                type="danger"
                onClick={() => setState({ visible: false })}
                style={{ marginRight: 20 }}
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                onClick={e => {
                  handleSubmit(e);
                  setState({ visible: false });
                }}
              >
                Save
              </Button>
            </div>
          </Drawer>
          <button
            className="sell-btn"
            onClick={() => setState({ visible: true })}
            type="danger"
            shape="circle"
            icon="plus"
            size="large"
          >
            Add Expense
          </button>
        </React.Fragment>
      )}
    </Component>
  );
};
const CreateComponent = Form.create()(DrawerCreateComponent);

const DrawerEditComponent = props => {
  const { getFieldDecorator, setFieldsValue } = props.form;
  const { row, updateRecord, expenseCategories } = props;

  const handleAmountChange = amount => {
    setFieldsValue({ amount });
  };

  const handlePurposeChange = purpose => {
    setFieldsValue({ purpose });
  };

  const handleCategoryChange = expenseCategory => {
    setFieldsValue({ expenseCategory });
  };

  const handleDateChange = date => {
    setFieldsValue({ date });
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
                  <Form.Item label="Amount (GHS)">
                    {getFieldDecorator("amount", {
                      initialValue: row.amount,
                      rules: [
                        {
                          required: true,
                          message: "Please enter amount"
                        }
                      ]
                    })(
                      <InputNumber
                        style={{ width: "300px" }}
                        onChange={handleAmountChange}
                        placeholder="Please enter amount"
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Expense category">
                    {getFieldDecorator("expenseCategory", {
                      initialValue: row.categoryId,
                      rules: [
                        {
                          required: true,
                          message: "Select category of expense"
                        }
                      ]
                    })(
                      <Select
                        showSearch
                        style={{ width: "300px" }}
                        placeholder="Select category"
                        optionFilterProp="children"
                        onChange={handleCategoryChange}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {expenseCategories.map(expenseCategory => (
                          <Option
                            key={expenseCategory.id}
                            value={expenseCategory.id}
                          >
                            {expenseCategory.name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Purpose">
                    {getFieldDecorator("purpose", {
                      initialValue: row.purpose,
                      rules: [
                        {
                          required: true,
                          message: "Add purpose of expense"
                        }
                      ]
                    })(
                      <Textarea
                        style={{ width: "300px" }}
                        placeholder="Enter purpose of expense"
                        onChange={handlePurposeChange}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Date of expense">
                    {getFieldDecorator("date", {
                      initialValue: moment(row.date),
                      rules: [
                        {
                          required: true,
                          message: "Add date of expense"
                        }
                      ]
                    })(
                      <DatePicker
                        style={{ width: "300px" }}
                        onChange={handleDateChange}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <div
              style={{
                width: "100%",
                borderTop: "1px solid #e9e9e9",
                padding: "10px 16px",
                background: "#fff",
                textAlign: "right"
              }}
            >
              <Button
                type="danger"
                onClick={() => setState({ visible: false })}
                style={{ marginRight: 20 }}
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                onClick={e => {
                  handleSubmit(e);
                  setState({ visible: false });
                }}
              >
                Save
              </Button>
            </div>
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

const Expenses = props => {
  const {
    user,
    company,
    expenses,
    database,
    history,
    users,
    parentLocation,
    search,
    DrawerIcon,
    expenseCategories,
    modelName
  } = props;
  const expenseCollection = database.collections.get(Expense.table);
  const expenseCategoryCollection = database.collections.get(
    ExpenseCategory.table
  );

  const createRecord = async expenseToCreate => {
    await database.action(async () => {
      const expenseCategory = await expenseCategoryCollection.find(
        expenseToCreate.expenseCategory
      );
      const newExpense = await expenseCollection.create(expense => {
        expense.amount = expenseToCreate.amount;
        expense.purpose = expenseToCreate.purpose;
        expense.date = expenseToCreate.date;
        expense.expenseCategory.set(expenseCategory);
        expense.createdBy.set(user);
      });

      console.log(`Created ${newExpense.amount}`);
      console.log(`Created by ${newExpense.createdBy}`);
    });
  };

  const updateRecord = async updatedRecord => {
    await database.action(async () => {
      const expenseCategory = await expenseCategoryCollection.find(
        updatedRecord.expenseCategory
      );
      const expense = await expenseCollection.find(updatedRecord.id);
      await expense.update(anExpense => {
        anExpense.amount = updatedRecord.amount;
        anExpense.purpose = updatedRecord.purpose;
        anExpense.date = updatedRecord.date;
        anExpense.expenseCategory.set(expenseCategory);
      });
      // search({ key: 'name', value: ''});
    });
  };

  const deleteRecord = async id => {
    await database.action(async () => {
      const expense = await expenseCollection.find(id);
      await expense.remove();
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
            <button className="nav-item active">Expenses</button>
            <button
              className="nav-item"
              onClick={() => history.push("expense_categories")}
            >
              Categories
            </button>
          </div>
          <div className="bottom-area">
            <a onClick={() => history.push("sales")}>
              <Icon type="arrow-left" />
              Jump to Sales
            </a>
          </div>
        </div>
        <div id="main-body">
          <div>
            <ExpenseCardList
              entries={expenses}
              expenseCategories={expenseCategories}
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
              model={Expense}
            />
          </div>
          <div id="bottom-area">
            <CreateComponent
              expenseCategories={expenseCategories}
              createRecord={createRecord}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const EnhancedExpenses = withDatabase(
  withObservables([], ({ database }) => ({
    expenses: database.collections
      .get(Expense.table)
      .query()
      .observe(),
    expenseCategories: database.collections
      .get(ExpenseCategory.table)
      .query()
      .observe()
  }))(withRouter(Expenses))
);

class Parent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: "amount",
      value: 0,
      operation: "equal"
    };

    this.search = this.search.bind(this);
  }

  search(config) {
    const { key, operation } = config;
    let { value } = config;
    if (value === "all" && key === "amount") {
      value = "";
    }
    this.setState({ key, value, operation });
  }

  render() {
    const {
      company,
      DrawerIcon,
      modelName,
      user,
      expenses,
      users
    } = this.props;
    return (
      <EnhancedExpenses
        searchConfig={this.state}
        expenses={expenses}
        modelName={modelName}
        company={company}
        user={user}
        DrawerIcon={DrawerIcon}
        users={users}
        search={this.search}
      />
    );
  }
}
const EnhancedParent = withDatabase(
  withObservables([], ({ database }) => ({
    company: database.collections.get("companies").find(MyLocal.companyId),
    user: database.collections.get("users").find(MyLocal.userId),
    users: database.collections
      .get(User.table)
      .query()
      .observe()
  }))(withRouter(Parent))
);

export default EnhancedParent;

Parent.propTypes = {
  company: PropTypes.object.isRequired
};
