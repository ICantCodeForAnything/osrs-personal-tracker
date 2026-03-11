// src/db/schema/webhooks.ts
import { pgTable, serial, jsonb, timestamp, text, integer } from "drizzle-orm/pg-core"

export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type"),        // CLUE, SLAYER, COLLECTION
  playerName: text("player_name"),
  accountType: text("account_type"),    // IRONMAN etc
  world: integer("world"),
  extra: jsonb("extra"),                // varies per event type
  imageUrl: text("image_url"),
  payload: jsonb("payload"),            // full raw payload as backup
  receivedAt: timestamp("received_at").defaultNow(),
})