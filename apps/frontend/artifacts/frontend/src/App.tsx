import React, { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const sendMessage = async () => {
    if (!message) return;

    try {
      const res = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "user",
            content: message,
          }),
        }
      );

      const data = await res.json();
      setResponse(data.content || JSON.stringify(data));
    } catch (err) {
      console.error(err);
      setResponse("Erro ao conectar com backend");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>LUNA TEST</h1>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite algo..."
        style={{
          padding: 10,
          width: 300,
          marginTop: 20,
          color: "black",
        }}
      />

      <button onClick={sendMessage} style={{ marginTop: 10 }}>
        Enviar
      </button>

      <div style={{ marginTop: 20 }}>
        <strong>Resposta:</strong> {response}
      </div>
    </div>
  );
}