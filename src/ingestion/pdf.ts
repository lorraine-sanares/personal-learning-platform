import { PDFParse } from "pdf-parse";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  let text: string | undefined;
  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    text = result.text?.trim();
  } catch (error) {
    throw new Error(
      `Could not parse PDF: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }

  if (!text) {
    throw new Error("No readable text found in the PDF");
  }
  return text;
}
