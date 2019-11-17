const salesSchema = {
	name: 'sales',
	columns: [
		{ name: 'note', type: 'string' },
		{ name: 'type', type: 'string'},
		{ name: 'customer_id', type: 'string' },
		{ name: 'discount', type: 'number' },
		{ name: 'created_by', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default salesSchema;
