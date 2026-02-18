CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"balance" double precision DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coa_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_prayer_times" (
	"date" text PRIMARY KEY NOT NULL,
	"imsak" text NOT NULL,
	"subuh" text NOT NULL,
	"terbit" text NOT NULL,
	"dhuha" text NOT NULL,
	"dzuhur" text NOT NULL,
	"ashar" text NOT NULL,
	"maghrib" text NOT NULL,
	"isya" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "display_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"city_id" text NOT NULL,
	"running_text" text DEFAULT 'Please straighten and tighten the rows...',
	"pre_adzan_duration" integer DEFAULT 2 NOT NULL,
	"adzan_duration" integer DEFAULT 4 NOT NULL,
	"iqomah_delay_subuh" integer DEFAULT 15 NOT NULL,
	"iqomah_delay_dzuhur" integer DEFAULT 10 NOT NULL,
	"iqomah_delay_ashar" integer DEFAULT 10 NOT NULL,
	"iqomah_delay_maghrib" integer DEFAULT 10 NOT NULL,
	"iqomah_delay_isya" integer DEFAULT 10 NOT NULL,
	"shalat_duration" integer DEFAULT 10 NOT NULL,
	"enable_pre_adzan" boolean DEFAULT true NOT NULL,
	"enable_adzan" boolean DEFAULT true NOT NULL,
	"enable_iqomah" boolean DEFAULT true NOT NULL,
	"enable_shalat" boolean DEFAULT true NOT NULL,
	"adj_subuh" integer DEFAULT 0 NOT NULL,
	"adj_terbit" integer DEFAULT 0 NOT NULL,
	"adj_dhuha" integer DEFAULT 0 NOT NULL,
	"adj_dzuhur" integer DEFAULT 0 NOT NULL,
	"adj_ashar" integer DEFAULT 0 NOT NULL,
	"adj_maghrib" integer DEFAULT 0 NOT NULL,
	"adj_isya" integer DEFAULT 0 NOT NULL,
	"enable_beep" boolean DEFAULT true NOT NULL,
	"beep_reminder_duration" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"file_url" text NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friday_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"khatib_id" integer,
	"imam_id" integer,
	"muadzin_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hadis_enc" (
	"id" serial PRIMARY KEY NOT NULL,
	"api_id" integer NOT NULL,
	"teks_arab" text,
	"teks_indo" text,
	"takhrij" text,
	"hikmah" text,
	"grade" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hadis_enc_api_id_unique" UNIQUE("api_id")
);
--> statement-breakpoint
CREATE TABLE "kajian_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"speaker_id" integer NOT NULL,
	"date" timestamp,
	"day_of_week" integer,
	"time" text,
	"poster_url" text,
	"type" text DEFAULT 'kajian_tematik',
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_minutes" (
	"id" serial PRIMARY KEY NOT NULL,
	"judul" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"isi" text NOT NULL,
	"list_hadir" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mosque_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"bank_name" text,
	"bank_account_name" text,
	"no_rekening" text,
	"logo_url" text,
	"qris_url" text,
	"kop_surat_config" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"no_hp" text,
	"address" text,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prayer_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"fajr_imam_id" integer,
	"fajr_muadzin_id" integer,
	"dhuhur_imam_id" integer,
	"dhuhur_muadzin_id" integer,
	"asr_imam_id" integer,
	"asr_muadzin_id" integer,
	"maghrib_imam_id" integer,
	"maghrib_muadzin_id" integer,
	"isha_imam_id" integer,
	"isha_muadzin_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ramadan_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"hijri_year" integer NOT NULL,
	"gregorian_year" integer NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"badal_imam" text,
	"footer_note" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ramadan_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"ramadan_day" integer NOT NULL,
	"description" text,
	"tarawih_imam_id" integer,
	"iftar_snack_source" text,
	"iftar_snack_qty" integer DEFAULT 0,
	"iftar_snack_status" text DEFAULT 'open',
	"iftar_speaker_id" integer,
	"iftar_kajian_title" text,
	"iftar_meal_qty" integer DEFAULT 0,
	"iftar_meal_status" text DEFAULT 'open',
	"water_tarawih_qty" integer DEFAULT 0,
	"water_iftar_qty" integer DEFAULT 0,
	"water_itikaf_qty" integer DEFAULT 0,
	"water_status" text DEFAULT 'open',
	"itikaf_qty" integer DEFAULT 0,
	"itikaf_status" text DEFAULT 'close',
	"charity_qty" integer DEFAULT 0,
	"charity_status" text DEFAULT 'close',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortlinks" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"original_url" text NOT NULL,
	"description" text,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shortlinks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"type" text NOT NULL,
	"amount" double precision NOT NULL,
	"description" text NOT NULL,
	"category_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"bukti_foto_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"token_version" integer DEFAULT 0 NOT NULL,
	"person_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "weekly_roster" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_of_week" integer NOT NULL,
	"fajr_imam_id" integer,
	"fajr_muadzin_id" integer,
	"dhuhur_imam_id" integer,
	"dhuhur_muadzin_id" integer,
	"asr_imam_id" integer,
	"asr_muadzin_id" integer,
	"maghrib_imam_id" integer,
	"maghrib_muadzin_id" integer,
	"isha_imam_id" integer,
	"isha_muadzin_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_outbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_number" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending',
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "friday_schedules" ADD CONSTRAINT "friday_schedules_khatib_id_people_id_fk" FOREIGN KEY ("khatib_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friday_schedules" ADD CONSTRAINT "friday_schedules_imam_id_people_id_fk" FOREIGN KEY ("imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friday_schedules" ADD CONSTRAINT "friday_schedules_muadzin_id_people_id_fk" FOREIGN KEY ("muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kajian_events" ADD CONSTRAINT "kajian_events_speaker_id_people_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_fajr_imam_id_people_id_fk" FOREIGN KEY ("fajr_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_fajr_muadzin_id_people_id_fk" FOREIGN KEY ("fajr_muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_dhuhur_imam_id_people_id_fk" FOREIGN KEY ("dhuhur_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_dhuhur_muadzin_id_people_id_fk" FOREIGN KEY ("dhuhur_muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_asr_imam_id_people_id_fk" FOREIGN KEY ("asr_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_asr_muadzin_id_people_id_fk" FOREIGN KEY ("asr_muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_maghrib_imam_id_people_id_fk" FOREIGN KEY ("maghrib_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_maghrib_muadzin_id_people_id_fk" FOREIGN KEY ("maghrib_muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_isha_imam_id_people_id_fk" FOREIGN KEY ("isha_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_isha_muadzin_id_people_id_fk" FOREIGN KEY ("isha_muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ramadan_schedules" ADD CONSTRAINT "ramadan_schedules_config_id_ramadan_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."ramadan_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ramadan_schedules" ADD CONSTRAINT "ramadan_schedules_tarawih_imam_id_people_id_fk" FOREIGN KEY ("tarawih_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ramadan_schedules" ADD CONSTRAINT "ramadan_schedules_iftar_speaker_id_people_id_fk" FOREIGN KEY ("iftar_speaker_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_coa_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."coa_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_roster" ADD CONSTRAINT "weekly_roster_fajr_imam_id_people_id_fk" FOREIGN KEY ("fajr_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_roster" ADD CONSTRAINT "weekly_roster_fajr_muadzin_id_people_id_fk" FOREIGN KEY ("fajr_muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_roster" ADD CONSTRAINT "weekly_roster_dhuhur_imam_id_people_id_fk" FOREIGN KEY ("dhuhur_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_roster" ADD CONSTRAINT "weekly_roster_dhuhur_muadzin_id_people_id_fk" FOREIGN KEY ("dhuhur_muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_roster" ADD CONSTRAINT "weekly_roster_asr_imam_id_people_id_fk" FOREIGN KEY ("asr_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_roster" ADD CONSTRAINT "weekly_roster_asr_muadzin_id_people_id_fk" FOREIGN KEY ("asr_muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_roster" ADD CONSTRAINT "weekly_roster_maghrib_imam_id_people_id_fk" FOREIGN KEY ("maghrib_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_roster" ADD CONSTRAINT "weekly_roster_maghrib_muadzin_id_people_id_fk" FOREIGN KEY ("maghrib_muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_roster" ADD CONSTRAINT "weekly_roster_isha_imam_id_people_id_fk" FOREIGN KEY ("isha_imam_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_roster" ADD CONSTRAINT "weekly_roster_isha_muadzin_id_people_id_fk" FOREIGN KEY ("isha_muadzin_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;