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
  migrations: [ {
		toVersion: 2,
		steps: [
			addColumns({
				table: 'sales',
				columns: [
					{ name: 'payment_status', type: 'string'},
				],
			}),
			createTable({
				name: 'installments',
				columns: [
					{ name: 'amount', type: 'number'},
					{ name: 'sale_id', type: 'string' },
          { name: 'company_id', type: 'string' },
					{ name: 'created_by', type: 'string' },
					{ name: 'created_at', type: 'number' },
					{ name: 'updated_at', type: 'number' },
				],
			}),
		],
	},
	]
});
