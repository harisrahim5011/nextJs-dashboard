import { integer, pgTable, varchar, serial, uuid, date } from "drizzle-orm/pg-core";
import { customers, invoices, revenue } from "../lib/placeholder-data";


// export const usersTable = pgTable("users", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   name: varchar({ length: 255 }).notNull(),
//   age: integer().notNull(),
//   email: varchar({ length: 255 }).notNull().unique(),
// });

// lib/schema.js

// user schema
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(), // Auto-incrementing id
  name: varchar('name', { length: 255 }).notNull(), // User's name
  email: varchar('email', { length: 255 }).unique().notNull(), // User's email (unique)
  password: varchar('password', { length: 255 }).notNull(), // Hashed password
});

// invoices
// lib/schema.js

export const invoicesTable = pgTable('invoices', {
  id: uuid('id').primaryKey(), // UUID primary key, auto-generated
  customer_id: uuid('customer_id').notNull().references(() => usersTable.id), // Customer ID as UUID, foreign key (not null)
  amount: integer('amount').notNull(), // Amount of the invoice
  status: varchar('status', { length: 255 }).notNull(), // Status of the invoice
  date: date('date').notNull(), // Date of the invoice
});

// customers

// Define the customer schema
export const customersTable = pgTable('customers', {
  id: uuid('id').primaryKey(), // UUID as primary key
  name: varchar('name', { length: 255 }).notNull(), // Customer's name
  email: varchar('email', { length: 255 }).notNull().unique(), // Customer's email, unique
  image_url: varchar('image_url', { length: 255 }), // URL for the customer's image
});


// revenue
// Define the revenue schema
export const revenueTable = pgTable('revenue', {
  month: varchar('month', { length: 4 }).notNull().unique(), // Month as a 4-character string (e.g., 'JAN', 'FEB')
  revenue: integer('revenue').notNull(), // Revenue as an integer (e.g., total revenue for the month)
});
