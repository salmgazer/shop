import { Model } from '@nozbe/watermelondb';
import {field, date, readonly, json, relation, lazy} from '@nozbe/watermelondb/decorators';

export default class Customer extends Model {
	static table = 'customers';
	static deletable = false;

	static associations = {
		users: { type: 'belongs_to', key: 'created_by' },
		sales: { type: 'has_many', foreignKey: 'customer_id' },
	};

	@field('name') name;
	@field('phone') phone;
	@field('note') note;
	@field('company_id') companyId;
	@relation('users', 'created_by') createdBy;
	@readonly @date('created_at') createdAt;
	@readonly @date('updated_at') updatedAt;

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
