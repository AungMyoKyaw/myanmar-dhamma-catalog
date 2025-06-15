import fs from "fs-extra";
import type { ContentItem, DatabaseStats } from "./types";
import { SqliteBuilder } from "./sqliteBuilder";

class AnalyticsGenerator {
  private dbBuilder: SqliteBuilder;

  constructor() {
    this.dbBuilder = new SqliteBuilder();
  }

  async generateComprehensiveAnalytics(): Promise<void> {
    console.log("📊 Generating comprehensive analytics...");

    const analytics = {
      overview: await this.generateOverview(),
      contentAnalysis: await this.generateContentAnalysis(),
      qualityMetrics: await this.generateQualityMetrics(),
      generatedAt: new Date().toISOString(),
    };

    await fs.writeJson("data/comprehensive_analytics.json", analytics, { spaces: 2 });
    await this.generateMarkdownReport(analytics);

    console.log("✅ Analytics generated successfully!");
    console.log("📄 Reports saved:");
    console.log("  - data/comprehensive_analytics.json");
    console.log("  - data/analytics_report.md");
  }

  private async generateOverview(): Promise<any> {
    const stats = this.dbBuilder.getStatistics();
    
    return {
      totalItems: stats.totalRecords,
      contentTypes: stats.contentTypes,
      languages: stats.languages,
      sourcePages: stats.sourcePages,
      topSpeakers: stats.topSpeakers?.slice(0, 10) || [],
    };
  }

  private async generateContentAnalysis(): Promise<any> {
    // Load raw data for detailed analysis
    const rawData = await fs.readJson("data/raw/scraped_content.json") as ContentItem[];

    const analysis = {
      titleAnalysis: this.analyzeTitles(rawData),
      urlPatterns: this.analyzeUrlPatterns(rawData),
      categoryDistribution: this.analyzeCategoryDistribution(rawData),
      speakerAnalysis: this.analyzeSpeakers(rawData),
    };

    return analysis;
  }

  private analyzeTitles(data: ContentItem[]): any {
    const titleLengths = data.map(item => item.title.length);
    const avgLength = titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length;
    
    const languages = {
      maybeMyanmar: 0,
      maybeEnglish: 0,
      mixed: 0,
      other: 0,
    };

    data.forEach(item => {
      const title = item.title;
      const hasMyanmarChars = /[\u1000-\u109f]/.test(title);
      const hasEnglishChars = /[a-zA-Z]/.test(title);
      
      if (hasMyanmarChars && hasEnglishChars) {
        languages.mixed++;
      } else if (hasMyanmarChars) {
        languages.maybeMyanmar++;
      } else if (hasEnglishChars) {
        languages.maybeEnglish++;
      } else {
        languages.other++;
      }
    });

    return {
      averageLength: Math.round(avgLength),
      minLength: Math.min(...titleLengths),
      maxLength: Math.max(...titleLengths),
      languageDetection: languages,
      totalTitles: data.length,
    };
  }

  private analyzeUrlPatterns(data: ContentItem[]): any {
    const domains = new Map<string, number>();
    const fileExtensions = new Map<string, number>();
    const protocols = new Map<string, number>();

    data.forEach(item => {
      try {
        const url = new URL(item.fileUrl);
        
        // Domain analysis
        const domain = url.hostname;
        domains.set(domain, (domains.get(domain) || 0) + 1);
        
        // Protocol analysis
        protocols.set(url.protocol, (protocols.get(url.protocol) || 0) + 1);
        
        // File extension analysis
        const pathname = url.pathname.toLowerCase();
        const extensionMatch = pathname.match(/\.([a-z0-9]+)$/);
        if (extensionMatch) {
          const ext = extensionMatch[1];
          fileExtensions.set(ext, (fileExtensions.get(ext) || 0) + 1);
        }
      } catch (error) {
        // Invalid URL
      }
    });

    return {
      domains: Object.fromEntries(domains),
      fileExtensions: Object.fromEntries(fileExtensions),
      protocols: Object.fromEntries(protocols),
    };
  }

