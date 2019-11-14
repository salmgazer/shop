const productSchema = {
	name: 'products',
	columns: [
		{ name: 'name', type: 'string' },
		{ name: 'description', type: 'string', isOptional: true },
		{ name: 'quantity', type: 'number' },
		{ name: 'selling_price', type: 'number' },
		{ name: 'category_id', type: 'string' },
		{ name: 'brand_id', type: 'string' },
		{ name: 'created_by', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default productSchema;
