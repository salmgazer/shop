const expenseCategorySchema = {
	name: 'expense_categories',
	columns: [
		{ name: 'name', type: 'string' },
		{ name: 'created_by', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default expenseCategorySchema;
