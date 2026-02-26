import { sql, relations, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, text, integer, boolean, timestamp, json, doublePrecision, serial, index } from 'drizzle-orm/pg-core';

// Helper for timestamps
const createdAt = timestamp('created_at').notNull().defaultNow();
const updatedAt = timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date());

// --- 1. Core & Config ---

export const mosqueProfile = pgTable('mosque_profile', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  bankName: text('bank_name'),
  bankAccountName: text('bank_account_name'),
  bankAccountNumber: text('no_rekening'),
  logoUrl: text('logo_url'),
  qrisUrl: text('qris_url'),
  letterheadConfig: json('kop_surat_config').$type<{
    headerText: string;
    logoPosition: 'left' | 'center' | 'right';
    font: string;
  }>(),
  createdAt, updatedAt
});

export const displayConfig = pgTable('display_config', {
  id: serial('id').primaryKey(), // Singleton ID 1
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
  shalatDurationSubuh: integer('shalat_duration_subuh').notNull().default(10),
  shalatDurationDzuhur: integer('shalat_duration_dzuhur').notNull().default(10),
  shalatDurationAshar: integer('shalat_duration_ashar').notNull().default(10),
  shalatDurationMaghrib: integer('shalat_duration_maghrib').notNull().default(10),
  shalatDurationIsya: integer('shalat_duration_isya').notNull().default(10),

  // Mode Toggles
  enablePreAdzan: boolean('enable_pre_adzan').notNull().default(true),
  enableAdzan: boolean('enable_adzan').notNull().default(true),
  enableIqomah: boolean('enable_iqomah').notNull().default(true),
  enableShalat: boolean('enable_shalat').notNull().default(true),

  // Time Adjustments (Minutes)
  adjSubuh: integer('adj_subuh').notNull().default(0),
  adjTerbit: integer('adj_terbit').notNull().default(0),
  adjDhuha: integer('adj_dhuha').notNull().default(0),
  adjDzuhur: integer('adj_dzuhur').notNull().default(0),
  adjAshar: integer('adj_ashar').notNull().default(0),
  adjMaghrib: integer('adj_maghrib').notNull().default(0),
  adjIsya: integer('adj_isya').notNull().default(0),
  hijriAdj: integer('hijri_adj').notNull().default(0),

  // Cache
  cachedHijriDate: text('cached_hijri_date'),
  cachedHijriDateAt: text('cached_hijri_date_at'),

  // Audio
  enableBeep: boolean('enable_beep').notNull().default(true), 
  beepReminderDuration: integer('beep_reminder_duration').notNull().default(30),

  createdAt, updatedAt
});

export const shortlinks = pgTable('shortlinks', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(), 
  originalUrl: text('original_url').notNull(),
  description: text('description'),
  clicks: integer('clicks').notNull().default(0),
  createdAt, updatedAt
});

// --- 2. People Management (SDM) ---

export const people = pgTable('people', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').$type<'jamaah' | 'ustadz' | 'pengurus'>().notNull(),
  phoneNumber: text('no_hp'),
  address: text('address'),
  status: boolean('status').default(true),
  createdAt, updatedAt
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').$type<'superadmin' | 'admin' | 'bendahara' | 'display'>().notNull().default('admin'),
  tokenVersion: integer('token_version').notNull().default(0),
  personId: integer('person_id').references(() => people.id),
  createdAt, updatedAt
});

export const meetingMinutes = pgTable('meeting_minutes', {
  id: serial('id').primaryKey(),
  title: text('judul').notNull(),
  attendanceDate: timestamp('tanggal').notNull(),
  content: text('isi').notNull(),
  attendees: json('list_hadir').$type<string[]>(),
  createdAt, updatedAt
});

// --- 3. Worship & Schedules ---

export const dailyPrayerTimes = pgTable('daily_prayer_times', {
  date: text('date').primaryKey(), 
  imsak: text('imsak').notNull(),
  subuh: text('subuh').notNull(),
  terbit: text('terbit').notNull(),
  dhuha: text('dhuha').notNull(),
  dzuhur: text('dzuhur').notNull(),
  ashar: text('ashar').notNull(),
  maghrib: text('maghrib').notNull(),
  isya: text('isya').notNull(),
  createdAt, updatedAt
});

export const weeklyRoster = pgTable('weekly_roster', {
  id: serial('id').primaryKey(),
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
  createdAt, updatedAt
});

export const prayerSchedules = pgTable('prayer_schedules', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
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
  createdAt, updatedAt
});

export const fridaySchedules = pgTable('friday_schedules', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  khatibId: integer('khatib_id').references(() => people.id),
  imamId: integer('imam_id').references(() => people.id),
  muadzinId: integer('muadzin_id').references(() => people.id),
  createdAt, updatedAt
});

export const ramadanConfigs = pgTable('ramadan_configs', {
  id: serial('id').primaryKey(),
  hijriYear: integer('hijri_year').notNull(),
  gregorianYear: integer('gregorian_year').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  badalImamText: text('badal_imam'),
  footerNote: text('footer_note'),
  isActive: boolean('is_active').default(true),
  createdAt, updatedAt
});

export const ramadanSchedules = pgTable('ramadan_schedules', {
  id: serial('id').primaryKey(),
  configId: integer('config_id').references(() => ramadanConfigs.id).notNull(),
  date: timestamp('date').notNull(),
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
  iftarKajianTitle: text('iftar_kajian_title'),
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

  createdAt, updatedAt
});

// Events & Posters
export const kajianEvents = pgTable('kajian_events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  speakerId: integer('speaker_id').references(() => people.id).notNull(),
  date: timestamp('date'), 
  dayOfWeek: integer('day_of_week'),
  time: text('time'), 
  posterUrl: text('poster_url'),
  type: text('type').$type<'kajian_rutin' | 'kajian_tematik' | 'tabligh_akbar'>().default('kajian_tematik'),
  status: boolean('status').default(true), 
  createdAt, updatedAt
});

export const hadisEnc = pgTable('hadis_enc', {
  id: serial('id').primaryKey(),
  apiId: integer('api_id').unique().notNull(),
  teksArab: text('teks_arab'),
  teksIndo: text('teks_indo'),
  takhrij: text('takhrij'),
  hikmah: text('hikmah'),
  grade: text('grade'),
  createdAt, updatedAt
});

// --- 4. Finance ---

export const coaCategories = pgTable('coa_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').$type<'income' | 'expense'>().notNull(),
  createdAt, updatedAt
});

export const accounts = pgTable('accounts', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(), 
    balance: doublePrecision('balance').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt, updatedAt
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  type: text('type').$type<'debit' | 'credit'>().notNull(),
  amount: doublePrecision('amount').notNull(),
  description: text('description').notNull(),
  categoryId: integer('category_id').references(() => coaCategories.id).notNull(),
  accountId: integer('account_id').references(() => accounts.id).notNull(),
  createdAt, updatedAt
}, (table) => {
  return {
    accountIdIdx: index("transactions_account_id_idx").on(table.accountId),
    categoryIdIdx: index("transactions_category_id_idx").on(table.categoryId),
    dateIdx: index("transactions_date_idx").on(table.date),
  };
});

// --- 5. Communication ---

export const whatsappOutbox = pgTable('whatsapp_outbox', {
  id: serial('id').primaryKey(),
  targetNumber: text('target_number').notNull(),
  message: text('message').notNull(),
  status: text('status').$type<'pending' | 'processing' | 'sent' | 'failed'>().default('pending'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  failureReason: text('failure_reason'),
  createdAt, updatedAt
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  category: text('category'),
  createdAt, updatedAt
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