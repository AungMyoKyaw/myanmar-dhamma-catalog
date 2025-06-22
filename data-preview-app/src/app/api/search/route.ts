import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import type { ContentFilters } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const filters: ContentFilters = {};

    const contentType = searchParams.get("contentType");
    if (contentType) {
      filters.contentType = contentType;
    }

    const speaker = searchParams.get("speaker");
    if (speaker) {
      filters.speaker = speaker;
    }

    const category = searchParams.get("category");
    if (category) {
      filters.category = category;
    }

    const language = searchParams.get("language");
    if (language) {
      filters.language = language;
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
