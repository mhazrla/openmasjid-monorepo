ALTER TABLE "display_config" ADD COLUMN "shalat_duration_subuh" integer DEFAULT 10 NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "shalat_duration_dzuhur" integer DEFAULT 10 NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "shalat_duration_ashar" integer DEFAULT 10 NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "shalat_duration_maghrib" integer DEFAULT 10 NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "shalat_duration_isya" integer DEFAULT 10 NOT NULL;

UPDATE "display_config" 
SET 
  "shalat_duration_subuh" = "shalat_duration", 
  "shalat_duration_dzuhur" = "shalat_duration", 
  "shalat_duration_ashar" = "shalat_duration", 
  "shalat_duration_maghrib" = "shalat_duration", 
  "shalat_duration_isya" = "shalat_duration";

ALTER TABLE "display_config" DROP COLUMN "shalat_duration";
ALTER TABLE "display_config" ADD COLUMN "label_color" text DEFAULT '#cbd5e1' NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "accent_color" text DEFAULT '#fbbf24' NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "theme_color" text DEFAULT '#10b981' NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "font_family" text DEFAULT 'sans' NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "base_font_size" integer DEFAULT 100 NOT NULL;
ALTER TABLE "display_config" ADD COLUMN "clock_font_size" integer DEFAULT 100 NOT NULL;