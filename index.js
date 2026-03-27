import express from "express";
import pkg from "pg";
import OpenAI from "openai";
import cors from "cors";

const { Pool } = pkg;

const app = express();

// ==========================
// CONFIG BASE
// ==========================

app.use(cors());
app.use(express.json());

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

// ==========================
// ROOT
// ==========================

app.get("/", (req, res) => {
  res.send("🚀 Luna API online");
});

// ==========================
// BANCO (POSTGRES)
// ==========================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ==========================
// OPENAI
// ==========================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==========================
// CRIAR TABELA
// ==========================

async function criarTabelaSeNaoExistir() {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS memoria_eventos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        conteudo TEXT,
        tipo TEXT,
        criado_em TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Tabela memoria_eventos pronta");
  } catch (err) {
    console.error("Erro ao criar tabela:", err);
  }
}

// ==========================
// ROTA /chat
// ==========================

app.post("/chat", async (req, res) => {
  try {
    console.log("📩 REQUEST:", req.body);

    const message = req.body.message || req.body.mensagem;
    const contexto = req.body.contexto || "sem contexto";
    const user_id = req.body.user_id || "default";

    if (!message) {
      return res.status(400).json({ erro: "message é obrigatório" });
    }

    // ==========================
    // DETECTAR MEMÓRIA
    // ==========================

    let tipo = null;

    if (message.toLowerCase().includes("erro")) {
      tipo = "erro";
    }

    let memoriaSalva = false;

    if (tipo) {
      await pool.query(
        `INSERT INTO memoria_eventos (user_id, conteudo, tipo)
         VALUES ($1, $2, $3)`,
        [user_id, message, tipo]
      );

      memoriaSalva = true;
      console.log("💾 Memória salva no banco");
    }

    // ==========================
    // BUSCAR MEMÓRIA
    // ==========================

    const resultado = await pool.query(
      `SELECT conteudo, tipo, criado_em
       FROM memoria_eventos
       WHERE user_id = $1
       ORDER BY criado_em DESC
       LIMIT 5`,
      [user_id]
    );

    const memorias = resultado.rows;

    // ==========================
    // RESPOSTA
    // ==========================

    const resposta = `
🧠 Contexto: ${contexto}

💬 Você disse: "${message}"

${memoriaSalva ? "💾 Salvei isso na memória." : ""}

📚 Últimas memórias:
${memorias.map(m => `- (${m.tipo}) ${m.conteudo}`).join("\n") || "Nenhuma"}
`;

    res.json({
      reply: resposta
    });

  } catch (error) {
    console.error("🔥 ERRO:", error);

    res.status(500).json({
      erro: error.message
    });
  }
});

// ==========================
// ROTA /memoria-eventos (NOVA)
// ==========================

app.get("/memoria-eventos", async (req, res) => {
  try {
    const user_id = req.query.user_id || "default";

    const resultado = await pool.query(
      `SELECT conteudo, tipo, criado_em
       FROM memoria_eventos
       WHERE user_id = $1
       ORDER BY criado_em DESC
       LIMIT 20`,
      [user_id]
    );

    res.json({
      memoria: resultado.rows
    });

  } catch (error) {
    console.error("🔥 ERRO AO BUSCAR MEMÓRIA:", error);

    res.status(500).json({
      erro: error.message
    });
  }
});

// ==========================
// START
// ==========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log("🚀 Luna rodando na porta " + PORT);
  await criarTabelaSeNaoExistir();
});
