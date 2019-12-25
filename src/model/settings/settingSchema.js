const settingsSchema = {
	name: 'settings',
	columns: [
		{ name: 'primary_color', type: 'string' },
		{ name: 'secondary_color', type: 'string'},
		{ name: 'company_id', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
		{ name: 'user_id', type: 'string' }
	]
};

export default settingsSchema;
