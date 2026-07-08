import type { LunaContext, LunaMemoryRecord } from "./contracts";

export function buildContext(memories: LunaMemoryRecord[], message: string): LunaContext {
  return {
    memories,
    current_message: message,
    sync: {
      cognitiveIndexRefs: [],
      checkpointRefs: [],
      reconstructionRefs: [],
    },
  };
}
