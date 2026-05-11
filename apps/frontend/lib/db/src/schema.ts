import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// ================= CONVERSATIONS =================
export const conversationsTable = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: text("title"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

// ================= MESSAGES =================
export const messagesTable = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  conversationId: uuid("conversation_id").notNull(),

  topic: text("topic").notNull(),

  role: text("role").notNull(),

  extension: text("extension").notNull(),

  content: text("content").notNull(),

  payload: jsonb("payload"),

  event: text("event"),

  private: boolean("private").default(false),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),

  insertedAt: timestamp("inserted_at").defaultNow(),
});