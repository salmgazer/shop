const userCompanySchema = {
	name: 'users_companies',
	columns: [
		{ name: 'user_id', type: 'string' },
		{ name: 'company_id', type: 'string' },
		{ name: 'role', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default userCompanySchema;
