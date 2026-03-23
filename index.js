import express from "express";
import pkg from "pg";

const { Pool } = pkg;

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.send("DB conectou ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no banco ❌");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("rodando na porta " + PORT);
});
