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
  qrisUrl: text('qris_url'),
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
  runningText: text('running_text').default('Please straighten and tighten the rows...'),
  
  // Timings
  preAdzanDuration: integer('pre_adzan_duration').notNull().default(2),
  adzanDuration: integer('adzan_duration').notNull().default(4),
  iqomahDelaySubuh: integer('iqomah_delay_subuh').notNull().default(15),
  iqomahDelayDzuhur: integer('iqomah_delay_dzuhur').notNull().default(10),
  iqomahDelayAshar: integer('iqomah_delay_ashar').notNull().default(10),
  iqomahDelayMaghrib: integer('iqomah_delay_maghrib').notNull().default(10),
  iqomahDelayIsya: integer('iqomah_delay_isya').notNull().default(10),

  // Time Adjustments (Minutes)
  adjSubuh: integer('adj_subuh').notNull().default(0),
  adjTerbit: integer('adj_terbit').notNull().default(0),
  adjDhuha: integer('adj_dhuha').notNull().default(0),
  adjDzuhur: integer('adj_dzuhur').notNull().default(0),
  adjAshar: integer('adj_ashar').notNull().default(0),
  adjMaghrib: integer('adj_maghrib').notNull().default(0),
  adjIsya: integer('adj_isya').notNull().default(0),

  // Audio
  enableBeep: integer('enable_beep', { mode: 'boolean' }).notNull().default(true),
  beepReminderDuration: integer('beep_reminder_duration').notNull().default(30),

  ...{ createdAt, updatedAt }
});

export const shortlinks = sqliteTable('shortlinks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(), 
  originalUrl: text('original_url').notNull(),
  description: text('description'),
  clicks: integer('clicks').notNull().default(0),
  ...{ createdAt, updatedAt }
});

// --- 2. People Management (SDM) ---

export const people = sqliteTable('people', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').$type<'jamaah' | 'ustadz' | 'pengurus'>().notNull(),
  phoneNumber: text('no_hp'),
  address: text('address'),
  status: text('status').$type<'active' | 'inactive'>().default('active'),
  ...{ createdAt, updatedAt }
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').$type<'superadmin' | 'admin' | 'bendahara' | 'display'>().notNull().default('admin'),
  tokenVersion: integer('token_version').notNull().default(0),
  personId: integer('person_id').references(() => people.id),
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

// --- 3. Worship & Schedules ---

export const dailyPrayerTimes = sqliteTable('daily_prayer_times', {
  date: text('date').primaryKey(), 
  imsak: text('imsak').notNull(),
  subuh: text('subuh').notNull(),
  terbit: text('terbit').notNull(),
  dhuha: text('dhuha').notNull(),
  dzuhur: text('dzuhur').notNull(),
  ashar: text('ashar').notNull(),
  maghrib: text('maghrib').notNull(),
  isya: text('isya').notNull(),
  ...{ createdAt, updatedAt }
});

export const weeklyRoster = sqliteTable('weekly_roster', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dayOfWeek: integer('day_of_week').notNull(),
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

export const ramadanConfigs = sqliteTable('ramadan_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hijriYear: integer('hijri_year').notNull(),
  gregorianYear: integer('gregorian_year').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  badalImamText: text('badal_imam'),
  footerNote: text('footer_note'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  ...{ createdAt, updatedAt }
});

export const ramadanSchedules = sqliteTable('ramadan_schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  configId: integer('config_id').references(() => ramadanConfigs.id).notNull(),
  date: integer('date', timestampConfig).notNull(),
  ramadanDay: integer('ramadan_day').notNull(),
  description: text('description'), 

  // 1. Tarawih
  tarawihImamId: integer('tarawih_imam_id').references(() => people.id),
  // 2. Iftar Snack
  iftarSnackSource: text('iftar_snack_source'), 
  iftarSnackQty: integer('iftar_snack_qty').default(0),
  iftarSnackStatus: text('iftar_snack_status').$type<'open' | 'close'>().default('open'),

  // 3. Iftar Meal
  iftarSpeakerId: integer('iftar_speaker_id').references(() => people.id),
  iftarMealQty: integer('iftar_meal_qty').default(0),
  iftarMealStatus: text('iftar_meal_status').$type<'open' | 'close'>().default('open'),

  // 4. Mineral Water
  waterTarawihQty: integer('water_tarawih_qty').default(0),
  waterIftarQty: integer('water_iftar_qty').default(0),
  waterItikafQty: integer('water_itikaf_qty').default(0),
  waterStatus: text('water_status').$type<'open' | 'close'>().default('open'),

  // 5. Itikaf & Sahur
  itikafQty: integer('itikaf_qty').default(0),
  itikafStatus: text('itikaf_status').$type<'open' | 'close'>().default('close'),

  // 6. Charity (Santunan)
  charityQty: integer('charity_qty').default(0),
  charityStatus: text('charity_status').$type<'open' | 'close'>().default('close'),

  ...{ createdAt, updatedAt }
});

// Events & Posters
export const kajianEvents = sqliteTable('kajian_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  speakerId: integer('speaker_id').references(() => people.id).notNull(),
  date: integer('date', timestampConfig).notNull(),
  posterUrl: text('poster_url'),
  type: text('type').$type<'subuh' | 'tematik' | 'tabligh_akbar'>().default('tematik'),
  ...{ createdAt, updatedAt }
});

