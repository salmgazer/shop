import { Model } from "@nozbe/watermelondb";
import {
  field,
  date,
  readonly,
  relation
} from "@nozbe/watermelondb/decorators";

export default class ExpenseCategory extends Model {
  static table = "expense_categories";
	static deletable = false;

  static displayName = "Expense Categories";
  static searchable = true;

  static associations = {
    users: { type: "belongs_to", key: "created_by" }
  };

  @field("name") name;
	@field('company_id') companyId;
  @relation("users", "created_by") createdBy;
  @readonly @date("created_at") createdAt;
  @readonly @date("updated_at") updatedAt;

  async remove() {
    await this.markAsDeleted(); // syncable
  }
}
