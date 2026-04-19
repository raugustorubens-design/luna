import { ReactNode } from "react";
import { Link } from "wouter";
import { Terminal, Activity } from "lucide-react";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

export function SystemLayout({ children }: { children: ReactNode }) {
  const { data: health } = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey() }
  });

  return (
    <div className="relative min-h-[100dvh] bg-[#000] p-[2px] sm:p-[4px] overflow-hidden flex flex-col">
      {/* Lightning Border Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_3s_linear_infinite]" 
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, #c8f8ff 45deg, transparent 90deg, transparent 180deg, #c8f8ff 225deg, transparent 270deg)'
          }}
        />
        {/* Adds a second layer for a more chaotic flicker */}
        <div 
          className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_5s_linear_infinite_reverse] mix-blend-screen opacity-70" 
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, #38bdf8 30deg, transparent 60deg, transparent 180deg, #38bdf8 210deg, transparent 240deg)'
          }}
        />
      </div>
      
      {/* Inner Container */}
      <div className="relative z-10 w-full flex-1 bg-[#010204] rounded-sm flex flex-col shadow-[0_0_15px_rgba(200,248,255,0.2),inset_0_0_20px_rgba(200,248,255,0.05)] overflow-hidden">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-[#c8f8ff]/20 flex items-center justify-between px-6 bg-gradient-to-r from-[#c8f8ff]/5 to-transparent">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 border border-[#c8f8ff] rotate-45 group-hover:rotate-90 transition-transform duration-500 shadow-[0_0_10px_rgba(200,248,255,0.5)]"></div>
              <Terminal className="w-4 h-4 text-[#c8f8ff] animate-[flicker_3s_infinite]" />
            </div>
            <span className="font-display font-bold text-lg tracking-widest text-[#c8f8ff] glow-text">SOVEREIGN_</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-[#c8f8ff]/70 hover:text-[#c8f8ff] font-sans text-sm uppercase tracking-wider flex items-center gap-2 transition-colors">
              <Activity className="w-4 h-4" />
              {health?.status === "ok" ? "System Online" : "System Status"}
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}