import { NotConfiguredAdapter } from "./not-configured-adapter";

export class GrokAdapter extends NotConfiguredAdapter {
  readonly id = "grok";
  protected readonly envVar = "GROK_API_KEY";
}
