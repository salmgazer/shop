import { Model } from '@nozbe/watermelondb';
import {field, date, readonly} from '@nozbe/watermelondb/decorators';
import { lazy } from '@nozbe/watermelondb/decorators'
import { Q } from '@nozbe/watermelondb';


export default class Company extends Model {
	static table = 'companies';
	static deletable = true;

	static associations = {
		users_companies: { type: 'has_many', foreignKey: 'company_id' },
	};

	@field('name') name;
	@field('code') code;
	@field('address') address;
	@field('phone') phone;
	@field('description') description;
	@field('category') category;
	@field('location_name') locationName;
	@field('location_gps') locationGps;
	@field('status') status;
	@field('logo') logo;
	@readonly @date('created_at') createdAt;
	@readonly @date('updated_at') updatedAt;

	async remove() {
		await this.markAsDeleted(); // syncable
	}

	owner = this.collections
		.get('users')
		.query(Q.on('users_companies', 'user_id', this.id));
}
