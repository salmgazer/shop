import { Model } from '@nozbe/watermelondb';
import { field, date, text, readonly, relation } from '@nozbe/watermelondb/decorators';

export default class Product extends Model {
  static table = 'products';

  static associations = {
    brands: { type: 'belongs_to', key: 'brand_id' },
    categories: { type: 'belongs_to', key: 'category_id' },
		users: { type: 'belongs_to', key: 'created_by' },
  };

  @field('name') name;
  @text('description') description;
  @field('quantity') quantity;
  @field('selling_price') sellingPrice;
  @field('brand_id') brandId;
  @field('category_id') categoryId;
  @relation('brands', 'brand_id') brand;
	@relation('categories', 'category_id') category;
	@relation('users', 'created_by') createdBy;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
