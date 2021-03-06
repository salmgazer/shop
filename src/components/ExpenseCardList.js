import React from "react";
import PropTypes from "prop-types";
import pluralize from "pluralize";
import {
  Dialog,
  Pane,
  Combobox,
  SearchInput
} from "evergreen-ui";
import Grid from "@material-ui/core/Grid";
import Component from "@reactions/component";
import capitalize from "capitalize";
import "date-fns";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import Chip from "@material-ui/core/Chip";

import {Drawer, Icon, Button, Divider} from "antd";
import ExpenseCategory from "../model/expenseCategories/ExpenseCategory";
const CardListItem = props => {
  const {
    entry,
    model,
    displayName,
    createdBy,
    EditComponent,
    deleteRecord,
    updateRecord,
    keyFieldName,
    modelName,
    displayNameField,
    fieldNames,
    expenseCategories,
    database,
    expenseCategory
  } = props;

  console.log(entry);

  return (
    <Grid container spacing={1}>
      <Grid item xs={1} style={{ marginTop: "7px" }}>
        <Component initialState={{ isShown: false }}>
          {({ state, setState }) => (
            <React.Fragment>
							<Drawer
								title={`Details of ${capitalize(modelName)}`}
								width={720}
								onClose={() => setState({ isShown: false })}
								visible={state.isShown}
								bodyStyle={{ paddingBottom: 80 }}
							>
                <div style={{ width: "90%", margin: "0 auto" }}>
                  {fieldNames.map(field => {
                    let value = entry[field.name];
                    if (typeof value === "object") {
                      if (value instanceof Date) {
                        value = value.toLocaleString().split(",")[0];
                      } else if (field.name === "createdBy") {
                        value = createdBy ? createdBy.name : "";
                      } else if (field.name === "expenseCategory") {
                        value = expenseCategory.name;
                      }
                    }
                    return (
                      <h5
                        style={{ fontSize: "20px", fontWeight: "lighter" }}
                        key={field.name}
                      >
                        <b style={{ fontWeight: "400" }}>
                          {capitalize(field.label)}
                        </b>
                        : {<Chip label={value} variant="outlined" /> || ""}
                      </h5>
                    );
                  })}

                  <Divider dashed />
                  <div style={{ marginTop: "20px" }}>
                    <EditComponent
                      displayName={displayName}
                      row={entry}
                      modelName={modelName}
                      updateRecord={updateRecord}
                      keyFieldName={keyFieldName}
                      expenseCategories={expenseCategories}
                    />
                    <Button
                      style={{ marginLeft: "20px" }}
                      onClick={() => setState({ isShown: false })}
                      type="danger"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </Drawer>
              <Button
                icon="eye-open"
                onClick={() => setState({ isShown: true })}
                className="card-list-item-view-button"
              >
                View
              </Button>
            </React.Fragment>
          )}
        </Component>
      </Grid>
      <Grid item xs={4} style={{ marginTop: "7px" }}>
        <div id="name-column">
          {entry.name || entry.amount ? <b>GHS {entry.amount}</b> : ""}
        </div>
        <div style={{ color: "#7B8B9A", fontSize: "12px" }}>
          {entry.notes || entry.description || entry.phone}
        </div>
      </Grid>
      <Grid item xs={2} style={{ marginTop: "16px" }}>
        <div style={{ color: "#7B8B9A", fontSize: "14px" }}>
          {entry.date
            ? entry.date
                .toLocaleString()
                .toString()
                .split(",")[0]
            : entry.createdAt
                .toLocaleString()
                .toString()
                .split(",")[0]}
        </div>
      </Grid>
      <Grid item xs={3} style={{ marginTop: "16px" }}>
        <div style={{ color: "#7B8B9A", fontSize: "14px" }}>
          {createdBy ? createdBy.name : ""}
        </div>
      </Grid>
      <Grid item xs={1} container style={{ marginTop: "16px" }}>
        <Grid item>
          <EditComponent
            row={entry}
            modelName={modelName}
            updateRecord={updateRecord}
            displayName={displayName}
            keyFieldName={keyFieldName}
            expenseCategories={expenseCategories}
          />
        </Grid>
        <Grid item>
          {model.deletable ? (
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
                    Are you sure you want to delete the{" "}
                    {pluralize.singular(modelName)}{" "}
                    <b style={{ color: "red" }}>{entry[displayNameField]}</b>?
                  </Dialog>

                  <Icon
                    type="delete"
                    className="hand-pointer"
                    style={{ marginLeft: "20px" }}
                    onClick={() => setState({ isShown: true })}
                  />
                </Pane>
              )}
            </Component>
          ) : (
            ""
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

const EnhancedCardListItem = withDatabase(
  withObservables([], ({ database, modelName, entry }) => ({
    entry: database.collections
      .get(`${pluralize(modelName)}`)
      .findAndObserve(entry.id),
    createdBy: entry.createdBy,
    expenseCategory: database.collections
      .get(ExpenseCategory.table)
      .findAndObserve(entry.categoryId)
  }))(CardListItem)
);

class CardList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDate: new Date(),
      selectedName: ""
    };
  }

  render() {
    const {
      entries,
      EditComponent,
      deleteRecord,
      updateRecord,
      fieldNames,
      database,
      displayName,
      displayNameField,
      modelName,
      model,
      keyFieldName,
      search,
      expenseCategories,
      user,
      users
    } = this.props;

    return (
      <div>
        <Grid
          container
          spacing={1}
          style={{
            marginBottom: "15px",
            width: "85%",
            marginRight: "50px",
            float: "right"
          }}
        >
					<Grid item xs={2}>
						<div style={{
							paddingLeft: '20px',
							paddingRight: '20px',
							paddingTop: '5px',
							paddingBottom: '5px',
							backgroundColor: 'white',
							borderRadius: '5px',
							fontWeight: 'bold',
							marginLeft: '-77px'
						}}>
							Count: {entries.length}
						</div>
					</Grid>
          <Grid
            item
            xs={3}
            style={{
              color: "darkgrey",
              marginBottom: "-20px",
              marginLeft: "10px",
              marginRight: "-18px"
            }}
          >
            {model.searchable ? (
              <SearchInput
                width="90%"
                placeholder={`Search ${pluralize(
                  modelName
                ).toLowerCase()} by name`}
                onChange={e => search({ value: e.target.value, key: "name" })}
              />
            ) : (
              ""
            )}
          </Grid>
          <Grid item xs={2}>
            <p style={{ color: "grey", marginBottom: "-5px" }}>
              {entries[0] && entries[0].date ? "Date" : "Created on"}
            </p>
          </Grid>
          <Grid item xs={3} style={{ color: "grey" }}>
            <Combobox
              width="80%"
              items={[{ name: "all" }].concat(
                users.map(entry => {
                  return { name: entry.name };
                })
              )}
              onChange={selected => console.log(selected)}
              placeholder="Created by"
              itemToString={item => (item ? item.name : "")}
              autocompleteProps={{
                // Used for the title in the autocomplete.
                title: "Created by"
              }}
            />
          </Grid>
          <Grid item xs={1} style={{ color: "grey" }}>
            <p style={{ color: "grey", marginBottom: "-5px" }}>Action</p>
          </Grid>
        </Grid>
        <div className="list-div">
          <Grid container spacing={1} id="list-area">
            {entries.map(entry => (
              <div key={entry.id} className="card-list-item">
                {EnhancedCardListItem({
                  entry,
                  EditComponent,
                  deleteRecord,
                  modelName,
                  entries,
                  fieldNames,
                  expenseCategories,
                  database,
                  displayNameField,
                  keyFieldName,
                  updateRecord,
                  user,
                  displayName,
                  users,
                  model
                })}
              </div>
            ))}
          </Grid>
        </div>
      </div>
    );
  }
}

CardList.propTypes = {
  entries: PropTypes.array.isRequired,
  displayNameField: PropTypes.string.isRequired,
  keyFieldName: PropTypes.string.isRequired,
  fieldNames: PropTypes.array.isRequired,
  updateRecord: PropTypes.func.isRequired,
  modelName: PropTypes.string.isRequired,
  EditComponent: PropTypes.func.isRequired,
  database: PropTypes.object.isRequired,
  search: PropTypes.func.isRequired,
  deleteRecord: PropTypes.func.isRequired
};

CardListItem.propTypes = {
  entry: PropTypes.object.isRequired
};
export default CardList;
