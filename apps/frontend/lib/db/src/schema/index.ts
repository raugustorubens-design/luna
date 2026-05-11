import {
  pgTable,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ================= CONVERSATIONS =================
export const conversationsTable = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: text("title"),

  createdAt: timestamp("created_at", {
    mode: "date",
  }),

  updatedAt: timestamp("updated_at", {
    mode: "date",
  }),
});

// ================= MESSAGES =================
export const messagesTable = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  conversationId: uuid("conversation_id").notNull(),

  topic: text("topic").notNull(),

  role: text("role").notNull(),

  extension: text("extension").notNull(),

  content: text("content").notNull(),

  createdAt: timestamp("created_at", {
    mode: "date",
  }).defaultNow(),

  payload: text("payload"),

  event: text("event"),

  private: text("private"),

  updatedAt: timestamp("updated_at", {
    mode: "date",
  }).defaultNow(),

  insertedAt: timestamp("inserted_at", {
    mode: "date",
  }).defaultNow(),
});