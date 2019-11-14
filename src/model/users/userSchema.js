const userSchema = {
	name: 'users',
	columns: [
		{ name: 'name', type: 'string' },
		{ name: 'phone', type: 'string' },
		{ name: 'address', type: 'string', isOptional: true  },
		{ name: 'email', type: 'string', isOptional: true  },
		{ name: 'username', type: 'string' },
		{ name: 'profile_picture', type: 'string' },
		{ name: 'password', type: 'string' },
		{ name: 'status', type: 'string' },
		{ name: 'created_by', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'updated_at', type: 'number' },
	]
};

export default userSchema;
