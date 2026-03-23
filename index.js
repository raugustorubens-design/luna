import express from "express";

const app = express();

app.get("/", (req, res) => {
  console.log("bateu na rota /");
  res.send("ok");
});

const PORT = process.env.PORT || 3000;

// 🔥 AQUI É A ÚNICA MUDANÇA
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 rodando na porta " + PORT);
});
