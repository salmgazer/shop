const installmentSchema = {
	name: "installments",
	columns: [
		{ name: "amount", type: "number" },
		{ name: "sale_id", type: "string"},
		{ name: 'company_id', type: 'string' },
		{ name: "created_by", type: "string" },
		{ name: "created_at", type: "number" },
		{ name: "updated_at", type: "number" }
	]
};

export default installmentSchema;
