ALTER TABLE "display_config" ADD COLUMN "shalat_duration_subuh" integer DEFAULT 10 NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "shalat_duration_dzuhur" integer DEFAULT 10 NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "shalat_duration_ashar" integer DEFAULT 10 NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "shalat_duration_maghrib" integer DEFAULT 10 NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "shalat_duration_isya" integer DEFAULT 10 NOT NULL;

-- Migrasi data lama dari shalat_duration ke kolom baru
UPDATE "display_config" 
SET 
  "shalat_duration_subuh" = "shalat_duration", 
  "shalat_duration_dzuhur" = "shalat_duration", 
  "shalat_duration_ashar" = "shalat_duration", 
  "shalat_duration_maghrib" = "shalat_duration", 
  "shalat_duration_isya" = "shalat_duration";

ALTER TABLE "display_config" DROP COLUMN "shalat_duration";