import { Model } from '@nozbe/watermelondb';
import {field, date, readonly, relation, children} from '@nozbe/watermelondb/decorators';

export default class Sale extends Model {
	static table = 'sales';
	static deletable = true;

	static associations = {
		customers: { type: 'belongs_to', key: 'customer_id' },
		sale_entries: { type: 'has_many', foreignKey: 'sale_id'},
		users: { type: 'belongs_to', key: 'created_by' },
	};

	@field('note') note;
	@field('type') type; // invoice or sale
	@relation('customers', 'customer_id') customer;
	@relation('users', 'created_by') createdBy;
	@readonly @date('created_at') createdAt;
	@readonly @date('updated_at') updatedAt;

	@children('sale_entries') saleEntries;

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
