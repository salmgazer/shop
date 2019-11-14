import { Model } from '@nozbe/watermelondb'
import {field, date, readonly, relation} from '@nozbe/watermelondb/decorators';

export default class Category extends Model {
  static table = 'categories';

  static associations = {
    products: { type: 'has_many', foreignKey: 'category_id' },
		users: { type: 'belongs_to', key: 'created_by' },
  };

  @field('name') name;
	@relation('users', 'created_by') createdBy;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
