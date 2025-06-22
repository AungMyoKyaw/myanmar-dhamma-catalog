import Database from "better-sqlite3";
import path from "path";
import type {
  ContentItem,
  DatabaseStats,
  ContentFilters,
  QualityIssue,
  PaginatedResult
} from "./types";

export class DhammaDatabase {
  private db: Database.Database;

  constructor() {
    // Connect to existing SQLite database
    const dbPath = path.join(process.cwd(), "..", "data", "dhamma_dataset.db");
    console.log("Connecting to database at:", dbPath);
    this.db = new Database(dbPath, { readonly: false });
  }

  // Get all content with pagination
  getContent(
    page = 1,
    limit = 20,
    filters?: ContentFilters
  ): PaginatedResult<ContentItem> {
    let query = "SELECT * FROM dhamma_content WHERE 1=1";
    const params: (string | number)[] = [];

    // Apply filters
    if (filters?.contentType) {
      query += " AND content_type = ?";
      params.push(filters.contentType);
    }
    if (filters?.speaker) {
      query += " AND speaker LIKE ?";
      params.push(`%${filters.speaker}%`);
    }
    if (filters?.category) {
      query += " AND category LIKE ?";
      params.push(`%${filters.category}%`);
    }
    if (filters?.language) {
      query += " AND language = ?";
      params.push(filters.language);
    }
    if (filters?.dateFrom) {
      query += " AND date_recorded >= ?";
      params.push(filters.dateFrom);
    }
    if (filters?.dateTo) {
      query += " AND date_recorded <= ?";
      params.push(filters.dateTo);
    }

    // Get total count
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as count");
    const totalResult = this.db.prepare(countQuery).get(...params) as {
      count: number;
    };
    const total = totalResult.count;

    // Add pagination
    const offset = (page - 1) * limit;
    query += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rawItems = this.db.prepare(query).all(...params) as Array<{
      id: number;
      title: string;
      speaker: string | null;
      content_type: string;
      file_url: string;
      file_size_estimate: number | null;
      duration_estimate: number | null;
      language: string;
      category: string | null;
      tags: string | null;
      description: string | null;
      date_recorded: string | null;
      source_page: string;
      scraped_date: string;
    }>;

    // Transform the raw data to match our ContentItem interface
    const items: ContentItem[] = rawItems.map((item) => ({
      id: item.id,
      title: item.title,
      speaker: item.speaker || undefined,
      contentType: item.content_type as ContentItem["contentType"],
      fileUrl: item.file_url,
      fileSizeEstimate: item.file_size_estimate || undefined,
      durationEstimate: item.duration_estimate || undefined,
      language: item.language,
      category: item.category || undefined,
      tags: item.tags || undefined,
      description: item.description || undefined,
      dateRecorded: item.date_recorded || undefined,
      sourcePage: item.source_page,
      scrapedDate: item.scraped_date
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      totalPages,
      currentPage: page
    };
  }

  // Search content
  searchContent(query: string, filters?: ContentFilters): ContentItem[] {
    let sql = `
      SELECT * FROM dhamma_content
      WHERE (title LIKE ? OR speaker LIKE ? OR description LIKE ? OR tags LIKE ?)
    `;
    const params: (string | number)[] = [
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`
    ];

    // Apply additional filters
    if (filters?.contentType) {
      sql += " AND content_type = ?";
      params.push(filters.contentType);
    }
    if (filters?.speaker) {
      sql += " AND speaker LIKE ?";
      params.push(`%${filters.speaker}%`);
    }
    if (filters?.category) {
      sql += " AND category LIKE ?";
      params.push(`%${filters.category}%`);
    }

    sql += " ORDER BY id DESC LIMIT 50";

    const rawItems = this.db.prepare(sql).all(...params) as Array<{
      id: number;
      title: string;
      speaker: string | null;
      content_type: string;
      file_url: string;
      file_size_estimate: number | null;
      duration_estimate: number | null;
      language: string;
      category: string | null;
      tags: string | null;
      description: string | null;
      date_recorded: string | null;
      source_page: string;
      scraped_date: string;
    }>;

    return rawItems.map((item) => ({
      id: item.id,
      title: item.title,
      speaker: item.speaker || undefined,
      contentType: item.content_type as ContentItem["contentType"],
      fileUrl: item.file_url,
      fileSizeEstimate: item.file_size_estimate || undefined,
      durationEstimate: item.duration_estimate || undefined,
      language: item.language,
      category: item.category || undefined,
      tags: item.tags || undefined,
      description: item.description || undefined,
      dateRecorded: item.date_recorded || undefined,
      sourcePage: item.source_page,
      scrapedDate: item.scraped_date
    }));
  }

  // Get by ID
  getContentById(id: number): ContentItem | null {
    const rawItem = this.db
      .prepare("SELECT * FROM dhamma_content WHERE id = ?")
      .get(id) as
      | {
          id: number;
          title: string;
          speaker: string | null;
          content_type: string;
          file_url: string;
          file_size_estimate: number | null;
          duration_estimate: number | null;
          language: string;
          category: string | null;
          tags: string | null;
          description: string | null;
          date_recorded: string | null;
          source_page: string;
          scraped_date: string;
        }
      | undefined;

    if (!rawItem) return null;

    return {
      id: rawItem.id,
      title: rawItem.title,
      speaker: rawItem.speaker || undefined,
      contentType: rawItem.content_type as ContentItem["contentType"],
      fileUrl: rawItem.file_url,
      fileSizeEstimate: rawItem.file_size_estimate || undefined,
      durationEstimate: rawItem.duration_estimate || undefined,
      language: rawItem.language,
      category: rawItem.category || undefined,
      tags: rawItem.tags || undefined,
      description: rawItem.description || undefined,
      dateRecorded: rawItem.date_recorded || undefined,
      sourcePage: rawItem.source_page,
      scrapedDate: rawItem.scraped_date
    };
  }

  // Update content
  updateContent(id: number, updates: Partial<ContentItem>): boolean {
    const fieldMap: Record<string, string> = {
      title: "title",
      speaker: "speaker",
      contentType: "content_type",
      fileUrl: "file_url",
      fileSizeEstimate: "file_size_estimate",
      durationEstimate: "duration_estimate",
      language: "language",
      category: "category",
      tags: "tags",
      description: "description",
      dateRecorded: "date_recorded",
      sourcePage: "source_page",
      scrapedDate: "scraped_date"
    };

    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && fieldMap[key]
    );
    if (fields.length === 0) return false;

    const setClause = fields
      .map((field) => `${fieldMap[field]} = ?`)
      .join(", ");
    const values = fields.map((field) => updates[field as keyof ContentItem]);
    values.push(id);

    const sql = `UPDATE dhamma_content SET ${setClause} WHERE id = ?`;

    try {
      const result = this.db.prepare(sql).run(...values);
      return result.changes > 0;
    } catch (error) {
      console.error("Error updating content:", error);
      return false;
    }
  }

  // Get statistics
  getStatistics(): DatabaseStats {
    const totalRecords = (
      this.db.prepare("SELECT COUNT(*) as count FROM dhamma_content").get() as {
        count: number;
      }
    ).count;

    const contentTypes = this.db
      .prepare(
        `
      SELECT content_type, COUNT(*) as count
      FROM dhamma_content
      GROUP BY content_type
    `
      )
      .all() as Array<{ content_type: string; count: number }>;

    const languages = this.db
      .prepare(
        `
      SELECT language, COUNT(*) as count
      FROM dhamma_content
      GROUP BY language
    `
      )
      .all() as Array<{ language: string; count: number }>;

    const sourcePages = this.db
      .prepare(
        `
      SELECT source_page, COUNT(*) as count
      FROM dhamma_content
      GROUP BY source_page
    `
      )
      .all() as Array<{ source_page: string; count: number }>;

    const topSpeakers = this.db
      .prepare(
        `
      SELECT speaker, COUNT(*) as count
      FROM dhamma_content
      WHERE speaker IS NOT NULL AND speaker != ''
      GROUP BY speaker
      ORDER BY count DESC
      LIMIT 10
    `
      )
      .all() as Array<{ speaker: string; count: number }>;

    return {
      totalRecords,
      contentTypes: contentTypes.reduce(
        (acc, item) => {
          acc[item.content_type] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      languages: languages.reduce(
        (acc, item) => {
          acc[item.language] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      sourcePages: sourcePages.reduce(
        (acc, item) => {
          acc[item.source_page] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      topSpeakers
    };
  }

  // Data quality checks
  getQualityIssues(): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Missing speaker
    const missingSpeakers = this.db
      .prepare(
        `
      SELECT id, title FROM dhamma_content
      WHERE speaker IS NULL OR speaker = ''
    `
      )
      .all() as Array<{ id: number; title: string }>;

    missingSpeakers.forEach((item) => {
      issues.push({
        id: issues.length + 1,
        type: "missing_speaker",
        severity: "medium",
        description: `Content "${item.title}" is missing speaker information`,
        suggestedFix: "Add speaker information",
        contentId: item.id
      });
    });

    // Empty titles
    const emptyTitles = this.db
      .prepare(
        `
      SELECT id, title FROM dhamma_content
      WHERE title IS NULL OR title = '' OR LENGTH(TRIM(title)) < 3
    `
      )
      .all() as Array<{ id: number; title: string }>;

    emptyTitles.forEach((item) => {
      issues.push({
        id: issues.length + 1,
        type: "empty_title",
        severity: "high",
        description: `Content with ID ${item.id} has empty or very short title`,
        suggestedFix: "Add a descriptive title",
        contentId: item.id
      });
    });

    // Duplicate titles
    const duplicateTitles = this.db
      .prepare(
        `
      SELECT title, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM dhamma_content
      WHERE title IS NOT NULL AND title != ''
      GROUP BY title
      HAVING count > 1
    `
      )
      .all() as Array<{ title: string; count: number; ids: string }>;

    duplicateTitles.forEach((item) => {
      const ids = item.ids.split(",").map((id) => parseInt(id));
      ids.forEach((id) => {
        issues.push({
          id: issues.length + 1,
          type: "duplicate_title",
          severity: "low",
          description: `Title "${item.title}" appears ${item.count} times`,
          suggestedFix:
            "Make titles unique or verify if they are truly different content",
          contentId: id
        });
      });
    });

    return issues;
  }

  // Get unique speakers
  getSpeakers(): string[] {
    const result = this.db
      .prepare(
        `
      SELECT DISTINCT speaker
      FROM dhamma_content
      WHERE speaker IS NOT NULL AND speaker != ''
      ORDER BY speaker
    `
      )
      .all() as Array<{ speaker: string }>;

    return result.map((r) => r.speaker);
  }

  // Get unique categories
  getCategories(): string[] {
    const result = this.db
      .prepare(
        `
      SELECT DISTINCT category
      FROM dhamma_content
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `
      )
      .all() as Array<{ category: string }>;

    return result.map((r) => r.category);
  }

  close() {
    this.db.close();
  }
}

// Singleton instance
let dbInstance: DhammaDatabase | null = null;

export function getDatabase(): DhammaDatabase {
  if (!dbInstance) {
    dbInstance = new DhammaDatabase();
  }
  return dbInstance;
}
