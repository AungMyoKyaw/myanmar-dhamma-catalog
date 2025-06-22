import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET() {
  try {
    const db = getDatabase();
    const stats = db.getStatistics();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
