  import 'dotenv/config';
  import { db } from './index'; 
  import { users, people, mosqueProfile, displayConfig, accounts, coaCategories } from './schema';
  import { eq } from 'drizzle-orm';
  import bcrypt from 'bcryptjs';

  const IMAM_LIST = [
    "Ust. Dr. Muhammad Yasir, M.A.",
    "Ust. Muklis Holdani",
    "Ust. Abu Yahya Badru Salam, Lc.",
    "Ust. Subhan", 
    "Ust. Sultan Hasanudin, Lc.",
    "Ust. Khoirul Cahyadi",
    "Ust. Patih Suryo Alam, S.Pdi.",
    "Ust. Alif",
    "Ust. Muhlis Mubarok",
    "Ust. Muhammad Irfandi, Lc.",
    "Ust. Syahrul Fatawa, Lc.",
    "Ust. Mahfudz Umri, Lc.",
    "Ust. Ahmad Rizal, Lc, S.H.I, M.Pd.",
    "Ust. Abu Syifa",
    "Akh. Agung Setiawan",
    "Akh. Adlan",
    "Akh. Abdilah",
    "Akh. Albariq Iltizam",
    "Akh. M. Katsirun Abu Fattan",
    "Akh. Ammar",
    "Akh. Yazid",
  ];

  async function seed() 
  {
    console.log('🌱 Starting seeding process...');

    try 
    {
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

        const password = process.env.ADMIN_PASSWORD as string || 'admin123'; // Fallback if env not set
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
        address: 'Sindangmulya, Kec. Cibarusah, Kabupaten Bekasi, Jawa Barat 17340',
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
        cityId: process.env.DEFAULT_CITY_ID as string || '1204', // Default Bekasi
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

      // 3. Seed Imams (NEW SECTION)
      console.log('Start seeding Imams...');
      
      for (const name of IMAM_LIST) 
      {
        const existingPerson = await db.query.people.findFirst({
          where: eq(people.name, name)
        });

        if (!existingPerson) 
        {
          const isAkh = name.toLowerCase().startsWith('akh');
          const personType = isAkh ? 'jamaah' : 'ustadz';

          await db.insert(people).values({
            name: name,
            type: personType, 
            status: 'active',
            phoneNumber: '-', 
            address: '-'      
          });
          console.log(`   + Added: ${name} as [${personType}]`);
        } 
        else 
          {
          console.log(`   . Skipped: ${name} (Already exists)`);
        }
      }

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