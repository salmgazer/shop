import { Model } from '@nozbe/watermelondb';
import {field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Setting extends Model {
	static table = 'settings';

	static associations = {
		users: { type: 'belongs_to', key: 'user_id' },
		companies: {type: 'belongs_to', key: 'company_id' }
	};

	@field('primary_color') primaryColor;
	@field('secondary_color') secondaryColor; // sold or returned
	@field('company_id') companyId;
	@readonly @date('created_at') createdAt;
	@readonly @date('updated_at') updatedAt;

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
