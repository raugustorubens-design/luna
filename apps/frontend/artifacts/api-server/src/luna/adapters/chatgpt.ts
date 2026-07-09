import { NotConfiguredAdapter } from "./not-configured-adapter";

export class ChatGptAdapter extends NotConfiguredAdapter {
  readonly id = "chatgpt";
  protected readonly envVar = "OPENAI_API_KEY";
}
