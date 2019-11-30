import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import schema from './schema';
import Brand from './brand/Brand';
import Product from './products/Product';
import Category from "./categories/Category";
import migrations from './migrations';
import Company from "./companies/Company";
import User from "./users/User";
import UserCompany from "./userCompanies/UserCompany";
import Customer from "./customers/Customer";
import Sale from "./sales/Sale";
import SaleEntry from "./saleEntries/SaleEntry";
import ProductPrice from "./productPrices/ProductPrice";
import Expense from "./expenses/Expense";
import ExpenseCategory from "./expenseCategories/ExpenseCategory";


const adapter = new LokiJSAdapter({
  schema,
  migrations
});

export default new Database({
  adapter,
  modelClasses: [
    Brand,
		Category,
    Product,
    Company,
    User,
    UserCompany,
    Customer,
    Sale,
    SaleEntry,
    ProductPrice,
    Expense,
    ExpenseCategory
  ],
  actionsEnabled: true,
});
