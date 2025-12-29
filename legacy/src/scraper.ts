import axios from "axios";
import * as cheerio from "cheerio";
import type { ContentItem, ScrapingConfig } from "./types";
import fs from "fs-extra";
import { SqliteBuilder } from "./sqliteBuilder";

class DhammaScraper {
  private config: ScrapingConfig = {
    baseUrls: [
      "https://www.dhammadownload.com/AudioInMyanmar.htm",
      "https://www.dhammadownload.com/VideoInMyanmar.htm",
      "https://www.dhammadownload.com/EBooksInMyanmar.htm",
      "https://www.dhammadownload.com/AbhidhammaInMyanmar.htm"
    ],
    delayBetweenRequests: 2000,
    userAgent:
      "Mozilla/5.0 (compatible; Myanmar-Dhamma-Catalog/1.0; Educational Purpose)"
  };

  async scrapeContent(): Promise<ContentItem[]> {
    const allContent: ContentItem[] = [];

    console.log("🚀 Starting Myanmar Dhamma content scraping...");
    console.log(`📊 Will scrape ${this.config.baseUrls.length} main pages`);

    for (const [index, url] of this.config.baseUrls.entries()) {
      console.log(
        `\n📖 [${index + 1}/${this.config.baseUrls.length}] Scraping main page: ${url}`
      );

      // Respectful delay between requests
      if (index > 0) {
        console.log(`⏳ Waiting ${this.config.delayBetweenRequests}ms...`);
        await this.delay(this.config.delayBetweenRequests);
      }

      try {
        // Step 1: Get the main page and extract subpage links
        const subpageUrls = await this.extractSubpageUrls(url);
        console.log(`📄 Found ${subpageUrls.length} subpages to scrape`);

        // Step 2: Scrape each subpage for actual media content
        for (const [subIndex, subpageUrl] of subpageUrls.entries()) {
          console.log(
            `  📝 [${subIndex + 1}/${subpageUrls.length}] Scraping subpage: ${subpageUrl.title}`
          );

          // Respectful delay between subpage requests
          if (subIndex > 0) {
            await this.delay(1000); // Shorter delay for subpages
          }

          try {
            const subpageContent = await this.scrapeSubpage(subpageUrl, url);
            console.log(`    ✅ Found ${subpageContent.length} media items`);
            allContent.push(...subpageContent);
          } catch (error) {
            console.error(
              `    ❌ Error scraping subpage ${subpageUrl.url}:`,
              error instanceof Error ? error.message : error
            );
          }
        }
      } catch (error) {
        console.error(
          `❌ Error scraping main page ${url}:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    console.log(
      `\n🎉 Scraping complete! Total items found: ${allContent.length}`
    );
    return allContent;
  }

  private async extractSubpageUrls(
    mainPageUrl: string
  ): Promise<Array<{ url: string; title: string }>> {
    const response = await axios.get(mainPageUrl, {
      headers: {
        "User-Agent": this.config.userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive"
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const subpageUrls: Array<{ url: string; title: string }> = [];

    // Look for links to .htm files that are likely subpages
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");
      const title = $(element).text().trim();

      if (
        href?.endsWith(".htm") &&
        !href.includes("mailto") &&
        title &&
        title.length > 2
      ) {
        const fullUrl = this.normalizeUrl(href, mainPageUrl);
        // Avoid duplicates and self-references
        if (
          !subpageUrls.some((item) => item.url === fullUrl) &&
          fullUrl !== mainPageUrl
        ) {
          subpageUrls.push({
            url: fullUrl,
            title: this.cleanTitle(title)
          });
        }
      }
    });

    return subpageUrls;
  }

  private async scrapeSubpage(
    subpage: { url: string; title: string },
    mainPageUrl: string
  ): Promise<ContentItem[]> {
    const response = await axios.get(subpage.url, {
      headers: {
        "User-Agent": this.config.userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive"
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const pageContent: ContentItem[] = [];

    // Extract speaker from page content (improved method)
    const extractedSpeaker = this.extractSpeakerFromPageContent($, subpage);

    // Extract media files from the subpage
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");
      const linkText = $(element).text().trim();

      if (href && this.isMediaFile(href) && linkText && linkText.length > 2) {
        // Try to extract additional context from surrounding elements
        const parent = $(element).parent();
        const description = parent.text().trim();
        const category = this.extractCategoryFromUrl(mainPageUrl);

        const contentItem: ContentItem = {
          title: this.cleanTitle(linkText),
          speaker: extractedSpeaker || undefined,
          contentType: this.getContentType(href),
          fileUrl: this.normalizeUrl(href, subpage.url),
          language: "Myanmar",
          category: category || undefined,
          description: description || undefined,
          sourcePage: subpage.url,
          scrapedDate: new Date().toISOString()
        };

        pageContent.push(contentItem);
      }
    });

    return pageContent;
  }

  private extractSpeakerFromPageContent(
    $: cheerio.Root,
    subpage: { url: string; title: string }
  ): string | null {
    // Use subpage.title if it contains Burmese script (speaker name)
    if (/[\u1000-\u109F]/.test(subpage.title)) {
      return this.cleanSpeakerName(subpage.title);
    }
    if (/[\u1000-\u109F]/.test(subpage.title)) {
      // Remove Burmese numbering prefixes (e.g., “၁၄၁။ ”) and trailing parenthetical parts
      const cleanedTitle = subpage.title
        .replace(/^[\d\s]+[။\.]*/, "")
        .replace(/\s*\(.+\)$/, "")
        .trim();
      return this.cleanSpeakerName(cleanedTitle);
    }
    // Strategy 1: Look for speaker name in page title or headings
    const pageTitle = $("title").text().trim();
    const headings = $("h1, h2, h3")
      .map((_, el) => $(el).text().trim())
      .get();

    // Strategy 2: Look for prominent text that might contain speaker name
    const prominentTexts = [
      pageTitle,
      ...headings,
      $("body").first().text().split("\n")[0]?.trim() || "" // First line of body
    ].filter((text) => text && text.length > 0);

    // Try to extract speaker from each text source
    for (const text of prominentTexts) {
      const speaker = this.extractSpeakerFromText(text);
      if (speaker && this.isValidSpeakerName(speaker)) {
        console.log(`    🎯 Extracted speaker "${speaker}" from page content`);
        return speaker;
      }
    }

    // Strategy 3: Fall back to extracting from subpage title
    const titleSpeaker = this.extractSpeakerFromTitle(subpage.title);
    if (titleSpeaker && this.isValidSpeakerName(titleSpeaker)) {
      console.log(`    📝 Extracted speaker "${titleSpeaker}" from page title`);
      return titleSpeaker;
    }

    // Strategy 4: Try to extract from URL patterns
    const urlSpeaker = this.extractSpeakerFromUrl(subpage.url);
    if (urlSpeaker && this.isValidSpeakerName(urlSpeaker)) {
      console.log(`    🔗 Extracted speaker "${urlSpeaker}" from URL`);
      return urlSpeaker;
    }

    console.log(`    ⚠️ Could not extract speaker for page: ${subpage.title}`);
    // Fallback: use cleaned subpage.title as speaker
    console.log(
      `    🔄 Falling back to subpage title for speaker: ${subpage.title}`
    );
    const fallbackName = this.cleanSpeakerName(
      subpage.title
        .replace(/^[\d\s]+[။\.]*/, "")
        .replace(/\s*\(.+\)$/, "")
        .trim()
    );
    return fallbackName;
  }

  private extractSpeakerFromTitle(title: string): string | null {
    // Extract speaker name from subpage title (e.g., "MogokSayadaw-mp3" -> "Mogok Sayadaw")
    const cleaned = title
      .replace(/-mp3|-video|-ebook/gi, "")
      .replace(/([A-Z])/g, " $1")
      .trim();

    if (cleaned.length > 2 && cleaned.length < 100) {
      return cleaned;
    }

    return null;
  }

  private extractSpeakerFromText(text: string): string | null {
    const cleanedText = text.replace(/\s+/g, " ").trim();

    // Pattern 1: Look for Myanmar Buddhist titles
    const titlePatterns = [
      /(?:Venerable|Ven\.?|Sayadaw|Ashin|U)\s+([^,\n\r\-\(\)]{3,50})/i,
      /Dr\.?\s+([^,\n\r\-\(\)]{3,50})/i,
      /Professor\s+([^,\n\r\-\(\)]{3,50})/i
    ];

    for (const pattern of titlePatterns) {
      const match = cleanedText.match(pattern);
      if (match?.[1]) {
        return this.cleanSpeakerName(
          `${match[0].split(" ")[0]} ${match[1].trim()}`
        );
      }
    }

    // Pattern 2: Look for speaker indicators
    const speakerPatterns = [
      /by\s+([^,\n\r\-\(\)]{3,50})/i,
      /speaker:\s*([^,\n\r\-\(\)]{3,50})/i,
      /teacher:\s*([^,\n\r\-\(\)]{3,50})/i,
      /taught\s+by\s+([^,\n\r\-\(\)]{3,50})/i
    ];

    for (const pattern of speakerPatterns) {
      const match = cleanedText.match(pattern);
      if (match?.[1]) {
        return this.cleanSpeakerName(match[1].trim());
      }
    }

    // Pattern 3: Extended Burmese honorifics and names
    const burmesePatterns = [
      /(?:ပါမောက္ခချုပ်ဆရာတော်ကြီး)\s*([\p{Script=Myanmar}\s]{1,100})/u,
      /(?:ဘဒ္ဒန္တ)\s*([\p{Script=Myanmar}\s]{1,100})/u,
      /(?:ဒေါက်တာ)\s*([\p{Script=Myanmar}\s]{1,100})/u,
      /(?:ဆရာတော်)\s*([\p{Script=Myanmar}\s]{1,50})/u,
      /(?:ဦး)\s*([\p{Script=Myanmar}\s]{1,50})/u
    ];
    for (const pattern of burmesePatterns) {
      const match = cleanedText.match(pattern);
      if (match?.[1]) {
        return this.cleanSpeakerName(match[0].trim());
      }
    }

    // Fallback: if any Burmese script character present, accept as speaker name
    if (/\p{Script=Myanmar}/u.test(cleanedText)) {
      return this.cleanSpeakerName(cleanedText);
    }
    // Pattern 4: If the text looks like a speaker name (reasonable length, no dates/numbers)
    if (
      cleanedText.length >= 3 &&
      cleanedText.length <= 100 &&
      !cleanedText.match(/\d{4}|\d{2}\/\d{2}/) && // No dates
      !cleanedText.match(/^(mp3|video|audio|download)/i)
    ) {
      // Not file type indicators
      return this.cleanSpeakerName(cleanedText);
    }

    return null;
  }

  private extractSpeakerFromUrl(url: string): string | null {
    // Extract speaker name from URL patterns like "/Dr-Nandamalabhivamsa.htm"
    const urlMatch = url.match(/\/([^\/]+)\.htm?$/);
    if (urlMatch?.[1]) {
      const urlPart = urlMatch[1];
      // Convert URL-encoded names to readable format
      const readable = urlPart
        .replace(/-/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capitals
        .trim();

      if (readable.length >= 3 && readable.length <= 100) {
        return this.cleanSpeakerName(readable);
      }
    }
    return null;
  }

  private cleanSpeakerName(name: string): string {
    return (
      name
        .replace(/\s+/g, " ") // Normalize whitespace
        // Keep all unicode letters, combining marks, spaces, dots and hyphens
        .replace(/[^\p{L}\p{M}\s.\-]/gu, "")
        .trim()
        .substring(0, 100)
    ); // Limit length
  }

  private isValidSpeakerName(name: string): boolean {
    if (!name || name.length < 3 || name.length > 100) return false;

    // Reject if it's clearly not a speaker name
    const invalidPatterns = [
      /^\d+$/, // Only numbers
      /^(mp3|video|audio|download|file|htm|html)$/i, // File type indicators
      /^\d{4}(-\d{2}){0,2}$/, // Dates like 2024, 2024-01, 2024-01-01
      /^(page|content|media|link|website)$/i // Generic web terms
    ];

    return !invalidPatterns.some((pattern) => pattern.test(name.trim()));
  }

  private isMediaFile(url: string): boolean {
    return /\.(mp3|mp4|wav|m4a|pdf|epub|doc|docx)$/i.test(url);
  }

  private getContentType(url: string): ContentItem["contentType"] {
    if (/\.(mp3|wav|m4a)$/i.test(url)) return "audio";
    if (/\.mp4$/i.test(url)) return "video";
    if (/\.(pdf|epub|doc|docx)$/i.test(url)) return "ebook";
    return "other";
  }

  private normalizeUrl(href: string, basePage: string): string {
    try {
      if (href.startsWith("http")) return href;
      const baseUrl = new URL(basePage).origin;
      return new URL(href, baseUrl).toString();
    } catch {
      console.warn(`⚠️ Could not normalize URL: ${href}`);
      return href;
    }
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/\s+/g, " ")
      .replace(/[\r\n\t]/g, "")
      .trim()
      .substring(0, 500); // Limit title length
  }

  private extractCategoryFromUrl(url: string): string | null {
    // Extract category from URL pattern
    if (url.includes("Audio")) return "Audio";
    if (url.includes("Video")) return "Video";
    if (url.includes("EBooks")) return "EBook";
    if (url.includes("Abhidhamma")) return "Abhidhamma";
    return null;
  }

  private extractSpeaker(
    parentElement: cheerio.Cheerio,
    _$: cheerio.CheerioAPI
  ): string | null {
    // Try to find speaker information in surrounding text
    const text = parentElement.text();
    const patterns = [
      /by\s+([^,\n\r]+)/i,
      /speaker:\s*([^,\n\r]+)/i,
      /teacher:\s*([^,\n\r]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        return match[1].trim().substring(0, 100);
      }
    }

    return null;
  }

  private extractDescription(
    parentElement: cheerio.Cheerio,
    _$: cheerio.CheerioAPI
  ): string | null {
    // Try to extract description from nearby text
    const siblings = parentElement.siblings();
    const description = siblings.text().trim();

    if (description && description.length > 10 && description.length < 1000) {
      return description;
    }

    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async saveRawData(content: ContentItem[]): Promise<void> {
    try {
      await fs.ensureDir("data/raw");

      // Save main data
      await fs.writeJson("data/raw/scraped_content.json", content, {
        spaces: 2
      });

      // Save metadata
      const metadata = {
        scrapedAt: new Date().toISOString(),
        totalItems: content.length,
        contentTypes: this.groupBy(content, "contentType"),
        categories: this.groupBy(content, "category"),
        speakers: this.groupBy(content, "speaker"),
        sourcePages: this.groupBy(content, "sourcePage"),
        config: this.config
      };

      await fs.writeJson("data/raw/scraping_metadata.json", metadata, {
        spaces: 2
      });

      console.log(
        `💾 Saved ${content.length} items to data/raw/scraped_content.json`
      );
      console.log("� Saved metadata to data/raw/scraping_metadata.json");
    } catch (error) {
      console.error("❌ Error saving raw data:", error);
      throw error;
    }
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
}

// Main execution
async function main() {
  try {
    const scraper = new DhammaScraper();
    const content = await scraper.scrapeContent();
    await scraper.saveRawData(content);

    // Update SQLite database with scraped content
    console.log("📥 Updating SQLite database with new content...");
    const builder = new SqliteBuilder();
    await builder.insertFromJson();
    await builder.saveStatistics();
    builder.close();

    console.log("\n🎯 Next steps:");
    console.log("  npm run generate-csv  # Generate CSV dataset");
    console.log("  npm run analytics     # Generate detailed analytics");
    console.log("  npm run all           # Run complete pipeline");
  } catch (error) {
    console.error("💥 Scraping failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DhammaScraper };
