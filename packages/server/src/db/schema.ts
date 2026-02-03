import { sql, relations, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Helper for timestamps
const timestampConfig = { mode: 'timestamp' as const };
const createdAt = integer('created_at', timestampConfig).notNull().default(sql`(unixepoch())`);
const updatedAt = integer('updated_at', timestampConfig).notNull().default(sql`(unixepoch())`).$onUpdate(() => new Date());

// --- 1. Core & Config ---

export const mosqueProfile = sqliteTable('mosque_profile', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  bankAccountNumber: text('no_rekening'),
  logoUrl: text('logo_url'),
  letterheadConfig: text('kop_surat_config', { mode: 'json' }).$type<{
    headerText: string;
    logoPosition: 'left' | 'center' | 'right';
    font: string;
  }>(),
  ...{ createdAt, updatedAt }
});

export const displayConfig = sqliteTable('display_config', {
  id: integer('id').primaryKey(), // Singleton ID 1
  cityId: text('city_id').notNull(),
  mosqueName: text('mosque_name'),
  runningText: text('running_text').default('Luruskan dan rapatkan shaf...'),
  
  // Timings
  preAdzanDuration: integer('pre_adzan_duration').notNull().default(2),
  adzanDuration: integer('adzan_duration').notNull().default(4),
  iqomahDelaySubuh: integer('iqomah_delay_subuh').notNull().default(15),
  iqomahDelayDzuhur: integer('iqomah_delay_dzuhur').notNull().default(10),
  iqomahDelayAshar: integer('iqomah_delay_ashar').notNull().default(10),
  iqomahDelayMaghrib: integer('iqomah_delay_maghrib').notNull().default(10),
  iqomahDelayIsya: integer('iqomah_delay_isya').notNull().default(10),
  prayerDuration: integer('prayer_duration').notNull().default(15),

  // Audio
  enableBeep: integer('enable_beep', { mode: 'boolean' }).notNull().default(true),

  ...{ createdAt, updatedAt }
});

export const shortlinks = sqliteTable('shortlinks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(), // e.g. "infaq"
  originalUrl: text('original_url').notNull(),
  description: text('description'),
  clicks: integer('clicks').notNull().default(0),
  ...{ createdAt, updatedAt }
});

// --- 2. SDM (People) ---

export const people = sqliteTable('people', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').$type<'jamaah' | 'ustadz' | 'pengurus'>().notNull(),
  phoneNumber: text('no_hp'),
  address: text('address'),
  status: text('status').$type<'active' | 'inactive'>().default('active'),
  ...{ createdAt, updatedAt }
});

// Users table now linked to People
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').$type<'superadmin' | 'admin' | 'bendahara' | 'display'>().notNull().default('admin'),
  personId: integer('person_id').references(() => people.id), // Link to real person
  ...{ createdAt, updatedAt }
});

export const meetingMinutes = sqliteTable('meeting_minutes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('judul').notNull(),
  attendanceDate: integer('tanggal', timestampConfig).notNull(),
  content: text('isi').notNull(),
  attendees: text('list_hadir', { mode: 'json' }).$type<string[]>(),
  ...{ createdAt, updatedAt }
});

// --- 3. Peribadahan (Schedules) ---

export const dailyPrayerTimes = sqliteTable('daily_prayer_times', {
  date: text('date').primaryKey(), // Using YYYY-MM-DD string as ID for simplicity in lookup
  imsak: text('imsak').notNull(),
  subuh: text('subuh').notNull(),
  terbit: text('terbit').notNull(),
  dzuhur: text('dzuhur').notNull(),
  ashar: text('ashar').notNull(),
  maghrib: text('maghrib').notNull(),
  isya: text('isya').notNull(),
  ...{ createdAt, updatedAt }
});

// Hybrid Schedule: 1. Weekly Roster (Default)
export const weeklyRoster = sqliteTable('weekly_roster', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sunday, 6=Saturday
  fajrImamId: integer('fajr_imam_id').references(() => people.id),
  fajrMuadzinId: integer('fajr_muadzin_id').references(() => people.id),
  dhuhurImamId: integer('dhuhur_imam_id').references(() => people.id),
  dhuhurMuadzinId: integer('dhuhur_muadzin_id').references(() => people.id),
  asrImamId: integer('asr_imam_id').references(() => people.id),
  asrMuadzinId: integer('asr_muadzin_id').references(() => people.id),
  maghribImamId: integer('maghrib_imam_id').references(() => people.id),
  maghribMuadzinId: integer('maghrib_muadzin_id').references(() => people.id),
  ishaImamId: integer('isha_imam_id').references(() => people.id),
  ishaMuadzinId: integer('isha_muadzin_id').references(() => people.id),
  ...{ createdAt, updatedAt }
});

