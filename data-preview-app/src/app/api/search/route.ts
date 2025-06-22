import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import type { ContentFilters } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    // Determine if any filters are provided
    let hasFilter = false;
    const filters: ContentFilters = {};

    // Collect filters and track if any filter exists
    const contentType = searchParams.get("contentType");
    if (contentType) {
      filters.contentType = contentType;
      hasFilter = true;
    }
    const speaker = searchParams.get("speaker");
    if (speaker) {
      filters.speaker = speaker;
      hasFilter = true;
    }
    const category = searchParams.get("category");
    if (category) {
      filters.category = category;
      hasFilter = true;
    }
    const language = searchParams.get("language");
    if (language) {
      filters.language = language;
      hasFilter = true;
    }

    // If no search query AND no filters, return empty result
    if (!query.trim() && !hasFilter) {
      return NextResponse.json([]);
    }

    const db = getDatabase();
    const results = db.searchContent(query, filters);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching content:", error);
    return NextResponse.json(
      { error: "Failed to search content" },
      { status: 500 }
    );
  }
}
