import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET() {
  try {
    const db = getDatabase();
    const issues = db.getQualityIssues();

    return NextResponse.json(issues);
  } catch (error) {
    console.error("Error fetching quality issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch quality issues" },
      { status: 500 }
    );
  }
}
