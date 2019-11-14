const customerSchema = {
	name: 'customers',
	columns: [
		{ name: 'name', type: 'string' },
		{ name: 'phone', type: 'string' },
		{ name: 'note', type: 'string', isOptional: true  },
		{ name: 'created_by', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default customerSchema;
