---
categories:
  - project-planning
  - web-scraping
  - data-engineering
  - myanmar-content
id: simple-csv-sqlite-plan
aliases:
  - myanmar-dhamma-catalog
  - dhamma-scraper-plan
  - buddhist-content-catalog
tags:
  - nodejs
  - typescript
  - tsx
  - web-scraping
  - csv
  - sqlite
  - myanmar
  - dhamma
  - buddhist
  - data-extraction
  - metadata
  - catalog
  - dhammadownload
  - project-plan
date: Sunday, June 15th 2025, 11:39:18 am
date created: Sunday, June 15th 2025, 11:14:55 am
---

# Simple Dhamma Dataset Plan - Node.js + CSV & SQLite Version

**Project**: myanmar-dhamma-catalog
**Goal**: Create CSV dataset with media links + SQLite database
**Technology**: Node.js + TypeScript
**Date**: June 15, 2025

---

## 🎯 Simplified Objectives

**What you WILL do:**

- ✅ Scrape metadata from dhammadownload.com (Myanmar content)
- ✅ Extract audio/video/book URLs in Myanmar language (no downloads)
- ✅ Create structured CSV dataset
- ✅ Build SQLite database from CSV
- ✅ Generate simple statistics

**What you WON'T do:**

- ❌ Download actual media files
- ❌ Audio/video transcription
- ❌ Complex processing pipelines
- ❌ Cloud infrastructure

---

## 📋 Phase 1: Quick Setup (Day 1)

### Environment Setup

```bash
# Create simple project structure
mkdir myanmar-dhamma-catalog
cd myanmar-dhamma-catalog

# Initialize Node.js project
npm init -y

# Install dependencies
npm install axios cheerio csv-writer better-sqlite3 fs-extra
npm install -D typescript @types/node tsx

# Initialize TypeScript (optional, tsx works without tsconfig.json)
npx tsc --init
```

### Project Structure

```
myanmar-dhamma-catalog/
├── src/
│   ├── scraper.ts           # Main scraping script
│   ├── csvGenerator.ts      # CSV creation script
│   ├── sqliteBuilder.ts     # SQLite database creator
│   ├── analytics.ts         # Statistics generator
│   └── types.ts             # TypeScript interfaces
├── data/
│   ├── raw/                 # Raw scraped data
│   ├── dhamma_dataset.csv
│   └── dhamma_dataset.db
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📋 Phase 2: Basic Scraping (Day 2-3)

### TypeScript Interfaces

Create `src/types.ts`:

```typescript
export interface ContentItem {
  id?: number;
  title: string;
  speaker?: string;
  contentType: "audio" | "video" | "ebook" | "other";
  fileUrl: string;
  fileSizeEstimate?: number;
  durationEstimate?: number;
  language: string;
  category?: string;
  tags?: string;
  description?: string;
  dateRecorded?: string;
  sourcePage: string;
  scrapedDate: string;
}
```

### Simple Scraper Script

Create `src/scraper.ts`:

```typescript
import axios from "axios";
import * as cheerio from "cheerio";
import { ContentItem } from "./types";
import fs from "fs-extra";

class DhammaScraper {
  private baseUrls = [
    "https://www.dhammadownload.com/AudioInMyanmar.htm",
    "https://www.dhammadownload.com/VideoInMyanmar.htm",
    "https://www.dhammadownload.com/EBooksInMyanmar.htm",
    "https://www.dhammadownload.com/AbhidhammaInMyanmar.htm",
  ];

  async scrapeContent(): Promise<ContentItem[]> {
    const allContent: ContentItem[] = [];

    for (const url of this.baseUrls) {
      console.log(`Scraping: ${url}`);

      // Respectful delay
      await this.delay(2000);

      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Extract content based on page structure
        $("a[href]").each((_, element) => {
          const href = $(element).attr("href");
          const title = $(element).text().trim();

          if (href && this.isMediaFile(href) && title) {
            const contentItem: ContentItem = {
              title,
              contentType: this.getContentType(href),
              fileUrl: this.normalizeUrl(href, url),
              language: "Myanmar",
              sourcePage: url,
              scrapedDate: new Date().toISOString(),
            };

            allContent.push(contentItem);
          }
        });
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }

    return allContent;
  }

  private isMediaFile(url: string): boolean {
    return /\.(mp3|mp4|pdf|epub)$/i.test(url);
  }

