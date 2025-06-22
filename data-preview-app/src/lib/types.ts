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

export interface DatabaseStats {
  totalRecords: number;
  contentTypes: Record<string, number>;
  languages: Record<string, number>;
  sourcePages: Record<string, number>;
  topSpeakers?: Array<{ speaker: string; count: number }>;
}

export interface ContentFilters {
  contentType?: string;
  speaker?: string;
  category?: string;
  language?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface QualityIssue {
  id: number;
  type:
    | "missing_speaker"
    | "invalid_url"
    | "duplicate_title"
    | "empty_title"
    | "suspicious_content";
  severity: "low" | "medium" | "high";
  description: string;
  suggestedFix?: string;
  contentId: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}
