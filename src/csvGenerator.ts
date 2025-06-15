import * as createCsvWriter from "csv-writer";
import fs from "fs-extra";
import type { ContentItem, DatabaseStats } from "./types";

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
    console.log("📊 Generating CSV dataset...");
    
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

    console.log(`✅ CSV dataset created: ${outputFile}`);
    console.log(`📈 Total records: ${contentWithIds.length}`);

    // Generate summary statistics
    await this.generateSummary(contentWithIds);
  }

  private async generateSummary(content: ContentItem[]): Promise<void> {
    const summary: DatabaseStats = {
      totalRecords: content.length,
      contentTypes: this.groupBy(content, "contentType"),
      languages: this.groupBy(content, "language"),
      sourcePages: this.groupBy(content, "sourcePage"),
    };

    // Add categories if they exist
    const categories = this.groupBy(content, "category");
    if (Object.keys(categories).length > 1) { // More than just "unknown"
      summary.sourcePages = categories;
    }

    await fs.writeJson("data/csv_summary.json", summary, { spaces: 2 });
    
    console.log("\n📊 CSV Summary:");
    console.log(`📚 Total Records: ${summary.totalRecords}`);
    console.log("📑 Content Types:", summary.contentTypes);
    console.log("🌐 Languages:", summary.languages);
    console.log("🔗 Source Pages:", Object.keys(summary.sourcePages).length);
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
    try {
      console.log(`📖 Loading raw data from ${filePath}...`);
      const content = await fs.readJson(filePath);
      console.log(`✅ Loaded ${content.length} items`);
      return content;
    } catch (error) {
      console.error("❌ Error loading raw data:", error);
      throw error;
    }
  }

  async validateData(content: ContentItem[]): Promise<void> {
    console.log("🔍 Validating data...");
    
    const issues: string[] = [];
    
    content.forEach((item, index) => {
      if (!item.title?.trim()) {
        issues.push(`Item ${index}: Missing title`);
      }
      if (!item.fileUrl?.trim()) {
        issues.push(`Item ${index}: Missing file URL`);
      }
      if (!item.contentType) {
        issues.push(`Item ${index}: Missing content type`);
      }
      if (!item.sourcePage?.trim()) {
        issues.push(`Item ${index}: Missing source page`);
      }
    });

    if (issues.length > 0) {
      console.warn(`⚠️ Found ${issues.length} data quality issues:`);
      issues.slice(0, 10).forEach(issue => console.warn(`  ${issue}`));
      if (issues.length > 10) {
        console.warn(`  ... and ${issues.length - 10} more`);
      }
    } else {
      console.log("✅ All data validation checks passed");
    }
  }
}

// Main execution
async function main() {
  try {
    const generator = new CsvGenerator();
    const content = await generator.loadRawData();
    
    await generator.validateData(content);
    await generator.generateCsv(content);
    
    console.log("\n🎯 Next steps:");
    console.log("  npm run build-db      # Build SQLite database");
    console.log("  npm run analytics     # Generate analytics");
    
  } catch (error) {
    console.error("💥 CSV generation failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { CsvGenerator };
