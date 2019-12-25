const categorySchema = {
	name: 'categories',
	columns: [
		{ name: 'name', type: 'string' },
		{ name: 'company_id', type: 'string' },
		{ name: 'created_by', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default categorySchema;
