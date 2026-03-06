  import fs from 'fs';
  import path from 'path';
  import bcrypt from 'bcryptjs';
  import { eq } from 'drizzle-orm';
  import { db } from './index'; 
  import { users, people, dsMosqueProfile, dsConfig, accounts, hadisEnc } from './schema';
  import { PrayerTimeService } from '../modules/prayer-time/prayer-time.service';
  import { PrayerTimeRepository } from '../modules/prayer-time/prayer-time.repository';
  import { DisplayConfigRepository } from '../modules/display-config/display-config.repository';

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
    "Akh. M. Zaki",
    "Akh. Fauzan",
    "Akh. Hanif",
    "Akh. Farhan",
    "Akh. Rizki",
  ];

  export type SeedOptions = 
  {
    type?: 'all' | 'user' | 'master' | 'content';
  };

  export async function seed(options: SeedOptions = { type: 'all' }) 
  {
    console.log(`🌱 Starting seeding process (Type: ${options.type})...`);

    try 
    {
      // 1. Admin User & Person (Always run for 'all' or 'user')
      if (options.type === 'all' || options.type === 'user') {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.username, 'admin'),
          });

          if (!existingUser) 
          {
            const [adminPerson] = await db.insert(people).values({
              name: 'System Administrator',
              type: 'pengurus',
              status: true,
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
      }

    // 2. Master Data (Idempotent)
    if (options.type === 'all' || options.type === 'master') 
    {
        await db.insert(dsMosqueProfile).values({
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

        await db.insert(dsConfig).values({
        id: 1,
        cityId: process.env.DEFAULT_CITY_ID as string || '9766527f2b5d3e95d4a733fcfb77bd7e', // Default Bekasi
        runningText: 'Mohon lurus dan rapatkan shaf.',
        hijriAdj: 0,
        }).onConflictDoNothing();

        await db.insert(accounts).values([
        { id: 1, name: 'Bank BSI', balance: 0, isActive: true },
        { id: 2, name: 'Kas Tunai (Cash)', balance: 0, isActive: true }
        ]).onConflictDoNothing();

        console.log('Fetching 1-year default prayer times...');
        const prayerRepo = new PrayerTimeRepository();
        const configRepo = new DisplayConfigRepository();
        const prayerService = new PrayerTimeService(prayerRepo, configRepo);
        const cityId = process.env.DEFAULT_CITY_ID as string || '9766527f2b5d3e95d4a733fcfb77bd7e';
        await prayerService.syncYearlyFromExternalApi(cityId);
    }

      // 3. Seed Imams (NEW SECTION)
      if (options.type === 'all' || options.type === 'master') {
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
                status: true,
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
      }

      // 4. Seed Hadiths
      if (options.type === 'all' || options.type === 'content') {
          try {
            const hadithsPath = path.resolve(__dirname, 'seeds/data/hadiths.json');
            if (fs.existsSync(hadithsPath)) {
              console.log('Start seeding Hadiths...');
              const hadithsData = JSON.parse(fs.readFileSync(hadithsPath, 'utf-8'));
              
              if (Array.isArray(hadithsData) && hadithsData.length > 0) {
                // Batch insert in chunks of 50
                const batchSize = 50;
                for (let i = 0; i < hadithsData.length; i += batchSize) {
                  const batch = hadithsData.slice(i, i + batchSize);
                  await db.insert(hadisEnc).values(batch).onConflictDoNothing();
                  process.stdout.write(`\r   + Inserted batch ${i / batchSize + 1}/${Math.ceil(hadithsData.length / batchSize)}`);
                }
                console.log('\n   ✅ Hadiths seeded');
              }
            } else {
              console.log('   . Skipped hadiths (File not found)');
            }
          } catch (e) {
            console.error('   ❌ Failed to seed hadiths:', e);
          }
      }

      console.log('🏁 Seeding completed successfully!');
    } 
    catch (err) 
    {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    }
  }

  // Allow standalone execution
  if (require.main === module) {
      seed({ type: 'all' });
  }