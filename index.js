import express from "express";

const app = express();

app.get("/", (req, res) => {
  console.log("bateu na rota /");
  res.send("ok");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 rodando na porta " + PORT);
});
