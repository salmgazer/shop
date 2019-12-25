import {
  schemaMigrations,
  addColumns,
  createTable
} from "@nozbe/watermelondb/Schema/migrations";
import productPricesSchema from "./productPrices/productPriceSchema";
import expenseCategorySchema from "./expenseCategories/expenseCategorySchema";
import expenseSchema from "./expenses/expenseSchema";
import settingsSchema from "./settings/settingSchema";

export default schemaMigrations({
  migrations: []
});
