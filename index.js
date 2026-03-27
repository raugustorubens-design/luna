import express from "express";
import pkg from "pg";
import OpenAI from "openai";
import cors from "cors";

const { Pool } = pkg;

const app = express();

// ✅ CORS
app.use(cors());

// ✅ JSON
app.use(express.json());

// ✅ LOG GLOBAL
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("API Luna online 🚀");
});

// ✅ BANCO
function getPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

const pool = getPool();

// ✅ OPENAI (preparado, ainda não usado)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ ROTA /chat (VERSÃO INTELIGENTE)
app.post("/chat", async (req, res) => {
  try {
    console.log("📩 bateu no /chat");
    console.log("BODY:", req.body);

    // 🔥 aceita ambos formatos (antigo + novo)
    const message = req.body.message || req.body.mensagem;
    const contexto = req.body.contexto || "sem contexto";
    const user_id = req.body.user_id || "default";

    if (!message) {
      return res.status(400).json({ erro: "message é obrigatório" });
    }

    // 🔌 TESTE BANCO
    console.log("🔌 testando banco...");
    await pool.query("SELECT 1");
    console.log("✅ banco ok");

    // 🧠 DETECTAR MEMÓRIA IMPORTANTE
    let tipo = null;

    if (message.toLowerCase().includes("erro")) {
      tipo = "erro";
    } else if (message.toLowerCase().includes("lembra")) {
      tipo = "memoria";
    }

    let memoria = null;

    if (tipo) {
      memoria = {
        tipo,
        conteudo: message,
        user_id,
        data: new Date()
      };

      console.log("💾 Memória detectada:", memoria);

      // (futuro: salvar no Supabase aqui)
    }

    // 🧠 PROMPT INTELIGENTE
    const prompt = `
Contexto atual:
${contexto}

Mensagem do usuário:
${message}

Memória detectada:
${memoria ? JSON.stringify(memoria) : "nenhuma"}
`;

    console.log("🧠 PROMPT:", prompt);

    // 🔥 RESPOSTA (simulada inteligente)
    const resposta = `
🧠 Contexto: ${contexto}

💬 Você disse: "${message}"

${memoria ? "💾 Isso foi salvo como algo importante." : ""}
`;

    return res.json({
      reply: resposta
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
  console.log("🚀 Luna rodando na porta " + PORT);
});
