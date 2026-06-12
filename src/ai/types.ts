export interface ExtractedInsight {
  content: string;
}

export interface AiClient {
  /** Extract distilled Insights from raw Source text. (Claude Sonnet) */
  extractInsights(text: string): Promise<ExtractedInsight[]>;
  /**
   * Pick the best Theme name for an Insight. May return one of
   * existingThemes or propose a new name. (Claude Haiku)
   */
  assignTheme(insightContent: string, existingThemes: string[]): Promise<string>;
}
