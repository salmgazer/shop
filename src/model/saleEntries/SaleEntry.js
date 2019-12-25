import { Model } from '@nozbe/watermelondb';
import {field, date, readonly, json, relation, lazy} from '@nozbe/watermelondb/decorators';

const sanitizeCostPriceAllocations = json => json;

export default class SaleEntry extends Model {
	static table = 'sale_entries';
	static deletable = true;

	static associations = {
		products: { type: 'belongs_to', key: 'product_id' },
		sales: { type: 'belongs_to', key: 'sale_id' }
	};

	@field('quantity') quantity;
	@field('type') type; // sold or returned
	@field('selling_price') sellingPrice;
	@field('cost_price') costPrice;
	@field('total') total;
	@field('product_name') productName;
	@relation('products', 'product_id') product;
	@relation('sales', 'sale_id') sale;
	@json('cost_price_allocations', sanitizeCostPriceAllocations) costPriceAllocations;
	@field('company_id') companyId;
	@readonly @date('created_at') createdAt;
	@readonly @date('updated_at') updatedAt;

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
