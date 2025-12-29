import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    // Fetch all speakers with counts
    let speakerStats = db.getAllSpeakerStats();
    // Apply search filter if provided
    const searchQuery = request.nextUrl.searchParams.get("search");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      speakerStats = speakerStats.filter((s) =>
        s.speaker.toLowerCase().includes(q)
      );
    }
    return NextResponse.json(speakerStats);
  } catch (error) {
    console.error("Error fetching speakers:", error);
    return NextResponse.json(
      { error: "Failed to fetch speakers" },
      { status: 500 }
    );
  }
}
