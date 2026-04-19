export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 message-enter">
      <div className="rounded-2xl rounded-bl-sm bg-[#11182A]/80 border border-[#4F74FF]/30 px-4 py-3 backdrop-blur-md shadow-[0_0_20px_rgba(79,116,255,0.12)]">
        <div className="flex gap-1.5 items-center">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
