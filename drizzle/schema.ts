import { pgTable, unique, varchar, integer, uuid, foreignKey, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const revenue = pgTable("revenue", {
	month: varchar({ length: 4 }).notNull(),
	revenue: integer().notNull(),
}, (table) => [
	unique("revenue_month_unique").on(table.month),
]);

export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const customers = pgTable("customers", {
	id: uuid().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	imageUrl: varchar("image_url", { length: 255 }),
}, (table) => [
	unique("customers_email_unique").on(table.email),
]);

export const invoices = pgTable("invoices", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	customerId: uuid("customer_id").notNull(),
	amount: integer().notNull(),
	status: varchar({ length: 255 }).notNull(),
	date: date().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "invoices_customer_id_customers_id_fk"
		}),
]);
