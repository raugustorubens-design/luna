import express from "express";
import pkg from "pg";
import OpenAI from "openai";

const { Pool } = pkg;

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { user_id, mensagem } = req.body;

  // 🧠 1. Buscar estado
  const estadoRes = await pool.query(
    "SELECT estado FROM memoria_estado WHERE user_id = $1",
    [user_id]
  );

  let estado = estadoRes.rows[0]?.estado || {};

  // 🔥 CHECKPOINT
  if (mensagem.toLowerCase().includes("chkp")) {
    const novoEstado = {
      ...estado,
      tipo: "preferencia_usuario",
      modo: "algoritimo",
      atualizado_em: new Date(),
      resumo: mensagem,
    };

    await pool.query(
      `INSERT INTO memoria_estado (user_id, estado)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET estado = $2`,
      [user_id, novoEstado]
    );

    return res.json({ resposta: "✅ Checkpoint salvo." });
  }

  // 🔍 2. Buscar memória por índice
  const indexRes = await pool.query(
    `SELECT memoria_id FROM memoria_index
     WHERE user_id = $1
     ORDER BY relevancia DESC
     LIMIT 5`,
    [user_id]
  );

  let historico = [];

  if (indexRes.rows.length > 0) {
    const ids = indexRes.rows.map(r => `'${r.memoria_id}'`).join(",");

    const memRes = await pool.query(
      `SELECT role, content FROM memoria_luna
       WHERE id IN (${ids})`
    );

    historico = memRes.rows;
  }

  // 🧠 3. Montar contexto
  const mensagens = [
    {
      role: "system",
      content: `
Você é uma IA com memória persistente.

Estado do usuário:
${JSON.stringify(estado)}

Responda direto, claro e útil.
      `,
    },
    ...historico,
    {
      role: "user",
      content: mensagem,
    },
  ];

  // 🤖 4. OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: mensagens,
  });

  const resposta = completion.choices[0].message.content;

  // 💾 5. Salvar memória + índice
  const insertRes = await pool.query(
    `INSERT INTO memoria_luna (user_id, role, content)
     VALUES ($1, 'user', $2)
     RETURNING id`,
    [user_id, mensagem]
  );

  const memoria_id = insertRes.rows[0].id;

  // gerar índice simples
  const palavras = mensagem
    .toLowerCase()
    .split(" ")
    .slice(0, 3);

  for (const palavra of palavras) {
    await pool.query(
      `INSERT INTO memoria_index (user_id, memoria_id, chave, valor)
       VALUES ($1, $2, 'keyword', $3)`,
      [user_id, memoria_id, palavra]
    );
  }

  // salvar resposta
  await pool.query(
    `INSERT INTO memoria_luna (user_id, role, content)
     VALUES ($1, 'assistant', $2)`,
    [user_id, resposta]
  );

  res.json({ resposta });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 rodando na porta " + PORT));
