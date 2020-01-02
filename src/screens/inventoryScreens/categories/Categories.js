import React from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import "./Categories.css";
import { withRouter } from "react-router-dom";
import Component from "@reactions/component";
import { Q } from "@nozbe/watermelondb";
import PropTypes from "prop-types";
import pluralize from "pluralize";
import {Button, Col, Drawer, Form, Icon, Input, Row, message} from 'antd';
import Papa from "papaparse";
import CardList from "../../../components/CardList";
import MyLocal from "../../../services/MyLocal";
import Category from "../../../model/categories/Category";
import Company from "../../../model/companies/Company";
import User from "../../../model/users/User";
import TopNav from "../../../components/TopNav";
import {Avatar, FilePicker} from "evergreen-ui";

const fieldNames = [
  { name: "name", label: "Name", type: "string" },
  { name: "createdBy", label: "Created By", type: "string" },
  { name: "createdAt", label: "Created", type: "string" },
  { name: "updatedAt", label: "Updated", type: "string" }
];

const CreateComponentRaw = props => {
  const { createRecord } = props;
  const {getFieldDecorator, getFieldValue} = props.form;
  return (
    <Component initialState={{ isShown: false }}>
      {({ state, setState }) => (
        <React.Fragment>
					<Drawer
						title="Update category"
						width={720}
						onClose={() => setState({ isShown: false })}
						visible={state.isShown}
						bodyStyle={{ paddingBottom: 80 }}
					>
						<Form layout="vertical">
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item label="Name">
										{getFieldDecorator('name', {
											rules: [{ required: true, message: 'Please enter name of category' }],
										})(
											<Input placeholder="Enter name of category" />
										)}
									</Form.Item>
								</Col>
							</Row>
              <Row>
								<FilePicker
									width={250}
									marginBottom={32}
									onChange={async files => {
										const [file] = files;
										if (!file) {
											message.error("File was not imported correctly...");
										} else if (file.type !== "text/csv") {
											message.error("File is not a csv");
										} else {
											Papa.parse(file, {
												header: true,
												dynamicTyping: true,
												complete: function(results) {
													const items = results.data;
													message.info(
														"Importing records... please wait patiently"
													);
													items.forEach(item => {
														createRecord(item);
													});
												}
											});
										}
									}}
									placeholder="Select the csv file here!"
								/>
              </Row>
						</Form>
						<div
							style={{
								position: 'absolute',
								right: 0,
								bottom: 0,
								width: '100%',
								borderTop: '1px solid #e9e9e9',
								padding: '10px 16px',
								background: '#fff',
								textAlign: 'right',
							}}
						>
							<Button
								onClick={() => setState({ isShown: false })} style={{ marginRight: 8 }}
								type='danger'
							>
								Cancel
							</Button>
							<Button
								onClick={async () => {
									await createRecord({ name: getFieldValue('name') });
									setState({ isShown: false })
								}}
								type="primary"
							>
								Save
							</Button>
						</div>
					</Drawer>
					<Avatar
						className="create-avatar"
						onClick={() => setState({ isShown: true })}
						isSolid
						name="+"
						size={60}
					/>
        </React.Fragment>
      )}
    </Component>
  );
};

const CreateComponent = Form.create()(CreateComponentRaw);



const EditComponentRaw = props => {
	const { row, updateRecord } = props;
	const { getFieldDecorator, getFieldValue } = props.form;

	return (
		<Component
			initialState={{ isShown: false }}
		>
			{({ state, setState }) => (
				<React.Fragment>
					<Drawer
						title="Update category"
						width={720}
						onClose={() => setState({ isShown: false })}
						visible={state.isShown}
						bodyStyle={{ paddingBottom: 80 }}
					>
						<Form layout="vertical">
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item label="Name">
										{getFieldDecorator('name', {
											initialValue: row.name,
											rules: [{ required: true, message: 'Please enter name of category' }],
										})(
											<Input placeholder="Enter name of category" />
										)}
									</Form.Item>
								</Col>
							</Row>
						</Form>
						<div
							style={{
								position: 'absolute',
								right: 0,
								bottom: 0,
								width: '100%',
								borderTop: '1px solid #e9e9e9',
								padding: '10px 16px',
								background: '#fff',
								textAlign: 'right',
							}}
						>
							<Button
								onClick={() => setState({ isShown: false })} style={{ marginRight: 8 }}
								type='danger'
							>
								Cancel
							</Button>
							<Button
								onClick={async () => {
									await updateRecord({id: row.id, name: getFieldValue('name') });
									setState({ isShown: false })
								}}
								type="primary"
							>
								Save
							</Button>
						</div>
					</Drawer>
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

const EditComponent = Form.create()(EditComponentRaw);


const Categories = props => {
  const {
    user,
    company,
    users,
    categories,
    database,
    history,
    parentLocation,
    search,
    DrawerIcon,
    modelName
  } = props;
  const categoriesCollection = database.collections.get(pluralize(modelName));

  const createRecord = async categoryToCreate => {
    await database.action(async () => {
      const existingBrand = await categoriesCollection
        .query(Q.where("name", categoryToCreate.name))
        .fetch();
      if (existingBrand[0]) {
        message.warning(`Category ${categoryToCreate.name} already exists`);
        return;
      }

      const newCategory = await categoriesCollection.create(category => {
        category.name = categoryToCreate.name;
        category.companyId = company.id;
        category.createdBy.set(user);
      });

      message.success(`Created the category ${newCategory.name}`);
    });
  };

  const updateRecord = async updatedRecord => {
    await database.action(async () => {
      const category = await categoriesCollection.find(updatedRecord.id);
      await category.update(aCategory => {
        aCategory.name = updatedRecord.name;
        aCategory.createdBy.set(user);
      });
      message.success(`Successfully updated the category ${updatedRecord.name}`);
    });
  };

  const deleteRecord = async id => {
    await database.action(async () => {
      const category = await categoriesCollection.find(id);
      await category.remove();
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
            <button
              className="nav-item"
              onClick={() => history.push("products")}
            >
              Products
            </button>
            <button
              className="nav-item active"
              onClick={() => history.push("categories")}
            >
              Categories
            </button>
            <button className="nav-item" onClick={() => history.push("brands")}>
              Brands
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
            <CardList
              entries={categories}
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
              model={Category}
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
    categories: database.collections
      .get(Category.table)
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
