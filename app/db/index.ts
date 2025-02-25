import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { isArray } from 'util';
import bcrypt from 'bcryptjs';
import {invoices, users} from '../lib/placeholder-data'
import { invoicesTable, usersTable } from './schema';
  
const db = drizzle(process.env.DATABASE_URL!);


// services/userService.js


// Function to create a new user with a hashed password
export const createUser = async (users) => {
  // Hash the password
  const hashedPassword = await bcrypt.hash(users.password, 10); // 10 is the salt rounds

  // Insert user into the database with the hashed password
  const result = await db.insert(usersTable).values({
    name : users.name,
    email: users.email,
    password: hashedPassword,
  });

  console.log('User created:', result);
};


// Function to verify the password during login
// export const verifyUserLogin = async (email, enteredPassword) => {
//   // Fetch the user by email
//   const user = await db.select().from(usersTable).where({ email }).limit(1);

//   if (!user.length) {
//     console.log('User not found');
//     return false;
//   }

//   const storedPasswordHash = user[0].password;

//   // Compare the entered password with the stored hashed password
//   const isPasswordValid = await bcrypt.compare(enteredPassword, storedPasswordHash);

//   return isPasswordValid;
// };
// pages/api/create-user.js


// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { name, email, password } = req.body;

//     try {
//       await createUser(name, email, password);
//       res.status(200).json({ message: 'User created successfully' });
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to create user' });
//     }
//   } else {
//     res.status(405).json({ error: 'Method Not Allowed' });
//   }
// }

const insertInvoices = async (invoices) => {
  try {
    // Insert multiple invoices and handle conflicts
    const insertedInvoices = await db
      .insert(invoicesTable)
      .values(invoices) // The data you want to insert
      .onConflictDoNothing({ target: invoices.customer_id }) // Handle conflict on the id column
      .returning(); // Optionally, return the inserted rows (you can also return specific fields)
      // .onConflict((conflict) => conflict.column(invoices.id).doNothing()) // Handle conflict on the id column

    return insertedInvoices;
  } catch (error) {
    console.error('Error inserting invoices:', error);
    throw error;
  }
};

// Call the insert function for invoices
insertInvoices(invoices).then((result) => {
  console.log('Inserted invoices:', result);
}).catch((err) => {
  console.error('Error:', err);
});


function returning() {
  throw new Error('Function not implemented.');
}
// async function main() {
//   const user: typeof usersTable.$inferInsert = {
//     name: 'John',
//     age: 30,
//     email: 'john@example.com',
//   };

// //   await db.insert(usersTable).values(user);
//   console.log('New user created!')

//   const users = await db.select().from(usersTable);
//   console.log('Getting all users from the database: \n',users )

  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */

//   await db
//     .update(usersTable)
//     .set({
//       age: 31,
//     })
//     .where(eq(usersTable.email, user.email));
//   console.log('User info updated!')

//   await db.delete(usersTable).where(eq(usersTable.email, user.email));
//   console.log('User deleted!')
// }


