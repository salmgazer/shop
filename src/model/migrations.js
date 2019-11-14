import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
	migrations: [{
		toVersion: 2,
		steps: [
		addColumns({
			 table: 'sale_entries',
			 columns: [
				 {name: 'selling_price', type: 'number'},
			 ]
			})
		]
	}],
})
