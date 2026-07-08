import { emitAudit } from "./audit";
import { retrieveMemory, storeMemory } from "./memory";
import { buildContext } from "./context";
import { ProviderRouter } from "./provider";

export async function runLunaPipeline(message: string) {
  emitAudit({ name: "luna.pipeline.started" });

  emitAudit({ name: "luna.memory.retrieval.started" });
  const memories = await retrieveMemory(message);
  emitAudit({
    name: "luna.memory.retrieval.completed",
    evidence: { memoriesUsed: memories.length },
  });

  emitAudit({ name: "luna.context.build.started" });
  const context = buildContext(memories, message);
  emitAudit({ name: "luna.context.build.completed" });

  emitAudit({ name: "luna.provider.execution.started" });
  const providerRouter = new ProviderRouter();
  const aiReply = await providerRouter.execute({
    message,
    context,
  });
  emitAudit({ name: "luna.provider.execution.completed" });

  const response = {
    reply: aiReply,
  };

  emitAudit({ name: "luna.memory.persistence.started" });
  await storeMemory({
    tipo: "interaction",
    contexto: "jarvis_mode",
    titulo: "Chat interaction",
    empresa_id: 1,
    conteudo: {
      user_message: message,
      assistant_response: response.reply,
      memories_used: memories.length,
    },
  });
  emitAudit({ name: "luna.memory.persistence.completed" });

  return response;
}
