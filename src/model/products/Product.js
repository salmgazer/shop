import { Model } from '@nozbe/watermelondb';
import { field, date, text, readonly, relation, children } from '@nozbe/watermelondb/decorators';
import * as Q from "@nozbe/watermelondb/QueryDescription";

export default class Product extends Model {
  static table = 'products';
  static deletable = true;

  static associations = {
    brands: { type: 'belongs_to', key: 'brand_id' },
    categories: { type: 'belongs_to', key: 'category_id' },
		users: { type: 'belongs_to', key: 'created_by' },
		productPrices: { type: 'has_many', foreignKey: 'product_id' }
  };

  @field('name') name;
  @text('description') description;
  @field('quantity') quantity;
  @field('selling_price') sellingPrice;
  @field('brand_id') brandId;
  @field('category_id') categoryId;
  @relation('brands', 'brand_id') brand;
	@relation('categories', 'category_id') category;
	@field('company_id') companyId;
	@relation('users', 'created_by') createdBy;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

	async remove() {
		await this.markAsDeleted(); // syncable
	}

	productPrices = this.collections
		.get('product_prices')
		.query(Q.where('product_id', this.id), Q.where('quantity', Q.gt(0)));
}
