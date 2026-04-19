import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import Message from "./Message";
import InputBar from "./InputBar";
import TypingIndicator from "./TypingIndicator";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://strong-celebration-production.up.railway.app";

export default function Chat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "TESTE LUNA 🔥 EU SOU O ARQUIVO CERTO",
      animate: false,
    },
  ]);

  const scrollAnchorRef = useRef(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const contextPayload = useMemo(
    () =>
      messages.slice(-8).map((message) => ({
        role: message.role,
        content: message.content,
      })),
    [messages],
  );

  const revealAssistantMessage = useCallback((text) => {
    const id = crypto.randomUUID();

    setMessages((prev) => [...prev, { id, role: "assistant", content: "", animate: true }]);

    let charIndex = 0;
    const timer = setInterval(() => {
      charIndex += 1;
      const next = text.slice(0, charIndex);

      setMessages((prev) =>
        prev.map((message) => (message.id === id ? { ...message, content: next, animate: true } : message)),
      );

      if (charIndex >= text.length) {
        clearInterval(timer);
        setMessages((prev) =>
          prev.map((message) => (message.id === id ? { ...message, content: text, animate: false } : message)),
        );
        setLoading(false);
      }
    }, 14);
  }, []);

  const sendMessage = useCallback(
    async (event) => {
      event.preventDefault();
      const text = input.trim();
      if (!text || loading) return;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
          animate: false,
        },
      ]);

      setInput("");
      setLoading(true);

      try {
        const response = await fetch(`${BACKEND_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: "user_1",
            mensagem: text,
            contexto: contextPayload,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const reply = typeof data?.reply === "string" ? data.reply : JSON.stringify(data.reply, null, 2);
      } catch {
        revealAssistantMessage("Connection unstable. I could not reach my core right now.");
      }
    },
    [contextPayload, input, loading, revealAssistantMessage],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070D] text-white">
      <div className="aura-layer" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex h-screen w-full max-w-5xl flex-col px-4 md:px-6">
        <Header />

        <section className="flex-1 overflow-y-auto pb-42 md:pb-36 pr-1">
          <div className="space-y-4 pb-8">
            {messages.map((message) => (
              <Message
                key={message.id}
                role={message.role}
                content={message.content}
                animate={message.animate}
              />
            ))}
            {loading && <TypingIndicator />}
            <div ref={scrollAnchorRef} />
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#27376F]/30 bg-gradient-to-t from-[#05070D] via-[#05070D]/95 to-transparent px-4 pb-6 pt-4 md:px-8">
          <InputBar value={input} onChange={setInput} onSubmit={sendMessage} disabled={loading} />
        </div>
      </div>
    </main>
  );
}
