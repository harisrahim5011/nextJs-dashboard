import { relations } from "drizzle-orm/relations";
import { customers, invoices } from "./schema";

export const invoicesRelations = relations(invoices, ({one}) => ({
	customer: one(customers, {
		fields: [invoices.customerId],
		references: [customers.id]
	}),
}));

export const customersRelations = relations(customers, ({many}) => ({
	invoices: many(invoices),
}));