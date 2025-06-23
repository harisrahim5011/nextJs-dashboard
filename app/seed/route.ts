// import bcrypt from 'bcrypt';
import argon2 from 'argon2';
import postgres from 'postgres';

// import * as schema from './schema'
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const connectionString = process.env.DATABASE_URL!

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await argon2.hash(user.password);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

// async function seedInvoices() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

//   await sql`
//     CREATE TABLE IF NOT EXISTS invoices (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       customer_id UUID NOT NULL,
//       amount INT NOT NULL,
//       status VARCHAR(255) NOT NULL,
//       date DATE NOT NULL
//     );
//   `;

//   const insertedInvoices = await Promise.all(
//     invoices.map(
//       (invoice) => sql`
//         INSERT INTO invoices (customer_id, amount, status, date)
//         VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
//         ON CONFLICT (id) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedInvoices;
// }

async function seedInvoices() {
  try {
    // Ensure uuid-ossp extension is available
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create invoices table, with UUID auto-generation for 'id'
    // id UUID  PRIMARY KEY,
    // id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    // id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        customer_id UUID NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        CONSTRAINT fk_customer FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
      );
    `;

    // Get all customer ids to validate the invoices
    const customerIds = await sql`SELECT id FROM customers`;
    const validCustomerIds = new Set(customerIds.map(customer => customer.id));

    const insertedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        // Check if the customer_id exists in the valid customer ids
        if (!validCustomerIds.has(invoice.customer_id)) {
          console.error(`Invalid customer_id: ${invoice.customer_id} in invoice. Skipping this invoice.`);
          return; // Skip this invoice if customer_id is invalid
        }

        // Insert the invoice into the database
        console.log(` customer_id: ${invoice.customer_id} added in invoice.`); // testing
        return sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
          ON CONFLICT (id) DO NOTHING;
        `;
      })
    );

    // Log the successful insertions
    const successCount = insertedInvoices.filter(Boolean).length;
    console.log(`Inserted ${successCount} invoices.`);
    return insertedInvoices;
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error; // Re-throw to ensure failure is caught
  }
}



async function seedCustomers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    const result = await sql.begin((sql) => [
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
