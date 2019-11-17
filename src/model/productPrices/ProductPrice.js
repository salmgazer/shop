import { Model } from '@nozbe/watermelondb';
import {field, date, readonly, json, relation, lazy} from '@nozbe/watermelondb/decorators';

export default class ProductPrice extends Model {
	static table = 'product_prices';
	static deletable = false;

	static associations = {
		users: { type: 'belongs_to', key: 'created_by' },
		products: { type: 'belongs_to', key: 'product_id' },
	};

	@field('price') price; // cost price
	@field('quantity') quantity;
	@relation('products', 'product_id') product;
	@relation('users', 'created_by') createdBy;
	@readonly @date('created_at') createdAt;
	@readonly @date('updated_at') updatedAt;

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
