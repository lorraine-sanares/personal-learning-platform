import Anthropic from "@anthropic-ai/sdk";
import type { AiClient, ExtractedInsight } from "./types";

const EXTRACTION_SCHEMA = {
  type: "object" as const,
  properties: {
    insights: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          content: {
            type: "string" as const,
            description:
              "A single distilled insight: one self-contained idea or understanding, written as 1-3 complete sentences.",
          },
        },
        required: ["content"],
        additionalProperties: false,
      },
    },
  },
  required: ["insights"],
  additionalProperties: false,
};

const THEME_SCHEMA = {
  type: "object" as const,
  properties: {
    theme: {
      type: "string" as const,
      description:
        "The single best theme name for this insight. Reuse an existing theme name when one fits; otherwise propose a new broad topic name (1-4 words, title case).",
    },
  },
  required: ["theme"],
  additionalProperties: false,
};

export function createClaudeClient(): AiClient {
  const anthropic = new Anthropic();

  return {
    async extractInsights(text: string): Promise<ExtractedInsight[]> {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        system:
          "You extract Insights from source material for a personal knowledge base. " +
          "An Insight is the atomic unit of knowledge: a distilled idea, finding, or understanding " +
          "that stands on its own without the source text. Extract every distinct insight worth " +
          "remembering — typically 2-8 per article. Do not extract filler, navigation text, or " +
          "promotional content.",
        messages: [
          {
            role: "user",
            content: `Extract the insights from this source material:\n\n${text.slice(0, 100000)}`,
          },
        ],
        output_config: {
          format: { type: "json_schema", schema: EXTRACTION_SCHEMA },
        },
      });

      const block = response.content.find((b) => b.type === "text");
      if (!block || block.type !== "text") {
        throw new Error("Claude returned no text content for insight extraction");
      }
      const parsed = JSON.parse(block.text) as { insights: ExtractedInsight[] };
      return parsed.insights;
    },

    async assignTheme(
      insightContent: string,
      existingThemes: string[],
    ): Promise<string> {
      const themeList =
        existingThemes.length > 0
          ? `Existing themes:\n${existingThemes.map((t) => `- ${t}`).join("\n")}`
          : "There are no existing themes yet — propose the first one.";

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 256,
        system:
          "You classify Insights into Themes for a personal knowledge base. " +
          "Strongly prefer reusing an existing theme when the insight reasonably fits it. " +
          "Only propose a new theme when no existing theme is a sensible home.",
        messages: [
          {
            role: "user",
            content: `${themeList}\n\nInsight: ${insightContent}`,
          },
        ],
        output_config: {
          format: { type: "json_schema", schema: THEME_SCHEMA },
        },
      });

      const block = response.content.find((b) => b.type === "text");
      if (!block || block.type !== "text") {
        throw new Error("Claude returned no text content for theme assignment");
      }
      return (JSON.parse(block.text) as { theme: string }).theme;
    },
  };
}
