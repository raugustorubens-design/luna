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

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { content, conversationId } = parsed.data;

  let convId: number;
  if (conversationId) {
    convId = parseInt(conversationId, 10);
  } else {
    const [conv] = await db
      .insert(conversationsTable)
      .values({ title: content.slice(0, 60) })
      .returning();
    convId = conv.id;
  }

  await db.insert(messagesTable).values({
    conversationId: convId,
    role: "user",
    content,
  });

  const aiReply = `Resposta da IA para: "${content}". Este é um sistema de IA especializado operando no nível máximo.`;

  const [assistantMsg] = await db
    .insert(messagesTable)
    .values({
      conversationId: convId,
      role: "assistant",
      content: aiReply,
    })
    .returning();

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
    .leftJoin(messagesTable, eq(messagesTable.conversationId, conversationsTable.id))
    .groupBy(conversationsTable.id)
    .orderBy(sql`${conversationsTable.updatedAt} desc`);

  res.json(
    GetConversationsResponse.parse(
      conversations.map((c) => ({
        ...c,
        id: String(c.id),
      }))
    )
  );
});

router.post("/conversations", async (req, res): Promise<void> => {
  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [conv] = await db
    .insert(conversationsTable)
    .values({ title: parsed.data.title })
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

router.get("/conversations/:id", async (req, res): Promise<void> => {
  const params = GetConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const numId = parseInt(params.data.id, 10);
  const [conv] = await db
    .select({
      id: conversationsTable.id,
      title: conversationsTable.title,
      createdAt: conversationsTable.createdAt,
      updatedAt: conversationsTable.updatedAt,
      messageCount: count(messagesTable.id),
    })
    .from(conversationsTable)
    .leftJoin(messagesTable, eq(messagesTable.conversationId, conversationsTable.id))
    .where(eq(conversationsTable.id, numId))
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

router.delete("/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const numId = parseInt(params.data.id, 10);
  const [deleted] = await db
    .delete(conversationsTable)
    .where(eq(conversationsTable.id, numId))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = GetMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const numId = parseInt(params.data.id, 10);
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, numId))
    .orderBy(messagesTable.createdAt);

  res.json(
    GetMessagesResponse.parse(
      messages.map((m) => ({
        ...m,
        id: String(m.id),
        conversationId: String(m.conversationId),
      }))
    )
  );
});

router.get("/stats", async (_req, res): Promise<void> => {
  const [convCount] = await db.select({ value: count() }).from(conversationsTable);
  const [msgCount] = await db.select({ value: count() }).from(messagesTable);

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
