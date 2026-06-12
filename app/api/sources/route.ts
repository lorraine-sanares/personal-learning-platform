import { NextResponse } from "next/server";
import { fetchArticleText } from "@/ingestion/article";
import { extractPdfText } from "@/ingestion/pdf";
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

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const type = formData.get("type");
    const file = formData.get("file");

    if (type === "pdf" && file instanceof File) {
      return handlePdf(file);
    }
    return NextResponse.json(
      { error: "Expected multipart form with type=pdf and a file" },
      { status: 400 },
    );
  }

  const body = await request.json();
  if (body.type === "article" && typeof body.url === "string") {
    return handleArticle(body.url);
  }

  return NextResponse.json(
    { error: 'Expected { type: "article", url } or a multipart file upload' },
    { status: 400 },
  );
}
