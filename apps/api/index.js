import express from "express";

const app = express();

// 🔥 ESSENCIAL: permitir JSON no body
app.use(express.json());

// rota simples (mantém)
app.get("/", (req, res) => {
console.log("REQ / recebida");
res.send("OK FUNCIONANDO");
});

// 🧠 NOVA ROTA LUNA (POST /chat)
app.post("/chat", async (req, res) => {
try {
const { message } = req.body;

```
console.log("REQ /chat:", message);

if (!message) {
  return res.status(400).json({ error: "Mensagem obrigatória" });
}

let reply = "Não entendi, pode reformular?";

// lógica inicial (simples, depois evoluímos)
if (message.toLowerCase().includes("teste")) {
  reply = "Perfeito. A LUNA está funcionando 🚀";
}

if (message.toLowerCase().includes("fluxo")) {
  reply = "Vamos criar seu fluxo inicial. Clique em 'Novo Fluxo'.";
}

if (message.toLowerCase().includes("ajuda")) {
  reply = "Posso te guiar passo a passo dentro do sistema. O que você quer fazer?";
}

// 👉 retorno em JSON (isso ativa a IA no frontend)
return res.json({
  reply,
  actions: [] // depois vamos usar pro brilho azul
});
```

} catch (err) {
console.error(err);
return res.status(500).json({ error: "Erro interno" });
}
});

// start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
console.log("🚀 SERVER OK NA PORTA", PORT);
});
