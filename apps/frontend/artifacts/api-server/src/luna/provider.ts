export interface ProviderExecutionInput {
  message: string;
  context: {
    memories: any[];
    current_message: string;
  };
}

export class ProviderRouter {
  async execute(input: ProviderExecutionInput): Promise<string> {
    const provider = new GroqProvider();

    const startedAt = Date.now();
    console.log("[ProviderRouter] provider selected: groq");

    try {
      const reply = await provider.execute(input);
      const elapsedMs = Date.now() - startedAt;

      console.log(`[ProviderRouter] success in ${elapsedMs}ms`);

      return reply;
    } catch (error) {
      const elapsedMs = Date.now() - startedAt;
      console.error(`[ProviderRouter] failure in ${elapsedMs}ms`, error);
      throw error;
    }
  }
}

class GroqProvider {
  async execute(input: ProviderExecutionInput): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is required");
    }

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
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
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq request failed: ${response.status} ${errorBody}`);
    }

    const data: any = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("Groq response missing choices[0].message.content");
    }

    return reply;
  }
}
