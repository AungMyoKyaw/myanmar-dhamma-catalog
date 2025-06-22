import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET() {
  try {
    const db = getDatabase();

    // Get category counts by querying the database directly
    const categoryStats = db.db
      .prepare(
        `
      SELECT category, COUNT(*) as count
      FROM dhamma_content
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
    `
      )
      .all() as Array<{ category: string; count: number }>;

    return NextResponse.json(categoryStats);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
