import { Model } from '@nozbe/watermelondb';
import {field, date, readonly, json, relation, lazy} from '@nozbe/watermelondb/decorators';
import * as Q from "@nozbe/watermelondb/QueryDescription";
import database from "../../model/database";

export default class User extends Model {
	static table = 'users';
	static deletable = true;

	static associations = {
		users: { type: 'belongs_to', key: 'created_by' },
		users_companies: { type: 'has_many', foreignKey: 'user_id' },
	};

	@field('name') name;
	@field('phone') phone;
	@field('address') address;
	@field('username') username;
	@field('email') email;
	@field('status') status;
	@field('profile_picture') profilePicture;
	@relation('users', 'created_by') createdBy;
	@field('password') password;
	@readonly @date('created_at') createdAt;
	@readonly @date('updated_at') updatedAt;

	@lazy
	companies = this.collections
		.get('companies')
		.query(Q.on('users_companies', 'user_id', this.id));

	@lazy
	ownedCompanies = this.collections
		.get('companies')
		.query(Q.on('users_companies', 'user_id', this.id), Q.where('role', 'owner'));

	async ownedCompany(companyId) {
		const ownedCompany = await this.collections.get('users_companies')
			.query(Q.where('user_id', this.id), Q.where('company_id', companyId));
		return ownedCompany[0];
	}

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