// Hybrid Schedule: 2. Daily Overrides
export const prayerSchedules = sqliteTable('prayer_schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: integer('date', timestampConfig).notNull(),
  fajrImamId: integer('fajr_imam_id').references(() => people.id),
  fajrMuadzinId: integer('fajr_muadzin_id').references(() => people.id),
  dhuhurImamId: integer('dhuhur_imam_id').references(() => people.id),
  dhuhurMuadzinId: integer('dhuhur_muadzin_id').references(() => people.id),
  asrImamId: integer('asr_imam_id').references(() => people.id),
  asrMuadzinId: integer('asr_muadzin_id').references(() => people.id),
  maghribImamId: integer('maghrib_imam_id').references(() => people.id),
  maghribMuadzinId: integer('maghrib_muadzin_id').references(() => people.id),
  ishaImamId: integer('isha_imam_id').references(() => people.id),
  ishaMuadzinId: integer('isha_muadzin_id').references(() => people.id),
  ...{ createdAt, updatedAt }
});

export const fridaySchedules = sqliteTable('friday_schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: integer('date', timestampConfig).notNull(),
  khatibId: integer('khatib_id').references(() => people.id),
  imamId: integer('imam_id').references(() => people.id),
  muadzinId: integer('muadzin_id').references(() => people.id),
  ...{ createdAt, updatedAt }
});

export const ramadanSchedules = sqliteTable('ramadan_schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: integer('date', timestampConfig).notNull(),
  type: text('type').$type<'tarawih' | 'bukber'>().notNull(),
  description: text('description'),
  imamId: integer('imam_id').references(() => people.id),
  bilalId: integer('bilal_id').references(() => people.id),
  ...{ createdAt, updatedAt }
});

export const kajianEvents = sqliteTable('kajian_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  speakerId: integer('speaker_id').references(() => people.id).notNull(), // Normalized: Must link to people
  date: integer('date', timestampConfig).notNull(),
  posterUrl: text('poster_url'),
  type: text('type').$type<'subuh' | 'tematik' | 'tabligh_akbar'>().default('tematik'),
  ...{ createdAt, updatedAt }
});

// --- 4. Keuangan (Finance) ---

export const coaCategories = sqliteTable('coa_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').$type<'income' | 'expense'>().notNull(),
  ...{ createdAt, updatedAt }
});

// New: Financial Accounts ("Wadah Uang")
export const accounts = sqliteTable('accounts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(), // e.g. "Kotak Amal", "BSI"
    balance: real('balance').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...{ createdAt, updatedAt }
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: integer('date', timestampConfig).notNull(),
  type: text('type').$type<'debit' | 'credit'>().notNull(),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  categoryId: integer('category_id').references(() => coaCategories.id).notNull(),
  accountId: integer('account_id').references(() => accounts.id).notNull(), // Linked to Account
  proofPhotoUrl: text('bukti_foto_url'),
  ...{ createdAt, updatedAt }
});

// --- 5. Komunikasi & Dokumen ---

export const whatsappOutbox = sqliteTable('whatsapp_outbox', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  targetNumber: text('target_number').notNull(),
  message: text('message').notNull(),
  status: text('status').$type<'pending' | 'processing' | 'sent' | 'failed'>().default('pending'),
  scheduledAt: integer('scheduled_at', timestampConfig),
  sentAt: integer('sent_at', timestampConfig),
  failureReason: text('failure_reason'),
  ...{ createdAt, updatedAt }
});

export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  category: text('category'),
  ...{ createdAt, updatedAt }
});

// --- Relations ---

export const peopleRelations = relations(people, ({ many, one }) => ({
  userAccount: one(users),
  kajianEvents: many(kajianEvents, { relationName: 'kajianSpeaker' }),
}));

export const usersRelations = relations(users, ({ one }) => ({
    person: one(people, {
        fields: [users.personId],
        references: [people.id],
    })
}));

export const weeklyRosterRelations = relations(weeklyRoster, ({ one }) => ({
    // Simplified: Just linking logic, relations definitions help with query inclusion
    fajrImam: one(people, { fields: [weeklyRoster.fajrImamId], references: [people.id], relationName: 'weeklyFajrImam' }),
    // ... Repeat for all slots if deeper queries needed
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(coaCategories, {
    fields: [transactions.categoryId],
    references: [coaCategories.id],
  }),
  account: one(accounts, {
      fields: [transactions.accountId],
      references: [accounts.id]
  })
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
    transactions: many(transactions)
}));

export const kajianEventsRelations = relations(kajianEvents, ({ one }) => ({
    speaker: one(people, {
        fields: [kajianEvents.speakerId],
        references: [people.id],
        relationName: 'kajianSpeaker'
    })
}));

// --- Exports Types ---

export type MosqueProfile = InferSelectModel<typeof mosqueProfile>;
export type InsertMosqueProfile = InferInsertModel<typeof mosqueProfile>;

export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export type Person = InferSelectModel<typeof people>;
export type InsertPerson = InferInsertModel<typeof people>;

export type WeeklyRoster = InferSelectModel<typeof weeklyRoster>;
export type InsertWeeklyRoster = InferInsertModel<typeof weeklyRoster>;

export type Account = InferSelectModel<typeof accounts>;
export type InsertAccount = InferInsertModel<typeof accounts>;

export type Transaction = InferSelectModel<typeof transactions>;
export type InsertTransaction = InferInsertModel<typeof transactions>;
