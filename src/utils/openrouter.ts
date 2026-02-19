// OpenRouter API client
import { config } from "dotenv";

config();

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export function getApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY;
}

export function getModel(): string {
  return process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.6";
}

export function isConfigured(): boolean {
  const key = getApiKey();
  return !!key && key !== "sk-or-v1-your-key-here";
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not set. Add it to .env file.");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/claude-skill-creator",
      "X-Title": "ClaudeCodeSkillCreator",
    },
    body: JSON.stringify({
      model: getModel(),
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${error}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenRouter response");
  }

  return content;
}
