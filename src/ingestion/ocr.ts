export interface OcrEngine {
  /** Transcribe printed or handwritten text from an image buffer. */
  transcribe(image: Buffer): Promise<string>;
}

let engine: OcrEngine | null = null;

export function setOcrEngine(override: OcrEngine): void {
  engine = override;
}

export function getOcrEngine(): OcrEngine {
  if (!engine) {
    engine = createTesseractEngine();
  }
  return engine;
}

function createTesseractEngine(): OcrEngine {
  return {
    async transcribe(image: Buffer): Promise<string> {
      const { recognize } = await import("tesseract.js");
      const result = await recognize(image, "eng");
      return result.data.text;
    },
  };
}

export async function extractImageText(image: Buffer): Promise<string> {
  let text: string;
  try {
    text = await getOcrEngine().transcribe(image);
  } catch (error) {
    throw new Error(
      `OCR failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("No readable text found in the image");
  }
  return trimmed;
}
