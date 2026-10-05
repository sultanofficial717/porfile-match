import { NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";

const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ab53d41002dc45e850e";
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = "profile-matcher";
const MATCHES_COLLECTION = "matches";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const body = await request.json();
    const { status, matchReasons } = body;

    if (!APPWRITE_API_KEY) {
      return NextResponse.json({ error: "Server API key not configured" }, { status: 500 });
    }

    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);

    const updatePayload: Record<string, unknown> = {};
    if (status) updatePayload.status = status;
    if (matchReasons) updatePayload.matchReasons = matchReasons;

    const updated = await databases.updateDocument(
      DATABASE_ID,
      MATCHES_COLLECTION,
      matchId,
      updatePayload
    );

    return NextResponse.json({ success: true, match: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update match";
    console.error("API error updating match:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
