import fs from "fs-extra";
import type { ContentItem } from "./types";
import { CsvGenerator } from "./csvGenerator";
import { SqliteBuilder } from "./sqliteBuilder";

async function main() {
  console.log("🧹 Cleaning duplicate data...");
  // Remove previous generated CSV and database
  await fs.remove("data/dhamma_dataset.csv");
  await fs.remove("data/dhamma_dataset.db");
  const rawPath = "data/raw/scraped_content.json";

  const content: ContentItem[] = await fs.readJson(rawPath);
  const seen = new Map<string, ContentItem>();
  for (const item of content) {
    if (!seen.has(item.fileUrl)) {
      seen.set(item.fileUrl, item);
    }
  }
  const cleaned = Array.from(seen.values());
  const removed = content.length - cleaned.length;
  console.log(
    `🗑️ Removed ${removed} duplicate record${removed !== 1 ? "s" : ""},` +
      ` ${cleaned.length} records remain.`
  );

  // Filter out records missing mandatory fields
  const beforeValidationCount = cleaned.length;
  const validated = cleaned.filter((item) => {
    const hasTitle = !!item.title && item.title.trim().length > 0;
    const hasFileUrl = !!item.fileUrl && item.fileUrl.trim().length > 0;
    const hasValidUrl = !item.fileUrl.startsWith("file://");
    const hasContentType = !!item.contentType;
    const hasSourcePage =
      !!item.sourcePage && item.sourcePage.trim().length > 0;
    return (
      hasTitle && hasFileUrl && hasContentType && hasSourcePage && hasValidUrl
    );
  });
  const removedInvalid = beforeValidationCount - validated.length;
  if (removedInvalid > 0) {
    console.log(
      `🗑️ Removed ${removedInvalid} invalid record${
        removedInvalid !== 1 ? "s" : ""
      }, ${validated.length} records remain after validation.`
    );
  }
  await fs.writeJson(rawPath, validated, { spaces: 2 });

  // Remove duplicate titles
  const titleSeen = new Set<string>();
  const deduped = validated.filter((item) => {
    const titleKey = item.title.trim().toLowerCase();
    if (titleSeen.has(titleKey)) {
      return false;
    }
    titleSeen.add(titleKey);
    return true;
  });
  const removedDuplicateTitles = validated.length - deduped.length;
  if (removedDuplicateTitles > 0) {
    console.log(
      `🗑️ Removed ${removedDuplicateTitles} duplicate title record${removedDuplicateTitles !== 1 ? "s" : ""}, ${deduped.length} records remain after title deduplication.`
    );
  }
  await fs.writeJson(rawPath, deduped, { spaces: 2 });

  console.log("🔄 Regenerating CSV and database with cleaned data...");
  const generator = new CsvGenerator();
  await generator.generateCsv(deduped);

  const builder = new SqliteBuilder();
  await builder.insertFromJson();

  console.log("✅ Data cleaning complete.");
}

main().catch((err) => {
  console.error("💥 Cleaning failed:", err);
  process.exit(1);
});
