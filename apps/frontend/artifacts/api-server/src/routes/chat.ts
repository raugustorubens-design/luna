import { runCognitiveEngine } from "../luna/cognitive-engine";
import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, conversationsTable, messagesTable } from "@workspace/db";

import {
  SendMessageBody,
  SendMessageResponse,
  GetConversationsResponse,
  CreateConversationBody,
  GetConversationResponse,
  GetConversationParams,
  DeleteConversationParams,
  GetMessagesParams,
  GetMessagesResponse,
  GetStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ================= CHAT =================
router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendMessageBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { content, conversationId } = parsed.data;

  let convId: string;

  // ================= CONVERSA =================
  if (conversationId) {
    convId = conversationId;
  } else {
    try {
      const [createdConv] = await db
        .insert(conversationsTable)
        .values({
          title: content.slice(0, 60),
        })
        .returning();

      console.log("CONVERSATION CREATED:", createdConv);

      convId = createdConv.id;
    } catch (err: any) {
      console.error("========== POSTGRES ERROR ==========");
      console.error(err);
      console.error("MESSAGE:", err?.message);
      console.error("DETAIL:", err?.detail);
      console.error("CODE:", err?.code);
      console.error("STACK:", err?.stack);

      res.status(500).json({
        error: err?.message,
        detail: err?.detail,
        code: err?.code,
        stack: err?.stack,
      });

      return;
    }
  }

  // ================= SALVA USER =================
  try {

    await db.execute(sql`
    INSERT INTO messages (
      conversation_id,
      topic,
      role,
      extension,
      content
    )
    VALUES (
      ${convId},
      ${"luna_chat"},
      ${"user"},
      ${"text"},
      ${content}
    )
  `);

    console.log("USER MESSAGE SAVED");

  } catch (err: any) {

    console.error("========== MESSAGE INSERT ERROR ==========");

    console.error(err);

    console.error("MESSAGE:", err?.message);

    console.error("DETAIL:", err?.detail);

    console.error("CODE:", err?.code);

    console.error("STACK:", err?.stack);

    res.status(500).json({
      error: err?.message,
      detail: err?.detail,
      code: err?.code,
      stack: err?.stack,
    });

    return;
  }

  // ================= LUNA CORE =================
  const lunaResponse = await runCognitiveEngine(content);

  const aiReply = lunaResponse.reply;

  // ================= SALVA RESPOSTA =================
  const [assistantMsg] = await db
    .insert(messagesTable)
    .values({
      conversationId: convId,

      topic: "luna_chat",

      role: "assistant",

      extension: "text",

      content: aiReply,

      payload: {} as any,

      private: false,
    })
    .returning();

  // ================= RESPONSE =================
  res.json(
    SendMessageResponse.parse({
      id: String(assistantMsg.id),
      conversationId: String(assistantMsg.conversationId),
      role: assistantMsg.role,
      content: assistantMsg.content,
      createdAt: assistantMsg.createdAt,
    })
  );
});

// ================= LISTAR CONVERSAS =================
router.get("/conversations", async (_req, res): Promise<void> => {
  const conversations = await db
    .select({
      id: conversationsTable.id,
      title: conversationsTable.title,
      createdAt: conversationsTable.createdAt,
      updatedAt: conversationsTable.updatedAt,
      messageCount: count(messagesTable.id),
    })
    .from(conversationsTable)
    .leftJoin(
      messagesTable,
      eq(messagesTable.conversationId, conversationsTable.id)
    )
    .groupBy(conversationsTable.id)
    .orderBy(sql`${conversationsTable.updatedAt} desc`);

  res.json(
    GetConversationsResponse.parse(
      conversations.map((c: { id: unknown }) => ({
        ...c,
        id: String(c.id),
      }))
    )
  );
});

// ================= CRIAR CONVERSA =================
router.post("/conversations", async (req, res): Promise<void> => {
  const parsed = CreateConversationBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [conv] = await db
    .insert(conversationsTable)
    .values({
      title: parsed.data.title,
    })
    .returning();

  res.status(201).json(
    GetConversationResponse.parse({
      id: String(conv.id),
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: 0,
    })
  );
});

// ================= BUSCAR CONVERSA =================
router.get("/conversations/:id", async (req, res): Promise<void> => {
  const params = GetConversationParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const id = params.data.id;

  const [conv] = await db
    .select({
      id: conversationsTable.id,
      title: conversationsTable.title,
      createdAt: conversationsTable.createdAt,
      updatedAt: conversationsTable.updatedAt,
      messageCount: count(messagesTable.id),
    })
    .from(conversationsTable)
    .leftJoin(
      messagesTable,
      eq(messagesTable.conversationId, conversationsTable.id)
    )
    .where(eq(conversationsTable.id, id))
    .groupBy(conversationsTable.id);

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.json(
    GetConversationResponse.parse({
      ...conv,
      id: String(conv.id),
    })
  );
});

// ================= DELETAR CONVERSA =================
router.delete("/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteConversationParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const id = params.data.id;

  const [deleted] = await db
    .delete(conversationsTable)
    .where(eq(conversationsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.sendStatus(204);
});

// ================= MENSAGENS =================
router.get("/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = GetMessagesParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const id = params.data.id;

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(messagesTable.createdAt);

  res.json(
    GetMessagesResponse.parse(
      messages.map((m: { id: unknown; conversationId: unknown }) => ({
        ...m,
        id: String(m.id),
        conversationId: String(m.conversationId),
      }))
    )
  );
});

// ================= STATS =================
router.get("/stats", async (_req, res): Promise<void> => {
  const [convCount] = await db
    .select({ value: count() })
    .from(conversationsTable);

  const [msgCount] = await db
    .select({ value: count() })
    .from(messagesTable);

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const [activeToday] = await db
    .select({ value: count() })
    .from(conversationsTable)
    .where(sql`${conversationsTable.updatedAt} >= ${today}`);

  res.json(
    GetStatsResponse.parse({
      totalConversations: convCount.value,
      totalMessages: msgCount.value,
      activeToday: activeToday.value,
    })
  );
});

export default router;