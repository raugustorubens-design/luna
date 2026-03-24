import express from "express";
import pkg from "pg";
import OpenAI from "openai";
import cors from "cors";

const { Pool } = pkg;

const app = express();

// ✅ CORS (ESSENCIAL)
app.use(cors());

// ✅ JSON
app.use(express.json());

// ✅ LOG DE ERROS GLOBAIS
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

// ✅ ROTA ROOT
app.get("/", (req, res) => {
  res.send("API online 🚀");
});

// ✅ CONEXÃO BANCO
function getPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

// ✅ POOL
const pool = getPool();

// ✅ OPENAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ ROTA /chat (DEBUG)
app.post("/chat", async (req, res) => {
  try {
    console.log("📩 bateu no /chat");
    console.log("BODY:", req.body);

    const { user_id, mensagem } = req.body;

    if (!user_id || !mensagem) {
      console.log("❌ faltando dados");
      return res.status(400).json({ erro: "user_id e mensagem são obrigatórios" });
    }

    // 🔌 TESTE BANCO
    console.log("🔌 testando banco...");
    const teste = await pool.query("SELECT 1");
    console.log("✅ banco ok");

    return res.json({
      resposta: "Tudo funcionando 🔥",
      recebido: mensagem
    });

  } catch (error) {
    console.error("🔥 ERRO REAL:", error);
    return res.status(500).json({
      erro: error.message
    });
  }
});

// ✅ PORTA (RAILWAY)
const PORT = process.env.PORT || 3000;

console.log("PORT ENV:", PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 rodando na porta " + PORT);
});