  private analyzeCategoryDistribution(data: ContentItem[]): any {
    const categories = new Map<string, number>();
    const categoriesWithSpeakers = new Map<string, Set<string>>();

    data.forEach(item => {
      const category = item.category || "uncategorized";
      categories.set(category, (categories.get(category) || 0) + 1);

      if (item.speaker) {
        if (!categoriesWithSpeakers.has(category)) {
          categoriesWithSpeakers.set(category, new Set());
        }
        categoriesWithSpeakers.get(category)?.add(item.speaker);
      }
    });

    const result: any = {
      distribution: Object.fromEntries(categories),
      speakersPerCategory: {},
    };

    categoriesWithSpeakers.forEach((speakers, category) => {
      result.speakersPerCategory[category] = speakers.size;
    });

    return result;
  }

  private analyzeSpeakers(data: ContentItem[]): any {
    const speakers = new Map<string, number>();
    const speakersContent = new Map<string, Set<string>>();

    data.forEach(item => {
      if (item.speaker) {
        speakers.set(item.speaker, (speakers.get(item.speaker) || 0) + 1);
        
        if (!speakersContent.has(item.speaker)) {
          speakersContent.set(item.speaker, new Set());
        }
        speakersContent.get(item.speaker)?.add(item.contentType);
      }
    });

    const speakerStats = Array.from(speakers.entries())
      .map(([speaker, count]) => ({
        speaker,
        itemCount: count,
        contentTypes: Array.from(speakersContent.get(speaker) || []),
      }))
      .sort((a, b) => b.itemCount - a.itemCount);

    return {
      totalSpeakers: speakers.size,
      topSpeakers: speakerStats.slice(0, 15),
      speakersWithMultipleContentTypes: speakerStats.filter(s => s.contentTypes.length > 1).length,
    };
  }

  private async generateQualityMetrics(): Promise<any> {
    const rawData = await fs.readJson("data/raw/scraped_content.json") as ContentItem[];

    const metrics = {
      completeness: {
        withTitle: rawData.filter(item => item.title?.trim()).length,
        withSpeaker: rawData.filter(item => item.speaker?.trim()).length,
        withCategory: rawData.filter(item => item.category?.trim()).length,
        withDescription: rawData.filter(item => item.description?.trim()).length,
      },
      urlQuality: {
        validUrls: 0,
        invalidUrls: 0,
        httpUrls: 0,
        httpsUrls: 0,
      },
      duplicates: this.findDuplicates(rawData),
    };

    rawData.forEach(item => {
      try {
        const url = new URL(item.fileUrl);
        metrics.urlQuality.validUrls++;
        if (url.protocol === "http:") metrics.urlQuality.httpUrls++;
        if (url.protocol === "https:") metrics.urlQuality.httpsUrls++;
      } catch {
        metrics.urlQuality.invalidUrls++;
      }
    });

    return metrics;
  }

  private findDuplicates(data: ContentItem[]): any {
    const titleCounts = new Map<string, number>();
    const urlCounts = new Map<string, number>();

    data.forEach(item => {
      const normalizedTitle = item.title.toLowerCase().trim();
      titleCounts.set(normalizedTitle, (titleCounts.get(normalizedTitle) || 0) + 1);
      urlCounts.set(item.fileUrl, (urlCounts.get(item.fileUrl) || 0) + 1);
    });

    const duplicateTitles = Array.from(titleCounts.entries())
      .filter(([, count]) => count > 1)
      .length;

    const duplicateUrls = Array.from(urlCounts.entries())
      .filter(([, count]) => count > 1)
      .length;

    return {
      duplicateTitles,
      duplicateUrls,
      uniqueTitles: titleCounts.size,
      uniqueUrls: urlCounts.size,
    };
  }

