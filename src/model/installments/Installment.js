import { Model } from "@nozbe/watermelondb";
import {
	field,
	date,
	readonly,
	relation
} from "@nozbe/watermelondb/decorators";

export default class Installment extends Model {
	static table = "installments";

	static editable = true;

	static displayName = "Installment";

	static associations = {
		sales: { type: "belongs_to", key: "sale_id" },
		users: { type: "belongs_to", key: "created_by" }
	};

	@field("amount") amount;
	@field("sale_id") saleId;
	@relation("sales", "sale_id") sale;
	@field('company_id') companyId;
	@relation("users", "created_by") createdBy;
	@readonly @date("created_at") createdAt;
	@readonly @date("updated_at") updatedAt;

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
