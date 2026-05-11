import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getSession, updateSession } from "./runtime/sessionManager.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    runtime: "LUNA",
    version: "3.2",
    environment: "clean"
  });
});

/*
|--------------------------------------------------------------------------
| CHAT RUNTIME
|--------------------------------------------------------------------------
*/

app.post("/chat", (req, res) => {
  const {
    session_id,
    message,
    current_page
  } = req.body;

  // validação mínima
  if (!session_id || !message) {
    return res.status(400).json({
      success: false,
      error: "session_id and message are required"
    });
  }

  // recuperar sessão
  const session = getSession(session_id);

  // adicionar mensagem ao histórico
  session.recent_messages.push({
    role: "user",
    content: message,
    timestamp: Date.now()
  });

  // limitar janela curta
  if (session.recent_messages.length > 10) {
    session.recent_messages.shift();
  }

  // atualizar contexto operacional
  session.current_page = current_page || session.current_page;

  // atualizar timestamp
  session.updated_at = Date.now();

  // persistir runtime state
  updateSession(session_id, session);

  console.log("[SESSION STATE]", {
    session_id: session.session_id,
    current_page: session.current_page,
    messages: session.recent_messages.length
  });

  // resposta
  res.json({
    success: true,

    reply: `LUNA recebeu: ${message}`,

    session_state: {
      session_id: session.session_id,
      current_page: session.current_page,
      message_count: session.recent_messages.length
    },

    metadata: {
      runtime: "operational-cognitive-runtime",
      version: "3.2"
    }
  });
});

/*
|--------------------------------------------------------------------------
| SERVER START
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 LUNA Runtime active on port ${PORT}`);
});