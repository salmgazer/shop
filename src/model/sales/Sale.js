import { Model } from '@nozbe/watermelondb';
import {field, date, readonly, relation, children, lazy} from '@nozbe/watermelondb/decorators';
import * as Q from "@nozbe/watermelondb/QueryDescription";

export default class Sale extends Model {
	static table = 'sales';

	static associations = {
		customers: { type: 'belongs_to', key: 'customer_id' },
		sale_entries: { type: 'has_many', foreignKey: 'sale_id'},
		users: { type: 'belongs_to', key: 'created_by' },
	};

	@field('note') note;
	@field('type') type; // invoice or sale
	@field('discount') discount;
	@field('arrears') arrears;
	@field('sales_total') salesTotal;
	@relation('customers', 'customer_id') customer;
	@field('company_id') companyId;
	@field('customer_id') customerId;
	@field('payment_status') paymentStatus; // part payment // full payment // unpaid
	@relation('users', 'created_by') createdBy;
	@readonly @date('created_at') createdAt;
	@readonly @date('updated_at') updatedAt;


	@lazy
	saleEntries = this.collections
		.get('sale_entries').query(Q.where('saleId', this.id));

	async remove() {
		await this.markAsDeleted(); // syncable
	}
}
