import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callClaude(prompt: string, systemPrompt?: string): Promise<string> {
  const maxRetries = 4;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8096,
        messages: [{ role: "user", content: prompt }],
        ...(systemPrompt && { system: systemPrompt }),
      });

      const content = message.content[0];
      if (content.type !== "text") throw new Error("Unexpected response type");
      return content.text;
    } catch (err: unknown) {
      lastError = err;
      // Retry on 529 (overloaded) or 529-like transient errors
      const status = (err as { status?: number })?.status;
      if (status === 529 || status === 503 || status === 502) {
        const delay = Math.min(1000 * 2 ** attempt, 16000); // 1s, 2s, 4s, 8s
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

export function extractJSON(text: string): unknown {
  const match = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[1] || match[0]);
}
