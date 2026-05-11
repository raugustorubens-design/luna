export function buildContext(memories: any[], message: string) {
  return {
    memories,
    current_message: message,
  };
}