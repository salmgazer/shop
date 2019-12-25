import { appSchema, tableSchema } from "@nozbe/watermelondb";
import brandSchema from "./brand/brandSchema";
import productSchema from "./products/productSchema";
import categorySchema from "./categories/categorySchema";
import companySchema from "./companies/companySchema";
import userSchema from "./users/userSchema";
import userCompanySchema from "./userCompanies/userCompanySchema";
import customerSchema from "./customers/customerSchema";
import salesSchema from "./sales/saleSchema";
import salesEntrySchema from "./saleEntries/saleEntrySchema";
import productPricesSchema from "./productPrices/productPriceSchema";
import expenseCategorySchema from "./expenseCategories/expenseCategorySchema";
import expenseSchema from "./expenses/expenseSchema";
import settingsSchema from "./settings/settingSchema";

export default appSchema({
  version: 1,
  tables: [
    tableSchema(companySchema),
    tableSchema(userSchema),
    tableSchema(brandSchema),
    tableSchema(categorySchema),
    tableSchema(productSchema),
    tableSchema(userCompanySchema),
    tableSchema(customerSchema),
    tableSchema(salesSchema),
    tableSchema(salesEntrySchema),
    tableSchema(productPricesSchema),
    tableSchema(expenseCategorySchema),
    tableSchema(expenseSchema),
    tableSchema(settingsSchema)
  ]
});
