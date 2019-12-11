import React from "react";
import PropTypes from "prop-types";
import pluralize from "pluralize";
import {
  Button,
  Dialog,
  Pane,
  SideSheet,
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
import { Table, Icon } from "antd";

const CardListItem = props => {
  const {
    entry,
    saleEntries,
    customer,
    removeProductPrice,
    saveProductPrice,
    user,
    productPrices,
    brands,
    categories,
    EditComponent,
    deleteRecord,
    updateRecord,
    keyFieldName,
    modelName,
    displayNameField,
    fieldNames,
    database
  } = props;

  let totalQuantity = 0;
  [].forEach(productPrice => {
    totalQuantity += productPrice.quantity;
  });

  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName"
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity"
    },
    {
      title: "Selling Price (GH₵)",
      dataIndex: "sellingPrice",
      key: "sellingPrice"
    },
    {
      title: "Total (GH₵)",
      dataIndex: "total",
      key: "total"
    }
  ];

  const costPricesColumns = [
    {
      title: "Cost Price",
      dataIndex: "price",
      key: "price"
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity"
    }
  ];

  let totalSales = 0;
  saleEntries.forEach(se => {
    totalSales += se.total;
  });

  const expandedRowRender = record => {
    const item = saleEntries.find(se => se.id === record.key);
    console.log(item);
    let counter = 0;
    const data = item.costPriceAllocations.map(a => {
      const newA = a;
      newA.key = counter;
      counter++;
      return newA;
    });
    return (
      <Table columns={costPricesColumns} dataSource={data} pagination={false} />
    );
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={2} style={{ width: "100px", marginTop: "7px" }}>
        <Component initialState={{ isShown: false, viewPrices: false }}>
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
                    Details of {capitalize(entry.type)}
                  </h3>
                  <Table
                    expandedRowRender={expandedRowRender}
                    columns={columns}
                    dataSource={saleEntries.map(saleEntry => {
                      // const product = await saleEntry.product.fetch();
                      const value = {
                        key: saleEntry._raw.id,
                        productName: saleEntry.productName,
                        quantity: saleEntry._raw.quantity,
                        sellingPrice: saleEntry._raw.selling_price,
                        total: saleEntry._raw.total
                      };
                      return value;
                    })}
                  />
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "lighter",
                      marginBottom: "20px"
                    }}
                  >
                    <b style={{ fontWeight: "300" }}>Total: GH₵ {totalSales}</b>
                  </div>
                  {entry.discount && entry.discount > 0 ? (
                    <div>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "lighter",
                          marginBottom: "20px"
                        }}
                      >
                        <b style={{ fontWeight: "300" }}>
                          Discount: GH₵ {entry.discount}
                        </b>
                      </div>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "lighter",
                          marginBottom: "20px"
                        }}
                      >
                        <b style={{ fontWeight: "300" }}>
                          Total before discount: GH₵{" "}
                          {totalSales - entry.discount}
                        </b>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "lighter",
                      marginBottom: "20px"
                    }}
                  >
                    {customer && customer.name ? (
                      <b style={{ fontWeight: "300" }}>
                        Customer:{" "}
                        <Chip label={customer.name} variant="outlined" />
                      </b>
                    ) : (
                      ""
                    )}
                  </div>
                  <div
                    style={{
                      margin: "0 auto",
                      marginTop: "60px",
                      marginBottom: "70px"
                    }}
                  >
                    <Button>
                      Edit
                      <EditComponent
                        row={entry}
                        modelName={modelName}
                        updateRecord={updateRecord}
                        keyFieldName={keyFieldName}
                        categories={categories}
                        brands={brands}
                        totalQuantity={totalQuantity}
                        productPrices={productPrices}
                        removeProductPrice={removeProductPrice}
                        saveProductPrice={saveProductPrice}
                      />
                    </Button>
                    <Button
                      style={{ marginLeft: "20px" }}
                      onClick={() => setState({ isShown: false })}
                      intent="danger"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </SideSheet>
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
        <div id="name-column">{entry.type}</div>
        <div style={{ color: "#7B8B9A", fontSize: "12px" }}>
          {entry.notes || entry.description || entry.phone}
        </div>
      </Grid>
      <Grid item xs={2} style={{ marginTop: "16px" }}>
        {customer && customer.name ? (
          <div style={{ color: "#7B8B9A", fontSize: "14px" }}>
            {customer.name}
          </div>
        ) : (
          ""
        )}
      </Grid>
      <Grid item xs={3} style={{ marginTop: "16px" }}>
        <div style={{ color: "#7B8B9A", fontSize: "14px" }}>{user.name}</div>
      </Grid>
      <Grid item xs={1} container style={{ marginTop: "16px" }}>
        <Grid item style={{ marginRight: "15px" }}>
          <EditComponent
            row={entry}
            modelName={modelName}
            categories={categories}
            brands={brands}
            updateRecord={updateRecord}
            keyFieldName={keyFieldName}
            totalQuantity={totalQuantity}
            productPrices={productPrices}
            saveProductPrice={saveProductPrice}
            removeProductPrice={removeProductPrice}
          />
        </Grid>
        <Grid item>
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
                  size={"large"}
                  color="muted"
                  className="hand-pointer"
                  onClick={() => setState({ isShown: true })}
                />
              </Pane>
            )}
          </Component>
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
    customer: entry.customer,
    saleEntries: entry.saleEntries.observe(),
    createdBy: entry.createdBy
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
      removeProductPrice,
      updateRecord,
      fieldNames,
      database,
      brands,
      categories,
      displayNameField,
      modelName,
      saveProductPrice,
      keyFieldName,
      search,
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
          <Grid item xs={2}></Grid>
          <Grid
            item
            xs={4}
            style={{
              color: "darkgrey",
              marginBottom: "-20px",
              marginLeft: "10px",
              marginRight: "-18px"
            }}
          >
            <SearchInput
              width="90%"
              placeholder={`Search ${pluralize(
                modelName
              ).toLowerCase()} by name`}
              onChange={e => search({ value: e.target.value, key: "name" })}
            />
          </Grid>
          <Grid item xs={2}>
            <p style={{ color: "grey", marginBottom: "-5px" }}>Created on</p>
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
                  categories,
                  brands,
                  deleteRecord,
                  modelName,
                  entries,
                  fieldNames,
                  database,
                  displayNameField,
                  keyFieldName,
                  updateRecord,
                  user,
                  saveProductPrice,
                  removeProductPrice
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
