import React from "react";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import "./Brands.css";
import { withRouter } from "react-router-dom";
import Component from "@reactions/component";
import { Q } from "@nozbe/watermelondb";
import PropTypes from "prop-types";
import pluralize from "pluralize";
import {Icon, Button, Input, Form, Row, Col, Drawer, message, Divider} from 'antd';
import Papa from "papaparse";
import CardList from "../../../components/CardList";
import MyLocal from "../../../services/MyLocal";
import Brand from "../../../model/brand/Brand";
import TopNav from "../../../components/TopNav";
import {Avatar, FilePicker} from "evergreen-ui";
import UserCompany from "../../../model/userCompanies/UserCompany";


const fieldNames = [
  { name: "name", label: "Name", type: "string" },
  { name: "notes", label: "Notes", type: "string" },
  { name: "createdBy", label: "Created By", type: "string" },
  { name: "createdAt", label: "Created", type: "string" },
  { name: "updatedAt", label: "Updated", type: "string" }
];

const CreateComponentRaw = props => {
  const { createRecord } = props;
	const { getFieldDecorator, getFieldValue } = props.form;
  return (
    <Component
      initialState={{ isShown: false }}
    >
      {({ state, setState }) => (
        <React.Fragment>
					<Drawer
						title="Create brand"
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
											rules: [{ required: true, message: 'Please enter name of brand' }],
										})(
											<Input placeholder="Enter name of brand" />
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24}>
									<Form.Item label="Note">
										{getFieldDecorator('notes', {
											rules: [
												{
													required: false,
												},
											],
										})(<Input.TextArea rows={4} placeholder="Please enter notes about brand" />)}
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
            <Divider dashed />
            <Button
              onClick={() => setState({ isShown: false })} style={{ marginRight: '20px' }}
              type='danger'
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await createRecord({name: getFieldValue('name'), notes: getFieldValue('notes') });
                setState({ isShown: false })
              }}
              type="primary"
            >
              Save
            </Button>
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
						title="Update brand"
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
											rules: [{ required: true, message: 'Please enter name of brand' }],
										})(
										  <Input placeholder="Enter name of brand" />
                    )}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24}>
									<Form.Item label="Note">
										{getFieldDecorator('notes', {
										  initialValue: row.notes,
											rules: [
												{
													required: false,
												},
											],
										})(<Input.TextArea rows={4} placeholder="Please enter notes about brand" />)}
									</Form.Item>
								</Col>
							</Row>
						</Form>
            <Divider dashed/>
            <Button
              onClick={() => setState({ isShown: false })} style={{ marginRight: '20px' }}
              type='danger'
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await updateRecord({id: row.id, name: getFieldValue('name'), notes: getFieldValue('notes') });
                setState({ isShown: false })
              }}
              type="primary"
            >
              Save
            </Button>
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



const Brands = props => {
  const {
    user,
    company,
    users,
    brands,
    database,
    history,
    parentLocation,
    search,
    DrawerIcon,
    modelName
  } = props;
  const brandsCollection = database.collections.get(pluralize(modelName));

  const createRecord = async brandToCreate => {
    await database.action(async () => {
      const existingBrand = await brandsCollection
        .query(Q.where("name", brandToCreate.name))
        .fetch();
      if (existingBrand[0]) {
				message.warning(`The brand ${brandToCreate.name} already exists`);
        return;
      }
      const newBrand = await brandsCollection.create(brand => {
        brand.name = brandToCreate.name;
        brand.notes = brandToCreate.notes;
        brand.companyId = company.id;
        brand.createdBy.set(user);
      });

      message.success(`Successfully created the brand ${newBrand.name}`);
    });
  };

  const updateRecord = async updatedRecord => {
    console.log(updatedRecord);
    await database.action(async () => {
      const brand = await brandsCollection.find(updatedRecord.id);
      await brand.update(aBrand => {
        aBrand.name = updatedRecord.name;
        aBrand.notes = updatedRecord.notes;
      });

			message.success(`Successfully updated the brand ${updatedRecord.name}`);
    });
  };

  const deleteRecord = async id => {
    await database.action(async () => {
      const brand = await brandsCollection.find(id);
      await brand.remove();
    });
  };

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
              onClick={() => history.push("products")}
            >
              Products
            </button>
            <button
              className="nav-item"
              onClick={() => history.push("categories")}
            >
              Categories
            </button>
            <button
              className="nav-item active"
              onClick={() => history.push("brands")}
            >
              Brands
            </button>
          </div>
					<div className="bottom-area">
						<a onClick={() => history.push("sales")}>
							<Icon type="arrow-left"/>
							&nbsp; Sales
						</a><br/><br/>
						<a onClick={() => history.push("expenses")}>
							<Icon type="arrow-left"/>
							&nbsp; Expenditure
						</a>
					</div>
        </div>
        <div id="main-body">
          <div>
            <CardList
              entries={brands}
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
              model={Brand}
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

const EnhancedBrands = withDatabase(
  withObservables(["searchConfig"], ({ database, searchConfig }) => ({
    brands: database.collections
      .get("brands")
      .query(
        Q.where(
          searchConfig.key,
          Q.like(`%${Q.sanitizeLikeString(searchConfig.value)}%`)
        )
      )
      .observe(),
    company: database.collections.get("companies").find(MyLocal.companyId),
    user: database.collections.get("users").find(MyLocal.userId),
    users: database.collections
      .get("users")
			.query( Q.on(UserCompany.table, 'company_id', MyLocal.companyId))
      .observe()
  }))(withRouter(Brands))
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
      <EnhancedBrands
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
