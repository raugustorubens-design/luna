import type { LunaContext, LunaIdentity, LunaMemoryRecord } from "./contracts";
import { readProjectContext } from "./indice-cognitivo";

const LUNA_IDENTITY: LunaIdentity = {
  name: "LUNA",
  mission:
    "Organismo cognitivo soberano: continuidade, memória reconstrutiva e execução via Provider Engine e Gateway de capacidades.",
};

/**
 * Context Hub: the single shared context every provider execution consumes.
 * No provider may run without this — `provider-router.ts` always builds its
 * `ProviderExecutionInput.context` from here.
 */
export async function assembleContext(memories: LunaMemoryRecord[], message: string): Promise<LunaContext> {
  const projectContext = await readProjectContext();

  return {
    memories,
    current_message: message,
    identity: LUNA_IDENTITY,
    projectState: projectContext.state,
    evolutiveContext: projectContext.evolutiveContext,
    openTasks: projectContext.openTasks,
    roadmap: projectContext.roadmap,
    // "Atratores cognitivos" não tem definição de produto em nenhum documento
    // do projeto — mantido vazio até haver especificação real.
    cognitiveAttractors: [],
    sync: {
      cognitiveIndexRefs: projectContext.cognitiveIndexRefs,
      checkpointRefs: [],
      reconstructionRefs: [],
    },
  };
}
