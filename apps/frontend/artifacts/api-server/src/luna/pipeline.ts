// src/luna/pipeline.ts

import { retrieveMemory, storeMemory } from "./memory";
import { buildContext } from "./context";
import { ProviderRouter } from "./provider";

export async function runLunaPipeline(message: string) {
  console.log("[LUNA] PIPELINE START");

  // 1. Recupera memória
  console.log("[LUNA] MEMORY RETRIEVAL");
  const memories = await retrieveMemory(message);

  // 2. Monta contexto
  console.log("[LUNA] CONTEXT BUILD");
  const context = buildContext(memories, message);

  // 3. Execução real via provider
  console.log("[LUNA] PROVIDER EXECUTION");
  const providerRouter = new ProviderRouter();
  const aiReply = await providerRouter.execute({
    message,
    context,
  });

  const response = {
    reply: aiReply,
  };

  // 4. Salva memória
  console.log("[LUNA] MEMORY PERSISTENCE");
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

  return response;
}