  private async generateMarkdownReport(analytics: any): Promise<void> {
    const report = `# Myanmar Dhamma Catalog - Analytics Report

Generated on: ${new Date(analytics.generatedAt).toLocaleString()}

## 📊 Overview

- **Total Items**: ${analytics.overview.totalItems}
- **Content Types**: ${Object.keys(analytics.overview.contentTypes).length}
- **Languages**: ${Object.keys(analytics.overview.languages).length}
- **Source Pages**: ${Object.keys(analytics.overview.sourcePages).length}
- **Speakers**: ${analytics.overview.topSpeakers.length}

## 📑 Content Distribution

### Content Types
${Object.entries(analytics.overview.contentTypes)
  .map(([type, count]) => `- **${type}**: ${count}`)
  .join('\n')}

### Source Pages
${Object.entries(analytics.overview.sourcePages)
  .map(([page, count]) => `- **${page}**: ${count}`)
  .join('\n')}

## 🎤 Top Speakers

${analytics.overview.topSpeakers
  .slice(0, 10)
  .map((speaker: any, index: number) => `${index + 1}. **${speaker.speaker}** (${speaker.count} items)`)
  .join('\n')}

## 📝 Title Analysis

- **Average Title Length**: ${analytics.contentAnalysis.titleAnalysis.averageLength} characters
- **Language Detection**:
  - Myanmar script: ${analytics.contentAnalysis.titleAnalysis.languageDetection.maybeMyanmar}
  - English text: ${analytics.contentAnalysis.titleAnalysis.languageDetection.maybeEnglish}
  - Mixed: ${analytics.contentAnalysis.titleAnalysis.languageDetection.mixed}
  - Other: ${analytics.contentAnalysis.titleAnalysis.languageDetection.other}

## 🔗 URL Analysis

### File Extensions
${Object.entries(analytics.contentAnalysis.urlPatterns.fileExtensions)
  .map(([ext, count]) => `- **.${ext}**: ${count}`)
  .join('\n')}

### Domains
${Object.entries(analytics.contentAnalysis.urlPatterns.domains)
  .map(([domain, count]) => `- **${domain}**: ${count}`)
  .join('\n')}

## ✅ Data Quality Metrics

### Completeness
- Items with titles: ${analytics.qualityMetrics.completeness.withTitle}
- Items with speakers: ${analytics.qualityMetrics.completeness.withSpeaker}
- Items with categories: ${analytics.qualityMetrics.completeness.withCategory}
- Items with descriptions: ${analytics.qualityMetrics.completeness.withDescription}

### URL Quality
- Valid URLs: ${analytics.qualityMetrics.urlQuality.validUrls}
- Invalid URLs: ${analytics.qualityMetrics.urlQuality.invalidUrls}
- HTTPS URLs: ${analytics.qualityMetrics.urlQuality.httpsUrls}
- HTTP URLs: ${analytics.qualityMetrics.urlQuality.httpUrls}

### Duplicates
- Duplicate titles: ${analytics.qualityMetrics.duplicates.duplicateTitles}
- Duplicate URLs: ${analytics.qualityMetrics.duplicates.duplicateUrls}
- Unique titles: ${analytics.qualityMetrics.duplicates.uniqueTitles}
- Unique URLs: ${analytics.qualityMetrics.duplicates.uniqueUrls}

---

*This report was automatically generated by the Myanmar Dhamma Catalog analytics system.*
`;

    await fs.writeFile("data/analytics_report.md", report);
  }

  close(): void {
    this.dbBuilder.close();
  }
}

// Main execution
async function main() {
  let analytics: AnalyticsGenerator | null = null;
  
  try {
    analytics = new AnalyticsGenerator();
    await analytics.generateComprehensiveAnalytics();
    
    console.log("\n🎉 Complete! Your Myanmar Dhamma Catalog is ready.");
    console.log("\n📁 Generated Files:");
    console.log("  📊 data/dhamma_dataset.csv - Main CSV dataset");
    console.log("  🗄️ data/dhamma_dataset.db - SQLite database");
    console.log("  📈 data/analytics_report.md - Detailed analytics report");
    console.log("  📋 data/comprehensive_analytics.json - Raw analytics data");
    
  } catch (error) {
    console.error("💥 Analytics generation failed:", error);
    process.exit(1);
  } finally {
    if (analytics) {
      analytics.close();
    }
  }
}

if (require.main === module) {
  main();
}

export { AnalyticsGenerator };
