import { emitReport } from "./reporter";
import { retrieveMemory } from "./memory-engine";
import { assembleContext } from "./context-hub";
import { ProviderRouter } from "./provider-router";
import { decideAndConsolidate } from "./hipocampo";

export interface CognitiveEngineResponse {
  reply: string;
}

/**
 * Cognitive Engine: orchestrates cognition only.
 * - Never persists data directly (delegates to Hipocampo, which delegates to
 *   the Memory Engine).
 * - Never calls a provider directly (delegates to the Provider Router).
 * - Never accesses a database (no ORM or database client import in this file).
 * Enforced by `scripts/architecture-check.mjs`, not just by convention.
 */
export async function runCognitiveEngine(message: string): Promise<CognitiveEngineResponse> {
  emitReport({ name: "cognitive_engine.started" });

  emitReport({ name: "memory.retrieval.started" });
  const memories = await retrieveMemory(message);
  emitReport({
    name: "memory.retrieval.completed",
    evidence: { memoriesUsed: memories.length },
  });

  emitReport({ name: "context_hub.assembly.started" });
  const context = await assembleContext(memories, message);
  emitReport({ name: "context_hub.assembly.completed" });

  emitReport({ name: "provider_router.execution.started" });
  const providerRouter = new ProviderRouter();
  const aiReply = await providerRouter.execute({ message, context });
  emitReport({ name: "provider_router.execution.completed" });

  const response: CognitiveEngineResponse = { reply: aiReply };

  emitReport({ name: "hipocampo.consolidation.started" });
  const decision = await decideAndConsolidate(
    {
      tipo: "interaction",
      contexto: "jarvis_mode",
      titulo: "Chat interaction",
      empresa_id: 1,
      conteudo: {
        user_message: message,
        assistant_response: response.reply,
        memories_used: memories.length,
      },
    },
    memories,
  );
  emitReport({ name: "hipocampo.consolidation.completed", evidence: { decision } });

  return response;
}