  private getContentType(url: string): ContentItem["contentType"] {
    if (/\.mp3$/i.test(url)) return "audio";
    if (/\.mp4$/i.test(url)) return "video";
    if (/\.(pdf|epub)$/i.test(url)) return "ebook";
    return "other";
  }

  private normalizeUrl(href: string, basePage: string): string {
    if (href.startsWith("http")) return href;
    const baseUrl = new URL(basePage).origin;
    return new URL(href, baseUrl).toString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async saveRawData(content: ContentItem[]): Promise<void> {
    await fs.ensureDir("data/raw");
    await fs.writeJson("data/raw/scraped_content.json", content, { spaces: 2 });
    console.log(`Saved ${content.length} items to raw data`);
  }
}

// Main execution
async function main() {
  const scraper = new DhammaScraper();
  const content = await scraper.scrapeContent();
  await scraper.saveRawData(content);
  console.log(`Scraping complete. Found ${content.length} items.`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { DhammaScraper };
```

---

## 📋 Phase 3: CSV Dataset Creation (Day 3)

### CSV Schema Design

```csv
id,title,speaker,content_type,file_url,file_size_estimate,duration_estimate,language,category,tags,description,date_recorded,source_page,scraped_date
```

### CSV Generator Script

Create `src/csvGenerator.ts`:

```typescript
import createCsvWriter from "csv-writer";
import fs from "fs-extra";
import { ContentItem } from "./types";

class CsvGenerator {
  private csvHeaders = [
    { id: "id", title: "ID" },
    { id: "title", title: "Title" },
    { id: "speaker", title: "Speaker" },
    { id: "contentType", title: "Content Type" },
    { id: "fileUrl", title: "File URL" },
    { id: "fileSizeEstimate", title: "File Size Estimate" },
    { id: "durationEstimate", title: "Duration Estimate" },
    { id: "language", title: "Language" },
    { id: "category", title: "Category" },
    { id: "tags", title: "Tags" },
    { id: "description", title: "Description" },
    { id: "dateRecorded", title: "Date Recorded" },
    { id: "sourcePage", title: "Source Page" },
    { id: "scrapedDate", title: "Scraped Date" },
  ];

  async generateCsv(
    content: ContentItem[],
    outputFile = "data/dhamma_dataset.csv"
  ): Promise<void> {
    // Ensure data directory exists
    await fs.ensureDir("data");

    // Add IDs to content items
    const contentWithIds = content.map((item, index) => ({
      ...item,
      id: index + 1,
    }));

    // Create CSV writer
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: outputFile,
      header: this.csvHeaders,
    });

    // Write to CSV
    await csvWriter.writeRecords(contentWithIds);

    console.log(`CSV dataset created: ${outputFile}`);
    console.log(`Total records: ${contentWithIds.length}`);

    // Generate summary statistics
    await this.generateSummary(contentWithIds);
  }

  private async generateSummary(content: ContentItem[]): Promise<void> {
    const summary = {
      totalRecords: content.length,
      contentTypes: this.groupBy(content, "contentType"),
      languages: this.groupBy(content, "language"),
      sourcePages: this.groupBy(content, "sourcePage"),
    };

    await fs.writeJson("data/csv_summary.json", summary, { spaces: 2 });
    console.log("Summary:", summary);
  }

  private groupBy(
    array: ContentItem[],
    key: keyof ContentItem
  ): Record<string, number> {
    return array.reduce(
      (acc, item) => {
        const value = String(item[key] || "unknown");
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  async loadRawData(
    filePath = "data/raw/scraped_content.json"
  ): Promise<ContentItem[]> {
    return await fs.readJson(filePath);
  }
}

// Main execution
async function main() {
  const generator = new CsvGenerator();
  const content = await generator.loadRawData();
  await generator.generateCsv(content);
}

if (require.main === module) {
  main().catch(console.error);
}

export { CsvGenerator };
```

---

## 📋 Phase 4: SQLite Database (Day 4)

### Database Schema

```sql
CREATE TABLE dhamma_content (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    speaker TEXT,
    content_type TEXT CHECK(content_type IN ('audio', 'video', 'ebook', 'other')),
    file_url TEXT NOT NULL,
    file_size_estimate INTEGER,
    duration_estimate INTEGER,
    language TEXT DEFAULT 'English',
    category TEXT,
    tags TEXT,
    description TEXT,
    date_recorded DATE,
    source_page TEXT,
    scraped_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_type ON dhamma_content(content_type);
CREATE INDEX idx_speaker ON dhamma_content(speaker);
CREATE INDEX idx_category ON dhamma_content(category);
```

### SQLite Builder Script

Create `src/sqliteBuilder.ts`:

```typescript
import Database from "better-sqlite3";
import fs from "fs-extra";
import { ContentItem } from "./types";

class SqliteBuilder {
  private db: Database.Database;

  constructor(dbPath = "data/dhamma_dataset.db") {
    // Ensure data directory exists
    fs.ensureDirSync("data");

    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // Create table
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

    // Create indexes
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_content_type ON dhamma_content(content_type)",
      "CREATE INDEX IF NOT EXISTS idx_speaker ON dhamma_content(speaker)",
      "CREATE INDEX IF NOT EXISTS idx_category ON dhamma_content(category)",
      "CREATE INDEX IF NOT EXISTS idx_language ON dhamma_content(language)",
    ];

    indexes.forEach((indexSql) => this.db.exec(indexSql));
  }

  async insertFromCsv(csvFilePath = "data/dhamma_dataset.csv"): Promise<void> {
    // For simplicity, we'll read the JSON data instead of parsing CSV
    const jsonData = (await fs.readJson(
      "data/raw/scraped_content.json"
    )) as ContentItem[];

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

    insertMany(jsonData);

    console.log(`SQLite database created with ${jsonData.length} records`);
  }

  getStatistics(): any {
    const stats = {
      totalRecords: this.db
        .prepare("SELECT COUNT(*) as count FROM dhamma_content")
        .get(),
      contentTypes: this.db
        .prepare(
          `
        SELECT content_type, COUNT(*) as count
        FROM dhamma_content
        GROUP BY content_type
      `
        )
        .all(),
      topSpeakers: this.db
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
        .all(),
      languages: this.db
        .prepare(
          `
        SELECT language, COUNT(*) as count
        FROM dhamma_content
        GROUP BY language
      `
        )
        .all(),
    };

    console.log("\n📊 Database Statistics:");
    console.log(`Total Records: ${stats.totalRecords.count}`);
    console.log("Content Types:", stats.contentTypes);
    console.log("Languages:", stats.languages);

    return stats;
  }

  close(): void {
    this.db.close();
  }

  // Query methods
  searchByTitle(searchTerm: string): ContentItem[] {
    return this.db
      .prepare(
        `
      SELECT * FROM dhamma_content
      WHERE title LIKE ?
      ORDER BY title
    `
      )
      .all(`%${searchTerm}%`) as ContentItem[];
  }

  getByContentType(contentType: string): ContentItem[] {
    return this.db
      .prepare(
        `
      SELECT * FROM dhamma_content
      WHERE content_type = ?
    `
      )
      .all(contentType) as ContentItem[];
  }

  getBySpeaker(speaker: string): ContentItem[] {
    return this.db
      .prepare(
        `
      SELECT * FROM dhamma_content
      WHERE speaker LIKE ?
    `
      )
      .all(`%${speaker}%`) as ContentItem[];
  }
}

// Main execution
async function main() {
  const builder = new SqliteBuilder();
  await builder.insertFromCsv();
  const stats = builder.getStatistics();

  // Save statistics
  await fs.writeJson("data/database_stats.json", stats, { spaces: 2 });

  builder.close();
}

if (require.main === module) {
  main().catch(console.error);
}

export { SqliteBuilder };
```

---

## 🇲🇲 Myanmar Language Specific Considerations

### Character Encoding

- **UTF-8 Support**: Ensure all files use UTF-8 encoding for proper Myanmar text display
- **Font Requirements**: May need Myanmar fonts (Zawgyi, Unicode) for proper rendering
- **Database Collation**: Use UTF-8 collation in SQLite for proper Myanmar text sorting

### Enhanced Scraper for Myanmar Content

```typescript
class MyanmarDhammaScraper extends DhammaScraper {
  private myanmarUrls = [
    "https://www.dhammadownload.com/AudioInMyanmar.htm",
    "https://www.dhammadownload.com/VideoInMyanmar.htm",
    "https://www.dhammadownload.com/EBooksInMyanmar.htm",
    "https://www.dhammadownload.com/AbhidhammaInMyanmar.htm",
    // Additional Myanmar sections
    "https://www.dhammadownload.com/DhammaTalksInMyanmar.htm",
    "https://www.dhammadownload.com/Paritta-Myanmar.htm",
  ];

  async scrapeContent(): Promise<ContentItem[]> {
    const allContent: ContentItem[] = [];

    for (const url of this.myanmarUrls) {
      console.log(`Scraping Myanmar content: ${url}`);

      await this.delay(3000); // More respectful delay for Myanmar pages

      try {
        const response = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; DhammaDataset/1.0; +educational-purpose)",
            "Accept-Charset": "utf-8",
          },
        });

        const $ = cheerio.load(response.data);

        // Myanmar pages might have different HTML structure
        this.extractMyanmarContent($, url, allContent);
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }

    return allContent;
  }

  private extractMyanmarContent(
    $: any,
    url: string,
    allContent: ContentItem[]
  ): void {
    // Look for common Myanmar content patterns
    const selectors = [
      'a[href*=".mp3"]',
      'a[href*=".mp4"]',
      'a[href*=".pdf"]',
      'a[href*=".doc"]',
      'a[href*="MediaInfo"]', // Common on Myanmar pages
    ];

    selectors.forEach((selector) => {
      $(selector).each((_, element) => {
        const href = $(element).attr("href");
        const title = $(element).text().trim();

        if (href && title && this.isValidMyanmarContent(title)) {
          const contentItem: ContentItem = {
            title: this.cleanMyanmarTitle(title),
            contentType: this.getContentType(href),
            fileUrl: this.normalizeUrl(href, url),
            language: "Myanmar",
            category: this.extractCategory(url),
            sourcePage: url,
            scrapedDate: new Date().toISOString(),
          };

          allContent.push(contentItem);
        }
      });
    });
  }

  private isValidMyanmarContent(title: string): boolean {
    // Check if title contains Myanmar characters
    const myanmarRegex = /[\u1000-\u109F\u1040-\u1049\u1050-\u1059]/;
    return myanmarRegex.test(title) && title.length > 3;
  }

  private cleanMyanmarTitle(title: string): string {
    // Remove common unwanted characters and normalize
    return title
      .replace(/[\[\]()]/g, "") // Remove brackets
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();
  }

  private extractCategory(url: string): string {
    if (url.includes("Abhidhamma")) return "အဘိဓမ္မာ";
    if (url.includes("Audio")) return "အသံတရား";
    if (url.includes("Video")) return "ရုပ်မြင်သံကြားတရား";
    if (url.includes("EBooks")) return "ဓမ္မစာအုပ်";
    if (url.includes("Paritta")) return "ပရိတ္တာ";
    return "အခြား";
  }
}
```

### Package.json Updates for Myanmar Support

```json
{
  "scripts": {
    "scrape:myanmar": "tsx src/myanmarScraper.ts",
    "scrape": "npm run scrape:myanmar",
    "csv": "tsx src/csvGenerator.ts",
    "db": "tsx src/sqliteBuilder.ts",
    "analytics": "tsx src/analytics.ts",
    "all": "npm run scrape && npm run csv && npm run db && npm run analytics",
    "verify-encoding": "file data/*.csv data/*.json"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "csv-writer": "^1.6.0",
    "better-sqlite3": "^9.2.2",
    "fs-extra": "^11.2.0",
    "iconv-lite": "^0.6.3"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0"
  }
}
```

---

## 🚀 Implementation Timeline

| Day | Task                                         | Deliverable          |
| --- | -------------------------------------------- | -------------------- |
| 1   | Setup Node.js environment, TypeScript config | Working environment  |
| 2   | Analyze website, create basic scraper        | `src/scraper.ts`     |
| 3   | Generate CSV dataset                         | `dhamma_dataset.csv` |
| 4   | Create SQLite database                       | `dhamma_dataset.db`  |
| 5   | Basic analytics and documentation            | Statistics, README   |

---

## 📊 Expected Output

### CSV File Structure

```csv
id,title,speaker,contentType,fileUrl,language,category,scrapedDate
1,"ကြန်တော်ရဲ့ ကံ ဘယ်လိုတွေရှိလဲ","ဆရာတော် ဦးဇာဂရ",audio,"https://dhammadownload.com/audio/file1.mp3",Myanmar,ကံ,2025-06-15
2,"အဘိဓမ္မာ ပုစ္ဆာ","အာစရိယ ဦးသီလာစာရ",video,"https://dhammadownload.com/video/file2.mp4",Myanmar,အဘိဓမ္မာ,2025-06-15
```

### SQLite Database

- **Table**: `dhamma_content`
- **Records**: ~30,000+ estimated
- **Size**: ~10-50MB (metadata only)
- **Indexes**: Content type, speaker, category

---

## 🚀 Quick Start Commands

```bash
# 1. Setup
npm init -y
npm install axios cheerio csv-writer better-sqlite3 fs-extra
npm install -D typescript @types/node tsx

# 2. Run scraper
npx tsx src/scraper.ts

# 3. Generate CSV
npx tsx src/csvGenerator.ts

# 4. Create SQLite DB
npx tsx src/sqliteBuilder.ts

# 5. Generate analytics
npx tsx src/analytics.ts
```

### Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "dev": "tsx --watch src/scraper.ts",
    "scrape": "tsx src/scraper.ts",
    "scrape:myanmar": "tsx src/myanmarScraper.ts",
    "csv": "tsx src/csvGenerator.ts",
    "db": "tsx src/sqliteBuilder.ts",
    "analytics": "tsx src/analytics.ts",
    "build:all": "tsx src/scraper.ts && tsx src/csvGenerator.ts && tsx src/sqliteBuilder.ts && tsx src/analytics.ts",
    "test": "tsx src/test.ts",
    "clean": "rm -rf data/*.csv data/*.db data/*.json"
  }
}
```

Then run:

```bash
npm run all
```

---

## ✅ Success Criteria

- [ ] CSV file with 10,000+ records
- [ ] SQLite database functional
- [ ] All media URLs preserved (no downloads)
- [ ] Basic statistics generated
- [ ] Simple documentation created
- [ ] Total project time: ~5 days

---

## 🔍 Next Steps (Optional)

If you want to expand later:

1. Add web interface for browsing dataset
2. Implement search functionality
3. Add data validation and cleaning
4. Create API endpoints
5. Generate visualizations

---

This simplified plan gives you a functional dataset without the complexity of downloading and processing large media files. The focus is on metadata collection and organization, making it much more manageable for a quick implementation.

## 🚀 Why tsx instead of ts-node?

**tsx** is a faster, more modern alternative to ts-node with several advantages:

### ✨ **Benefits Of tsx:**

- ⚡ **Faster startup** - Uses esbuild for super fast compilation
- 🎯 **Better ES modules support** - Native ESM and CJS support
- 🔧 **Zero config** - Works without tsconfig.json (but respects it if present)
- 📦 **Smaller install size** - More efficient than ts-node
- 🚀 **Active development** - Modern, well-maintained (8.7M weekly downloads)
- 🔄 **Watch mode** - Built-in file watching for development
- 🐛 **Debug support** - Works with Node.js debugger

### 📝 **Usage Examples:**

```bash
# Direct execution
npx tsx src/scraper.ts

# With watch mode (auto-restart on changes)
npx tsx --watch src/scraper.ts

# With debugging
npx tsx --inspect src/scraper.ts

# Global installation (optional)
npm install -g tsx
tsx src/scraper.ts  # No npx needed
```

### 🛠️ **Development workflow:**

```bash
# Install once as dev dependency
npm install -D tsx

# Development with watch mode
npx tsx --watch src/scraper.ts  # Auto-reload on file changes

# Production-like run
npx tsx src/scraper.ts

# Run all scripts
npx tsx src/scraper.ts && npx tsx src/csvGenerator.ts && npx tsx src/sqliteBuilder.ts
```

### 🎯 **Advanced Tsx features:**

```bash
# Set environment variables
NODE_ENV=development npx tsx src/scraper.ts

# With custom node flags
npx tsx --node-options="--max-old-space-size=8192" src/scraper.ts

# Enable source maps for better debugging
npx tsx --enable-source-maps src/scraper.ts
```

### 💡 **tsx Best Practices for this project:**

```json
// package.json - Enhanced scripts with tsx
{
  "scripts": {
    "dev": "tsx --watch src/scraper.ts",
    "scrape": "tsx src/scraper.ts",
    "scrape:myanmar": "tsx src/myanmarScraper.ts",
    "csv": "tsx src/csvGenerator.ts",
    "db": "tsx src/sqliteBuilder.ts",
    "analytics": "tsx src/analytics.ts",
    "build:all": "tsx src/scraper.ts && tsx src/csvGenerator.ts && tsx src/sqliteBuilder.ts && tsx src/analytics.ts",
    "test": "tsx src/test.ts",
    "clean": "rm -rf data/*.csv data/*.db data/*.json"
  }
}
```

### 🔧 **Optional tsconfig.json For better IntelliSense:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
