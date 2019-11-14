import { Model } from '@nozbe/watermelondb';
import {field, date, readonly, json, relation, lazy} from '@nozbe/watermelondb/decorators';

export default class SaleEntry extends Model {
	static table = 'sale_entries';
	static deletable = true;

	static associations = {
		products: { type: 'belongs_to', key: 'product_id' },
		sales: { type: 'belongs_to', key: 'sale_id' }
	};

	@field('quantity') note;
	@field('type') type; // sold or returned
	@field('selling_price') sellingPrice;
	@relation('products', 'product_id') product;
	@readonly @date('created_at') createdAt;
	@readonly @date('updated_at') updatedAt;

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
