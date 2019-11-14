const brandSchema = {
	name: 'brands',
	columns: [
		{ name: 'name', type: 'string' },
		{ name: 'notes', type: 'string', isOptional: true },
		{ name: 'created_by', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default brandSchema;
