ALTER TABLE "webhook_events" ADD COLUMN "event_type" text;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD COLUMN "player_name" text;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD COLUMN "account_type" text;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD COLUMN "world" integer;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD COLUMN "extra" jsonb;--> statement-breakpoint
ALTER TABLE "webhook_events" DROP COLUMN "source";