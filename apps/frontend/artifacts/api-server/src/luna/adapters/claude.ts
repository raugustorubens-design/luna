import { NotConfiguredAdapter } from "./not-configured-adapter";

export class ClaudeAdapter extends NotConfiguredAdapter {
  readonly id = "claude";
  protected readonly envVar = "ANTHROPIC_API_KEY";
}
