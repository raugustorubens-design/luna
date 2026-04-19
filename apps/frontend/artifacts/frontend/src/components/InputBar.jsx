export default function InputBar({ value, onChange, onSubmit, disabled }) {
  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-4xl">
      <div className="flex items-center gap-3 rounded-2xl border border-[#4B62C9]/35 bg-[#0A0D1A]/55 px-3 py-3 backdrop-blur-xl shadow-[0_0_24px_rgba(66,109,255,0.18)] transition focus-within:border-[#72A8FF]/70 focus-within:shadow-[0_0_30px_rgba(114,168,255,0.35)]">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Send a thought to LUNA..."
          disabled={disabled}
          className="w-full bg-transparent px-2 py-2 text-[#E6EEFF] placeholder:text-[#8A93B8]/80 outline-none"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="rounded-xl border border-[#86A3FF]/60 px-4 py-2 text-sm font-semibold tracking-wide text-[#DCE8FF] transition enabled:hover:shadow-[0_0_18px_rgba(134,163,255,0.5)] enabled:hover:bg-[#1A2552]/70 disabled:opacity-45 disabled:cursor-not-allowed"
        >
          SEND
        </button>
      </div>
    </form>
  );
}
