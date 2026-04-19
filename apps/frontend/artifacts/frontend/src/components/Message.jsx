import { useEffect, useState } from "react";

export default function Message({ role, content, animate = false }) {
  const [displayed, setDisplayed] = useState(animate ? "" : content);

  useEffect(() => {
    if (!animate) {
      setDisplayed(content);
      return;
    }

    setDisplayed("");
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayed(content.slice(0, index));
      if (index >= content.length) {
        clearInterval(interval);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [content, animate]);

  const isUser = role === "user";

  return (
    <div className={`flex message-enter ${isUser ? "justify-end" : "justify-start"}`}>
      <article
        className={`max-w-[84%] md:max-w-[68%] rounded-2xl px-4 py-3 md:px-5 md:py-4 leading-relaxed border backdrop-blur-md whitespace-pre-wrap ${
          isUser
            ? "rounded-br-sm border-[#53A0FF]/35 bg-[#0E223D]/70 text-[#D7E9FF] shadow-[0_0_24px_rgba(83,160,255,0.16)]"
            : "rounded-bl-sm border-[#8C6CFF]/30 bg-[#131525]/78 text-[#E6E8FF] shadow-[0_0_24px_rgba(140,108,255,0.15)]"
        }`}
      >
        {displayed}
      </article>
    </div>
  );
}
