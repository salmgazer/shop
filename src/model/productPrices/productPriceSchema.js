const productPricesSchema = {
	name: 'product_prices',
	columns: [
		{ name: 'price', type: 'number' },
		{ name: 'quantity', type: 'number' },
		{ name: 'product_id', type: 'string' },
		{ name: 'created_by', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default productPricesSchema;
