import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET() {
  try {
    const db = getDatabase();

    // Get speaker statistics
    const stats = db.getStatistics();

    // Return the top speakers with counts
    const speakerStats = stats.topSpeakers;

    return NextResponse.json(speakerStats);
  } catch (error) {
    console.error("Error fetching speakers:", error);
    return NextResponse.json(
      { error: "Failed to fetch speakers" },
      { status: 500 }
    );
  }
}
