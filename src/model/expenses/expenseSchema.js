const expenseSchema = {
  name: "expenses",
  columns: [
    { name: "amount", type: "number" },
    { name: "purpose", type: "string", isOptional: true },
    { name: "expense_category_id", type: "string" },
    { name: "date", type: "number" },
		{ name: 'company_id', type: 'string' },
    { name: "created_by", type: "string" },
    { name: "created_at", type: "number" },
    { name: "updated_at", type: "number" }
  ]
};

export default expenseSchema;
