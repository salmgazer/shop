import { schemaMigrations, addColumns, createTable } from '@nozbe/watermelondb/Schema/migrations';
import productPricesSchema from "./productPrices/productPriceSchema";

export default schemaMigrations({
	migrations: [
		{
			toVersion: 8,
			steps: [
				addColumns({
					table: 'sale_entries',
					columns: [
						{name: 'cost_price_allocations', type: 'string'},
					]
				})
			]
		},
		{
			toVersion: 7,
			steps: [
				addColumns({
					table: 'sale_entries',
					columns: [
						{name: 'product_name', type: 'string'},
					]
				})
			]
		},
		{
			toVersion: 6,
			steps: [
				addColumns({
					table: 'sales',
					columns: [
						{name: 'discount', type: 'number'},
						{name: 'customer_id', type: 'string'},
					]
				})
			]
		},
		{
			toVersion: 5,
			steps: [
				addColumns({
					table: 'sale_entries',
					columns: [
						{name: 'cost_price', type: 'number'},
					]
				})
			]
		},
		{
			toVersion: 4,
			steps: [
				addColumns({
					table: 'product_prices',
					columns: [
						{name: 'quantity', type: 'number'},
					]
				})
			]
		},
		{
			toVersion: 3,
			steps: [
				createTable(productPricesSchema)
			]
		},
		{
			toVersion: 2,
			steps: [
			addColumns({
				 table: 'sale_entries',
				 columns: [
					 {name: 'selling_price', type: 'number'},
				 ]
				})
			]
		}
	],
})