// --- 4. Finance ---

export const coaCategories = sqliteTable('coa_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').$type<'income' | 'expense'>().notNull(),
  ...{ createdAt, updatedAt }
});

export const accounts = sqliteTable('accounts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(), 
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
  accountId: integer('account_id').references(() => accounts.id).notNull(),
  proofPhotoUrl: text('bukti_foto_url'),
  ...{ createdAt, updatedAt }
});

// --- 5. Communication ---

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

// --- RELATIONS (Updated) ---

export const peopleRelations = relations(people, ({ many, one }) => ({
  userAccount: one(users),
  kajianEvents: many(kajianEvents, { relationName: 'kajianSpeaker' }),
  
  // Ramadan Relations
  ramadanImamSchedules: many(ramadanSchedules, { relationName: 'imamTarawih' }),
  ramadanIftarSchedules: many(ramadanSchedules, { relationName: 'speakerIftar' }),
}));

export const usersRelations = relations(users, ({ one }) => ({
    person: one(people, {
        fields: [users.personId],
        references: [people.id],
    })
}));

export const weeklyRosterRelations = relations(weeklyRoster, ({ one }) => ({
    fajrImam: one(people, { fields: [weeklyRoster.fajrImamId], references: [people.id], relationName: 'weeklyFajrImam' }),
    fajrMuadzin: one(people, { fields: [weeklyRoster.fajrMuadzinId], references: [people.id], relationName: 'weeklyFajrMuadzin' }),
    dhuhurImam: one(people, { fields: [weeklyRoster.dhuhurImamId], references: [people.id], relationName: 'weeklyDhuhurImam' }),
    dhuhurMuadzin: one(people, { fields: [weeklyRoster.dhuhurMuadzinId], references: [people.id], relationName: 'weeklyDhuhurMuadzin' }),
    asrImam: one(people, { fields: [weeklyRoster.asrImamId], references: [people.id], relationName: 'weeklyAsrImam' }),
    asrMuadzin: one(people, { fields: [weeklyRoster.asrMuadzinId], references: [people.id], relationName: 'weeklyAsrMuadzin' }),
    maghribImam: one(people, { fields: [weeklyRoster.maghribImamId], references: [people.id], relationName: 'weeklyMaghribImam' }),
    maghribMuadzin: one(people, { fields: [weeklyRoster.maghribMuadzinId], references: [people.id], relationName: 'weeklyMaghribMuadzin' }),
    ishaImam: one(people, { fields: [weeklyRoster.ishaImamId], references: [people.id], relationName: 'weeklyIshaImam' }),
    ishaMuadzin: one(people, { fields: [weeklyRoster.ishaMuadzinId], references: [people.id], relationName: 'weeklyIshaMuadzin' }),
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

export const ramadanConfigsRelations = relations(ramadanConfigs, ({ many }) => ({
    schedules: many(ramadanSchedules),
}));

export const ramadanSchedulesRelations = relations(ramadanSchedules, ({ one }) => ({
  config: one(ramadanConfigs, {
    fields: [ramadanSchedules.configId],
    references: [ramadanConfigs.id],
  }),
  tarawihImam: one(people, {
    fields: [ramadanSchedules.tarawihImamId],
    references: [people.id],
    relationName: 'imamTarawih'
  }),
  iftarSpeaker: one(people, {
    fields: [ramadanSchedules.iftarSpeakerId],
    references: [people.id],
    relationName: 'speakerIftar'
  }),
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

export type RamadanConfig = InferSelectModel<typeof ramadanConfigs>;
export type InsertRamadanConfig = InferInsertModel<typeof ramadanConfigs>;

export type RamadanSchedule = InferSelectModel<typeof ramadanSchedules>;
export type InsertRamadanSchedule = InferInsertModel<typeof ramadanSchedules>;