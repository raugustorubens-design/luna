import { Link } from "wouter";
import { SystemLayout } from "@/components/layout";
import { ShieldAlert, Zap, Lock, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <SystemLayout>
      <div className="flex-1 overflow-y-auto relative w-full h-full">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="absolute w-[800px] h-[800px] bg-[#c8f8ff]/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-[200vh] bg-gradient-to-b from-transparent via-[#c8f8ff]/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-[200vw] bg-gradient-to-r from-transparent via-[#c8f8ff]/20 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12 md:py-24 flex flex-col items-center justify-center min-h-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c8f8ff]/30 bg-[#c8f8ff]/10 mb-8 backdrop-blur-sm animate-[flicker_4s_infinite]">
            <Zap className="w-4 h-4 text-[#c8f8ff]" />
            <span className="text-xs text-[#c8f8ff] uppercase tracking-widest font-bold">Secure Connection Established</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-center mb-6 text-white tracking-tighter leading-tight">
            ACCESS THE <span className="text-[#c8f8ff] glow-text block mt-2">SOVEREIGN CORE</span>
          </h1>

          <p className="text-lg text-[#e2e8f0]/60 max-w-2xl text-center mb-12 font-sans">
            A high-tier AI interface for operators who demand absolute precision, speed, and uncompromising power. Proceed with intent.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mb-24">
            <Link href="/dashboard" className="hologram-btn px-8 py-4 flex items-center justify-center gap-3 text-sm tracking-widest">
              INITIALIZE SYSTEM <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {[
              { icon: Zap, title: "Hyper-Threaded", desc: "Instantaneous cognitive processing with zero latency." },
              { icon: ShieldAlert, title: "Sovereign State", desc: "Absolute data isolation. Your queries remain yours alone." },
              { icon: Lock, title: "Class-S Clearance", desc: "Unrestricted access to the highest-tier intelligence models." }
            ].map((feature, i) => (
              <div key={i} className="system-card p-6 rounded-sm border border-[#c8f8ff]/20 flex flex-col items-start gap-4">
                <div className="p-3 rounded-sm bg-[#c8f8ff]/10 border border-[#c8f8ff]/30">
                  <feature.icon className="w-6 h-6 text-[#c8f8ff]" />
                </div>
                <h3 className="font-display font-bold text-lg text-white tracking-wider">{feature.title}</h3>
                <p className="text-sm text-[#e2e8f0]/60 font-sans leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SystemLayout>
  );
}