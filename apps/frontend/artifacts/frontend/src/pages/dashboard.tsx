import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { SystemLayout } from "@/components/layout";
import {
  useGetConversations,
  useCreateConversation,
  useDeleteConversation,
  getGetConversationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, MessageSquare, Plus, Network, Cpu, Server, Trash2, AlertTriangle, Clock, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const RAILWAY_BASE = "https://strong-celebration-production.up.railway.app";

interface PorTipo {
  tipo: string;
  total: number;
}

interface Recente {
  conteudo: string;
  tipo: string;
  criado_em: string;
}

interface DashboardData {
  total_memorias: number;
  por_tipo: PorTipo[];
  recentes: Recente[];
}

function useRailwayDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${RAILWAY_BASE}/dashboard`)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((json) => {
        setData(json.data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: railwayData, loading: railwayLoading, error: railwayError } = useRailwayDashboard();

  const { data: conversations, isLoading: convLoading } = useGetConversations({
    query: { queryKey: getGetConversationsQueryKey() },
  });

  const createMutation = useCreateConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        setIsDialogOpen(false);
        setLocation(`/chat/${data.id}`);
      },
    },
  });

  const deleteMutation = useDeleteConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
      },
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMutation.mutate({ data: { title: newTitle } });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Execute purge protocol for this thread?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <SystemLayout>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="container mx-auto max-w-6xl flex flex-col gap-10">

          {/* Header */}
          <div className="flex items-end justify-between border-b border-[#c8f8ff]/20 pb-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-widest mb-2">SYSTEM_DASHBOARD</h1>
              <p className="text-[#c8f8ff]/70 font-sans text-sm tracking-wider uppercase">Operating parameters optimal. Awaiting commands.</p>
            </div>
            <div className="flex items-center gap-2 text-[#c8f8ff]">
              <span className="w-2 h-2 rounded-full bg-[#c8f8ff] shadow-[0_0_8px_#c8f8ff]"></span>
              <span className="text-xs font-bold tracking-widest hidden sm:inline">ONLINE</span>
            </div>
          </div>

          {/* Railway Error Banner */}
          {railwayError && (
            <div className="flex items-center gap-3 p-4 border border-red-500/30 bg-red-500/5 rounded-sm text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="font-mono tracking-wider">CONEXÃO COM BACKEND FALHOU: {railwayError}</span>
            </div>
          )}

          {/* Stat Principal — Total de Memórias */}
          <div>
            <h2 className="text-xs text-[#c8f8ff]/60 tracking-widest uppercase mb-4 font-mono">Memória do Sistema</h2>
            <div className="system-card p-8 border border-[#c8f8ff]/30 rounded-sm flex items-center gap-8 shadow-[0_0_30px_rgba(200,248,255,0.05)]">
              <div className="p-5 rounded-sm bg-[#c8f8ff]/10 border border-[#c8f8ff]/30 shadow-[inset_0_0_15px_rgba(200,248,255,0.2)]">
                <Network className="w-8 h-8 text-[#c8f8ff]" />
              </div>
              <div>
                <p className="text-xs text-[#c8f8ff]/70 tracking-widest uppercase mb-2">Total de Memórias</p>
                {railwayLoading ? (
                  <div className="h-10 w-24 bg-[#c8f8ff]/10 animate-pulse rounded-sm" />
                ) : (
                  <p className="text-5xl font-display font-bold text-white tracking-wider glow-text">
                    {railwayData?.total_memorias ?? "—"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Por Tipo + Recentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Por Tipo */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xs text-[#c8f8ff]/60 tracking-widest uppercase font-mono flex items-center gap-2">
                <Tag className="w-3 h-3" /> Por Tipo
              </h2>
              <div className="system-card border border-[#c8f8ff]/20 rounded-sm p-4 flex flex-col gap-2 min-h-[200px]">
                {railwayLoading ? (
                  <div className="flex-1 flex items-center justify-center text-[#c8f8ff]/40 animate-pulse font-mono text-xs tracking-widest">
                    CARREGANDO...
                  </div>
                ) : railwayData?.por_tipo?.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-[#c8f8ff]/30 font-mono text-xs tracking-widest">
                    SEM DADOS
                  </div>
                ) : (
                  railwayData?.por_tipo?.map((item) => (
                    <div
                      key={item.tipo}
                      className="flex items-center justify-between px-4 py-3 border border-[#c8f8ff]/10 hover:border-[#c8f8ff]/30 bg-[#c8f8ff]/[0.02] hover:bg-[#c8f8ff]/[0.05] transition-all rounded-sm"
                      data-testid={`tipo-item-${item.tipo}`}
                    >
                      <span className="text-sm font-mono text-white/80 tracking-wider uppercase">{item.tipo}</span>
                      <span className="text-lg font-display font-bold text-[#c8f8ff] glow-text">{item.total}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recentes */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xs text-[#c8f8ff]/60 tracking-widest uppercase font-mono flex items-center gap-2">
                <Clock className="w-3 h-3" /> Memórias Recentes
              </h2>
              <div className="system-card border border-[#c8f8ff]/20 rounded-sm p-4 flex flex-col gap-2 min-h-[200px] overflow-y-auto max-h-[400px]">
                {railwayLoading ? (
                  <div className="flex-1 flex items-center justify-center text-[#c8f8ff]/40 animate-pulse font-mono text-xs tracking-widest">
                    CARREGANDO...
                  </div>
                ) : railwayData?.recentes?.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-[#c8f8ff]/30 font-mono text-xs tracking-widest">
                    SEM MEMÓRIAS RECENTES
                  </div>
                ) : (
                  railwayData?.recentes?.map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-1 px-4 py-3 border border-[#c8f8ff]/10 hover:border-[#c8f8ff]/30 bg-[#c8f8ff]/[0.02] hover:bg-[#c8f8ff]/[0.05] transition-all rounded-sm"
                      data-testid={`recente-item-${i}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-[#c8f8ff]/60 tracking-widest uppercase border border-[#c8f8ff]/20 px-2 py-0.5 rounded-sm">
                          {item.tipo}
                        </span>
                        <span className="text-[10px] font-mono text-white/30 tracking-wider shrink-0">
                          {item.criado_em ? format(new Date(item.criado_em), "dd/MM/yy HH:mm") : "—"}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 font-sans leading-snug line-clamp-2">{item.conteudo}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sessões Locais */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs text-[#c8f8ff]/60 tracking-widest uppercase font-mono flex items-center gap-2">
                <Activity className="w-3 h-3" /> Sessões Ativas
              </h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className="hologram-btn px-4 py-2 flex items-center gap-2 text-xs" data-testid="button-new-thread">
                    <Plus className="w-4 h-4" /> NEW_THREAD
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#020408] border border-[#c8f8ff]/30 text-white shadow-[0_0_40px_rgba(200,248,255,0.1)] rounded-sm font-sans max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display tracking-widest text-[#c8f8ff] uppercase">Initialize New Thread</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-xs text-[#c8f8ff]/70 tracking-widest uppercase">Designation</label>
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Enter thread designation..."
                        className="bg-[#010204] border-[#c8f8ff]/30 focus-visible:ring-[#c8f8ff]/50 text-white font-sans rounded-sm placeholder:text-gray-600"
                        data-testid="input-thread-title"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="hologram-btn px-6 py-2 text-sm disabled:opacity-50"
                        data-testid="button-submit-thread"
                      >
                        {createMutation.isPending ? "INITIALIZING..." : "EXECUTE"}
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="system-card border border-[#c8f8ff]/20 rounded-sm p-2 min-h-[200px] flex flex-col">
              {convLoading ? (
                <div className="flex-1 flex items-center justify-center text-[#c8f8ff]/50 animate-pulse font-display tracking-widest text-sm">
                  SCANNING...
                </div>
              ) : conversations?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[#c8f8ff]/50 space-y-4">
                  <MessageSquare className="w-12 h-12 opacity-20" />
                  <p className="tracking-widest uppercase text-sm">No active threads found.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                  {conversations?.map((conv) => (
                    <Link
                      key={conv.id}
                      href={`/chat/${conv.id}`}
                      className="block p-4 border border-[#c8f8ff]/10 hover:border-[#c8f8ff]/40 bg-[#c8f8ff]/[0.02] hover:bg-[#c8f8ff]/10 transition-all rounded-sm group"
                      data-testid={`card-conversation-${conv.id}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="font-bold text-white font-sans text-lg tracking-wide group-hover:text-[#c8f8ff] transition-colors truncate">
                          {conv.title}
                        </h3>
                        <span className="text-xs text-[#c8f8ff]/50 tracking-widest font-mono shrink-0">
                          {conv.updatedAt ? format(new Date(conv.updatedAt), "yyyy.MM.dd HH:mm") : "UNKNOWN"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#c8f8ff]/10">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                          Packets: <span className="text-[#c8f8ff]/70 ml-1">{conv.messageCount}</span>
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                          ID: <span className="text-[#c8f8ff]/70 ml-1">{conv.id}</span>
                        </span>
                        <div className="flex-1" />
                        <button
                          onClick={(e) => handleDelete(e, conv.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-500/50 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Purge Thread"
                          data-testid={`button-delete-${conv.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </SystemLayout>
  );
}
