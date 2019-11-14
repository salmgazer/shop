const salesSchema = {
	name: 'sales',
	columns: [
		{ name: 'note', type: 'string' },
		{ name: 'type', type: 'string'},
		{ name: 'created_by', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default salesSchema;
