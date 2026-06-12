import type { AiClient } from "./types";
import { createClaudeClient } from "./claude";

let client: AiClient | null = null;

export function setAiClient(override: AiClient): void {
  client = override;
}

export function getAiClient(): AiClient {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable AI features.",
      );
    }
    client = createClaudeClient();
  }
  return client;
}

export type { AiClient, ExtractedInsight } from "./types";
