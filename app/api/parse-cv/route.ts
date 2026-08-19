import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/parsing/cv-parser";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let rawText = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      rawText = body.text || "";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const pastedText = formData.get("text") as string | null;

      if (pastedText && pastedText.trim().length > 0) {
        rawText = pastedText;
      } else if (file) {
        // Read text from file buffer
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder("utf-8");
        rawText = decoder.decode(buffer);

        // If file is binary PDF/DOCX or contains unprintable chars, clean it up or extract text tokens
        rawText = rawText.replace(/[^\x20-\x7E\r\n\t]/g, " ");
      }
    }

    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide resume content by pasting text or uploading a file." },
        { status: 400 }
      );
    }

    const parsedResult = parseResumeText(rawText);

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
