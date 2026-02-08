CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `coa_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_prayer_times` (
	`date` text PRIMARY KEY NOT NULL,
	`imsak` text NOT NULL,
	`subuh` text NOT NULL,
	`terbit` text NOT NULL,
	`dzuhur` text NOT NULL,
	`ashar` text NOT NULL,
	`maghrib` text NOT NULL,
	`isya` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `display_config` (
	`id` integer PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`mosque_name` text,
	`running_text` text DEFAULT 'Luruskan dan rapatkan shaf...',
	`pre_adzan_duration` integer DEFAULT 2 NOT NULL,
	`adzan_duration` integer DEFAULT 4 NOT NULL,
	`iqomah_delay_subuh` integer DEFAULT 15 NOT NULL,
	`iqomah_delay_dzuhur` integer DEFAULT 10 NOT NULL,
	`iqomah_delay_ashar` integer DEFAULT 10 NOT NULL,
	`iqomah_delay_maghrib` integer DEFAULT 10 NOT NULL,
	`iqomah_delay_isya` integer DEFAULT 10 NOT NULL,
	`prayer_duration` integer DEFAULT 15 NOT NULL,
	`enable_beep` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`file_url` text NOT NULL,
	`category` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `friday_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` integer NOT NULL,
	`khatib_id` integer,
	`imam_id` integer,
	`muadzin_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`khatib_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `kajian_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`speaker_id` integer NOT NULL,
	`date` integer NOT NULL,
	`poster_url` text,
	`type` text DEFAULT 'tematik',
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`speaker_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `meeting_minutes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`judul` text NOT NULL,
	`tanggal` integer NOT NULL,
	`isi` text NOT NULL,
	`list_hadir` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mosque_profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`no_rekening` text,
	`logo_url` text,
	`kop_surat_config` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`no_hp` text,
	`address` text,
	`status` text DEFAULT 'active',
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `prayer_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` integer NOT NULL,
	`fajr_imam_id` integer,
	`fajr_muadzin_id` integer,
	`dhuhur_imam_id` integer,
	`dhuhur_muadzin_id` integer,
	`asr_imam_id` integer,
	`asr_muadzin_id` integer,
	`maghrib_imam_id` integer,
	`maghrib_muadzin_id` integer,
	`isha_imam_id` integer,
	`isha_muadzin_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`fajr_imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fajr_muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dhuhur_imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dhuhur_muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asr_imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asr_muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`maghrib_imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`maghrib_muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`isha_imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`isha_muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ramadan_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` integer NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`imam_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` integer NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`description` text NOT NULL,
	`category_id` integer NOT NULL,
	`account_id` integer NOT NULL,
	`bukti_foto_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `coa_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`person_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `weekly_roster` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_of_week` integer NOT NULL,
	`fajr_imam_id` integer,
	`fajr_muadzin_id` integer,
	`dhuhur_imam_id` integer,
	`dhuhur_muadzin_id` integer,
	`asr_imam_id` integer,
	`asr_muadzin_id` integer,
	`maghrib_imam_id` integer,
	`maghrib_muadzin_id` integer,
	`isha_imam_id` integer,
	`isha_muadzin_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`fajr_imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fajr_muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dhuhur_imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dhuhur_muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asr_imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asr_muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`maghrib_imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`maghrib_muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`isha_imam_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`isha_muadzin_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `whatsapp_outbox` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`target_number` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending',
	`scheduled_at` integer,
	`sent_at` integer,
	`failure_reason` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
