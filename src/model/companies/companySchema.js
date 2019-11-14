const companySchema = {
	name: 'companies',
	columns: [
		{ name: 'name', type: 'string' },
		{ name: 'code', type: 'string' },
		{ name: 'address', type: 'string', isOptional: true },
		{ name: 'phone', type: 'string' },
		{ name: 'description', type: 'string', isOptional: true },
		{ name: 'category', type: 'string', isOptional: true }, // type or sector of business
		{ name: 'owner_id', type: 'string' },
		{ name: 'location_name', type: 'string' },
		{ name: 'location_gps', type: 'string' },
		{ name: 'logo', type: 'string' },
		{ name: 'status', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default companySchema;
