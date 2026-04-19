import { useState, useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { SystemLayout } from "@/components/layout";
import { 
  useGetConversation, 
  useGetMessages, 
  useSendMessage,
  getGetMessagesQueryKey,
  getGetConversationQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Send, Terminal, Loader2 } from "lucide-react";

export default function Chat() {
  const [, params] = useRoute("/chat/:id");
  const id = params?.id || "";
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading: convLoading } = useGetConversation(id, {
    query: { enabled: !!id, queryKey: getGetConversationQueryKey(id) }
  });

  const { data: messages, isLoading: msgsLoading } = useGetMessages(id, {
    query: { enabled: !!id, queryKey: getGetMessagesQueryKey(id) }
  });

  const sendMutation = useSendMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(id) });
      }
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMutation.isPending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMutation.isPending) return;
    
    sendMutation.mutate({ 
      data: { 
        conversationId: id, 
        content: input, 
        role: "user" 
      } 
    });
    setInput("");
  };

  return (
    <SystemLayout>
      <div className="flex flex-col h-full overflow-hidden flex-1">
        {/* Chat Header */}
        <div className="h-14 border-b border-[#c8f8ff]/20 bg-[#010204]/80 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#c8f8ff]/50 hover:text-[#c8f8ff] transition-colors p-1 hover:bg-[#c8f8ff]/10 rounded-sm">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="h-4 w-px bg-[#c8f8ff]/20" />
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#c8f8ff]" />
              <span className="font-display font-bold text-white tracking-widest uppercase text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md">
                {convLoading ? "LOADING..." : conversation?.title}
              </span>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs font-mono tracking-widest text-[#c8f8ff]/40">
            ID: {id.split('-')[0]}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth" ref={scrollRef}>
          {msgsLoading ? (
            <div className="flex h-full items-center justify-center text-[#c8f8ff]/50 space-x-2 font-display tracking-widest text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>DECRYPTING LOGS...</span>
            </div>
          ) : messages?.length === 0 ? (
            <div className="flex h-full items-center justify-center flex-col space-y-4 opacity-30">
              <Terminal className="w-12 h-12 text-[#c8f8ff]" />
              <p className="text-[#c8f8ff] font-display tracking-widest uppercase text-sm">Session initialized. Awaiting input.</p>
            </div>
          ) : (
            messages?.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-sm border font-sans text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-[#c8f8ff]/10 border-[#c8f8ff]/30 text-white rounded-tr-none' 
                      : 'bg-[#020408] border-[#c8f8ff]/10 text-[#e2e8f0] rounded-tl-none shadow-[inset_2px_0_0_#c8f8ff]'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2 opacity-50 text-[9px] sm:text-[10px] tracking-widest uppercase font-mono">
                    <span className="text-[#c8f8ff]">{msg.role === 'user' ? 'OPERATOR' : 'SYSTEM'}</span>
                    <span>//</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="whitespace-pre-wrap word-break-words">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          
          {sendMutation.isPending && (
            <div className="flex w-full justify-start">
              <div className="max-w-[85%] sm:max-w-[70%] p-4 rounded-sm border border-[#c8f8ff]/10 bg-[#020408] rounded-tl-none shadow-[inset_2px_0_0_#c8f8ff]">
                <div className="flex items-center gap-2 opacity-50 text-[10px] tracking-widest uppercase font-mono mb-2">
                  <span className="text-[#c8f8ff]">SYSTEM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-4 bg-[#c8f8ff] animate-pulse"></div>
                  <span className="text-xs text-[#c8f8ff]/70 font-mono tracking-widest">PROCESSING...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#010204] border-t border-[#c8f8ff]/20 shrink-0">
          <form 
            onSubmit={handleSend}
            className="flex items-center gap-2 sm:gap-4 max-w-5xl mx-auto system-card p-2 pr-2 sm:pr-4 rounded-sm"
          >
            <div className="px-2 sm:px-3 text-[#c8f8ff]/50 font-mono text-sm border-r border-[#c8f8ff]/20 shrink-0">
              {'>'}
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER COMMAND..."
              className="flex-1 bg-transparent border-none text-white font-sans focus:outline-none focus:ring-0 placeholder:text-[#c8f8ff]/20 text-sm w-full min-w-0"
              disabled={sendMutation.isPending}
            />
            <button 
              type="submit"
              disabled={!input.trim() || sendMutation.isPending}
              className="hologram-btn w-10 h-10 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </SystemLayout>
  );
}