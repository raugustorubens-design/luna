import express from "express";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post("/chat", async (req, res) => {
  const { user_id, mensagem } = req.body;

  const estadoRes = await pool.query(
    "SELECT estado FROM memoria_estado WHERE user_id = $1",
    [user_id]
  );

  let estado = estadoRes.rows[0]?.estado || {};

  if (mensagem.toLowerCase().includes("chkp")) {
    const novoEstado = {
      ...estado,
      tipo: "preferencia_usuario",
      modo: "algoritimo",
      resumo: mensagem,
      atualizado_em: new Date(),
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

  const resposta = "🚀 API funcionando";

  await pool.query(
    `INSERT INTO memoria_luna (user_id, role, content)
     VALUES ($1, 'user', $2), ($1, 'assistant', $3)`,
    [user_id, mensagem, resposta]
  );

  res.json({ resposta });
});

app.listen(3000, () => console.log("🚀 API rodando"));
