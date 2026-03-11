// src/db/schema/webhooks.ts
import { pgTable, serial, jsonb, timestamp, text } from "drizzle-orm/pg-core"

export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  source: text("source"),
  payload: jsonb("payload"),
  imageUrl: text("image_url"),
  receivedAt: timestamp("received_at").defaultNow(),
})