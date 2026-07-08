import type { ProviderAdapter, ProviderExecutionInput } from "../contracts";

interface GroqMessage {
  role: "system" | "user";
  content: string;
}

interface GroqChoice {
  message?: {
    content?: string;
  };
}

interface GroqResponse {
  choices?: GroqChoice[];
}

export class GroqAdapter implements ProviderAdapter {
  readonly id = "groq";

  async execute(input: ProviderExecutionInput): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is required");
    }

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    const messages: GroqMessage[] = [
      {
        role: "system",
        content:
          "Você é a LUNA. Responda de forma clara, útil e objetiva, mantendo continuidade com o contexto.",
      },
      {
        role: "system",
        content: `Memories: ${JSON.stringify(input.context.memories)}`,
      },
      {
        role: "user",
        content: input.message,
      },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq request failed: ${response.status} ${errorBody}`);
    }

    const data = (await response.json()) as GroqResponse;
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("Groq response missing choices[0].message.content");
    }

    return reply;
  }
}
