import { Model } from '@nozbe/watermelondb'
import {field, date, text, readonly, children, relation} from '@nozbe/watermelondb/decorators';

export default class Brand extends Model {
  static table = 'brands';

  static associations = {
    products: { type: 'has_many', foreignKey: 'brand_id' },
		users: { type: 'belongs_to', key: 'created_by' },
  };

  @field('name') name;
  @text('notes') notes;
	@relation('users', 'created_by') createdBy;
	@relation('users', 'user_id') user;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

	@children('products') products;

	/*
	async deleteAllProducts() {
		await this.products.destroyAllPermanently();
	}
	*/

	async remove() {
		// await this.deleteAllProducts(); // delete all reviews first
		await this.markAsDeleted(); // syncable
	}
}
