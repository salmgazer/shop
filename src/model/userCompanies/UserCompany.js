import { field } from '@nozbe/watermelondb/decorators';
import { Model } from '@nozbe/watermelondb';


export default class UserCompany extends Model {
	static table = 'users_companies';

	static associations = {
		companies: { type: 'belongs_to', key: 'company_id' },
		users: { type: 'belongs_to', key: 'user_id' },
	};

	@field('user_id') userId;
	@field('company_id') companyId;
	@field('role') role;

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
