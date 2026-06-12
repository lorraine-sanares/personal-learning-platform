import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export interface FetchedArticle {
  title: string;
  text: string;
}

export async function fetchArticleText(url: string): Promise<FetchedArticle> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch article: HTTP ${response.status}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();

  if (!article || !article.textContent?.trim()) {
    throw new Error("Could not extract readable content from the page");
  }

  return {
    title: article.title || url,
    text: article.textContent.trim(),
  };
}
