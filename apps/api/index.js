import express from "express";

const app = express();

// rota simples
app.get("/", (req, res) => {
  console.log("REQ / recebida");
  res.send("OK FUNCIONANDO");
});

// start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER OK NA PORTA", PORT);
});