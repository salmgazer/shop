import { Model } from "@nozbe/watermelondb";
import {
  field,
  date,
  text,
  readonly,
  relation
} from "@nozbe/watermelondb/decorators";

export default class Expense extends Model {
  static table = "expenses";

  static deletable = true;

  static displayName = "Expense";

  static associations = {
    expenseCategories: { type: "belongs_to", key: "expense_category_id" },
    users: { type: "belongs_to", key: "created_by" }
  };

  @field("amount") amount;
  @text("purpose") purpose;
  @field("expense_category_id") categoryId;
  @date("date") date;
  @relation("expenseCategories", "expense_category_id") expenseCategory;
	@field('company_id') companyId;
  @relation("users", "created_by") createdBy;
  @readonly @date("created_at") createdAt;
  @readonly @date("updated_at") updatedAt;

  async remove() {
    await this.markAsDeleted(); // syncable
  }
}
