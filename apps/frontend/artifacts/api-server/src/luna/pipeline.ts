// src/luna/pipeline.ts

import { retrieveMemory, storeMemory } from "./memory";
import { buildContext } from "./context";
import { ProviderRouter } from "./provider";

export async function runLunaPipeline(message: string) {

  console.log("LUNA PIPELINE START");

  // 1. Recupera memória
  const memories = await retrieveMemory(message);

  // 2. Monta contexto
  const context = buildContext(memories, message);

  console.log("CONTEXT:", context);

  // 3. Execução real via provider
  const providerRouter = new ProviderRouter();
  const aiReply = await providerRouter.execute({
    message,
    context,
  });

  const response = {
    reply: aiReply,
  };

  // 4. Salva memória
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