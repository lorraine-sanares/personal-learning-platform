import { NextResponse } from "next/server";
import { fetchArticleText } from "@/ingestion/article";
import { extractPdfText } from "@/ingestion/pdf";
import { extractImageText } from "@/ingestion/ocr";
import { ingestText } from "@/ingestion/pipeline";

function unprocessable(error: unknown) {
  return NextResponse.json(
    {
      error: `Could not ingest this source: ${error instanceof Error ? error.message : "unknown error"}`,
    },
    { status: 422 },
  );
}

async function handleArticle(url: string) {
  let article;
  try {
    article = await fetchArticleText(url);
  } catch (error) {
    return unprocessable(error);
  }
  const result = await ingestText({
    sourceType: "article",
    contentRef: url,
    text: article.text,
    insightState: "committed",
  });
  return NextResponse.json(result);
}

async function handlePdf(file: File) {
  let text;
  try {
    text = await extractPdfText(Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    return unprocessable(error);
  }
  const result = await ingestText({
    sourceType: "pdf",
    contentRef: file.name,
    text,
    insightState: "committed",
  });
  return NextResponse.json(result);
}

async function handleImage(file: File) {
  let text;
  try {
    text = await extractImageText(Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    return unprocessable(error);
  }
  // OCR output is inherently ambiguous, so Insights land in the Backlog as Drafts.
  const result = await ingestText({
    sourceType: "image",
    contentRef: file.name,
    text,
    insightState: "draft",
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const type = formData.get("type");
    const file = formData.get("file");

    if (type === "pdf" && file instanceof File) {
      return handlePdf(file);
    }
    if (type === "image" && file instanceof File) {
      return handleImage(file);
    }
    return NextResponse.json(
      { error: "Expected multipart form with type=pdf|image and a file" },
      { status: 400 },
    );
  }

  const body = await request.json();
  if (body.type === "article" && typeof body.url === "string") {
    return handleArticle(body.url);
  }

  if (
    (body.type === "meeting_note" || body.type === "workspace_page") &&
    typeof body.text === "string"
  ) {
    const text = body.text.trim();
    if (!text) {
      return NextResponse.json(
        { error: "Pasted text must not be empty" },
        { status: 400 },
      );
    }
    const result = await ingestText({
      sourceType: body.type,
      contentRef:
        typeof body.title === "string" && body.title.trim()
          ? body.title.trim()
          : `${body.type} ${new Date().toISOString()}`,
      text,
      insightState: "committed",
    });
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: 'Expected { type: "article", url }, pasted text, or a file upload' },
    { status: 400 },
  );
}
