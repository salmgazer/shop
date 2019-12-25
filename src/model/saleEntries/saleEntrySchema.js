const salesEntrySchema = {
	name: 'sale_entries',
	columns: [
		{ name: 'quantity', type: 'number' },
		{ name: 'type', type: 'string' },
		{ name: 'cost_price', type: 'number' },
		{ name: 'selling_price', type: 'number' },
		{ name: 'product_id', type: 'string' },
		{ name: 'product_name', type: 'string' },
		{ name: 'cost_price_allocations', type: 'string' },
		{ name: 'sale_id', type: 'string' },
		{ name: 'total', type: 'number' },
		{ name: 'company_id', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default salesEntrySchema;
