import Database from "better-sqlite3";
import fs from "fs-extra";
import type { ContentItem, DatabaseStats } from "./types";

class SqliteBuilder {
  private db: Database.Database;

  constructor(dbPath = "data/dhamma_dataset.db") {
    console.log(`🗄️ Initializing SQLite database at ${dbPath}...`);

    // Ensure data directory exists
    fs.ensureDirSync("data");

    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    console.log("📋 Creating database schema...");

    // Create table with comprehensive schema
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS dhamma_content (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        speaker TEXT,
        content_type TEXT CHECK(content_type IN ('audio', 'video', 'ebook', 'other')),
        file_url TEXT NOT NULL,
        file_size_estimate INTEGER,
        duration_estimate INTEGER,
        language TEXT DEFAULT 'Myanmar',
        category TEXT,
        tags TEXT,
        description TEXT,
        date_recorded DATE,
        source_page TEXT,
        scraped_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.exec(createTableSql);

    // Create indexes for better query performance
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_content_type ON dhamma_content(content_type)",
      "CREATE INDEX IF NOT EXISTS idx_speaker ON dhamma_content(speaker)",
      "CREATE INDEX IF NOT EXISTS idx_category ON dhamma_content(category)",
      "CREATE INDEX IF NOT EXISTS idx_language ON dhamma_content(language)",
      "CREATE INDEX IF NOT EXISTS idx_source_page ON dhamma_content(source_page)"
    ];

    indexes.forEach((indexSql) => {
      try {
        this.db.exec(indexSql);
      } catch (error) {
        console.warn(`⚠️ Index creation warning: ${error}`);
      }
    });

    console.log("✅ Database schema created successfully");
  }

  async insertFromJson(
    jsonFilePath = "data/raw/scraped_content.json"
  ): Promise<void> {
    console.log(`📥 Loading data from ${jsonFilePath}...`);

    try {
      const jsonData = (await fs.readJson(jsonFilePath)) as ContentItem[];
      console.log(`📊 Found ${jsonData.length} items to insert`);

      // Clear existing data
      this.db.exec("DELETE FROM dhamma_content");

      const insertStmt = this.db.prepare(`
        INSERT INTO dhamma_content (
          title, speaker, content_type, file_url, file_size_estimate,
          duration_estimate, language, category, tags, description,
          date_recorded, source_page, scraped_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = this.db.transaction((items: ContentItem[]) => {
        for (const item of items) {
          insertStmt.run(
            item.title,
            item.speaker || null,
            item.contentType,
            item.fileUrl,
            item.fileSizeEstimate || null,
            item.durationEstimate || null,
            item.language,
            item.category || null,
            item.tags || null,
            item.description || null,
            item.dateRecorded || null,
            item.sourcePage,
            item.scrapedDate
          );
        }
      });

      console.log("💾 Inserting data into database...");
      insertMany(jsonData);

      console.log(`✅ SQLite database created with ${jsonData.length} records`);
    } catch (error) {
      console.error("❌ Error inserting data:", error);
      throw error;
    }
  }

  getStatistics(): DatabaseStats {
    console.log("📊 Generating database statistics...");

    const stats: DatabaseStats = {
      totalRecords: (
        this.db
          .prepare("SELECT COUNT(*) as count FROM dhamma_content")
          .get() as { count: number }
      ).count,
      contentTypes: {},
      languages: {},
      sourcePages: {}
    };

    // Content types distribution
    const contentTypes = this.db
      .prepare(
        `
        SELECT content_type, COUNT(*) as count
        FROM dhamma_content
        GROUP BY content_type
      `
      )
      .all() as Array<{ content_type: string; count: number }>;

    contentTypes.forEach((row) => {
      stats.contentTypes[row.content_type] = row.count;
    });

    // Top speakers
    const topSpeakers = this.db
      .prepare(
        `
        SELECT speaker, COUNT(*) as count
        FROM dhamma_content
        WHERE speaker IS NOT NULL
        GROUP BY speaker
        ORDER BY count DESC
        LIMIT 10
      `
      )
      .all() as Array<{ speaker: string; count: number }>;

    if (topSpeakers.length > 0) {
      stats.topSpeakers = topSpeakers;
    }

    // Languages distribution
    const languages = this.db
      .prepare(
        `
        SELECT language, COUNT(*) as count
        FROM dhamma_content
        GROUP BY language
      `
      )
      .all() as Array<{ language: string; count: number }>;

    languages.forEach((row) => {
      stats.languages[row.language] = row.count;
    });

    // Source pages distribution
    const sourcePages = this.db
      .prepare(
        `
        SELECT source_page, COUNT(*) as count
        FROM dhamma_content
        GROUP BY source_page
      `
      )
      .all() as Array<{ source_page: string; count: number }>;

    sourcePages.forEach((row) => {
      const urlParts = row.source_page.split("/");
      const pageName = urlParts[urlParts.length - 1] || row.source_page;
      stats.sourcePages[pageName] = row.count;
    });

    return stats;
  }

  async saveStatistics(): Promise<void> {
    const stats = this.getStatistics();

    await fs.writeJson("data/database_stats.json", stats, { spaces: 2 });

    console.log("\n📊 Database Statistics:");
    console.log(`📚 Total Records: ${stats.totalRecords}`);
    console.log("📑 Content Types:", stats.contentTypes);
    console.log("🌐 Languages:", stats.languages);
    console.log("🔗 Source Pages:", stats.sourcePages);

    if (stats.topSpeakers && stats.topSpeakers.length > 0) {
      console.log("🎤 Top Speakers:");
      stats.topSpeakers.slice(0, 5).forEach((speaker) => {
        console.log(`  ${speaker.speaker}: ${speaker.count} items`);
      });
    }
  }

  // Utility queries for data exploration
  searchByTitle(searchTerm: string): Array<ContentItem> {
    const stmt = this.db.prepare(`
      SELECT * FROM dhamma_content 
      WHERE title LIKE ? 
      ORDER BY title
      LIMIT 20
    `);
    return stmt.all(`%${searchTerm}%`) as Array<ContentItem>;
  }

  getByContentType(contentType: string): Array<ContentItem> {
    const stmt = this.db.prepare(`
      SELECT * FROM dhamma_content 
      WHERE content_type = ? 
      ORDER BY title
    `);
    return stmt.all(contentType) as Array<ContentItem>;
  }

  getBySpeaker(speaker: string): Array<ContentItem> {
    const stmt = this.db.prepare(`
      SELECT * FROM dhamma_content 
      WHERE speaker = ? 
      ORDER BY title
    `);
    return stmt.all(speaker) as Array<ContentItem>;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      console.log("🔒 Database connection closed");
    }
  }
}

// Main execution
async function main() {
  let builder: SqliteBuilder | null = null;

  try {
    builder = new SqliteBuilder();
    await builder.insertFromJson();
    await builder.saveStatistics();

    console.log("\n🎯 Next steps:");
    console.log("  npm run analytics     # Generate detailed analytics");
    console.log("  npm run all           # Run complete pipeline");
  } catch (error) {
    console.error("💥 Database building failed:", error);
    process.exit(1);
  } finally {
    if (builder) {
      builder.close();
    }
  }
}

if (require.main === module) {
  main();
}

export { SqliteBuilder };
