import 'dotenv/config';
import { db } from './index'; 
import { users, people, mosqueProfile, displayConfig, accounts, coaCategories } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting seeding process...');

  try {
    // 1. Admin User & Person
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, 'admin'),
    });

    if (!existingUser) 
    {
      const [adminPerson] = await db.insert(people).values({
        name: 'System Administrator',
        type: 'pengurus',
        status: 'active',
      }).returning();

      const password = process.env.ADMIN_PASSWORD as string;
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.insert(users).values({
        username: 'admin',
        passwordHash: hashedPassword,
        role: 'superadmin',
        personId: adminPerson.id,
      });
      console.log('✅ Admin user created');
    }

    // 2. Master Data (Idempotent)
    await db.insert(mosqueProfile).values({
      id: 1,
      name: 'Masjid Jami At-Tadzkirah',
      address: '',
      logoUrl: '',
      qrisUrl: '',
      letterheadConfig: {
        headerText: '',
        logoPosition: 'left',
        font: 'Arial'
      }
    }).onConflictDoNothing();

    await db.insert(displayConfig).values({
      id: 1,
      cityId: process.env.DEFAULT_CITY_ID as string, 
      runningText: 'Mohon lurus dan rapatkan shaf.',
    }).onConflictDoNothing();

    await db.insert(coaCategories).values([
      { name: 'Infaq Jumat', type: 'income' },
      { name: 'Operasional', type: 'expense' },
    ]).onConflictDoNothing();

    await db.insert(accounts).values({
      name: 'Kas Tunai',
      balance: 0,
      isActive: true
    }).onConflictDoNothing();

    console.log('🏁 Seeding completed successfully!');
    process.exit(0);

  } 
  catch (err) 
  {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();