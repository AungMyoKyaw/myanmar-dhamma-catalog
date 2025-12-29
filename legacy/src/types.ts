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

export interface ScrapingConfig {
  baseUrls: string[];
  delayBetweenRequests: number;
  userAgent?: string;
}

export interface DatabaseStats {
  totalRecords: number;
  contentTypes: Record<string, number>;
  languages: Record<string, number>;
  sourcePages: Record<string, number>;
  topSpeakers?: Array<{ speaker: string; count: number }>;
}
