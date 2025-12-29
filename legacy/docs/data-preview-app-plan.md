# Myanmar Dhamma Catalog - Data Preview App Plan

**Project**: myanmar-dhamma-catalog-preview  
**Goal**: Create a Next.js web application to preview and validate scraped dhamma database  
**Technology**: Next.js 14 + TypeScript + SQLite + Context7  
**Date**: June 22, 2025

---

## 🎯 Objectives

**What the preview app WILL do:**

- ✅ Display scraped dhamma content in an intuitive web interface
- ✅ Provide search and filtering capabilities
- ✅ Show data quality metrics and validation results
- ✅ Allow editing/correction of metadata
- ✅ Preview audio/video links (without downloading)
- ✅ Export corrected data back to database
- ✅ Generate data quality reports

**What it WON'T do:**

- ❌ Stream or download actual media files
- ❌ Complex audio/video processing
- ❌ User authentication (single-user tool)
- ❌ Real-time scraping integration

---

## 📁 Project Structure

```
myanmar-dhamma-catalog/
├── data-preview-app/                  # New Next.js app folder
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Dashboard
│   │   │   ├── browse/
│   │   │   │   └── page.tsx           # Browse all content
│   │   │   ├── search/
│   │   │   │   └── page.tsx           # Advanced search
│   │   │   ├── speakers/
│   │   │   │   ├── page.tsx           # Speakers list
│   │   │   │   └── [id]/page.tsx      # Speaker details
│   │   │   ├── categories/
│   │   │   │   ├── page.tsx           # Categories list
│   │   │   │   └── [id]/page.tsx      # Category details
│   │   │   ├── quality/
│   │   │   │   └── page.tsx           # Data quality checks
│   │   │   ├── edit/
│   │   │   │   └── [id]/page.tsx      # Edit content item
│   │   │   └── api/
│   │   │       ├── content/
│   │   │       │   ├── route.ts       # GET /api/content
│   │   │       │   └── [id]/route.ts  # GET/PUT /api/content/[id]
│   │   │       ├── search/route.ts    # POST /api/search
│   │   │       ├── speakers/route.ts  # GET /api/speakers
│   │   │       ├── categories/route.ts # GET /api/categories
│   │   │       └── quality/route.ts   # GET /api/quality
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   └── pagination.tsx
│   │   │   ├── content/
│   │   │   │   ├── ContentCard.tsx
│   │   │   │   ├── ContentTable.tsx
│   │   │   │   ├── ContentPreview.tsx
│   │   │   │   └── ContentEdit.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchForm.tsx
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCards.tsx
│   │   │   │   ├── RecentItems.tsx
│   │   │   │   └── QualityMetrics.tsx
│   │   │   ├── quality/
│   │   │   │   ├── QualityReport.tsx
│   │   │   │   ├── ValidationResults.tsx
│   │   │   │   └── DataCorrection.tsx
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       ├── Navigation.tsx
│   │   │       └── Footer.tsx
│   │   ├── lib/
│   │   │   ├── database.ts            # SQLite connection & queries
│   │   │   ├── types.ts               # Shared types
│   │   │   ├── utils.ts               # Utility functions
│   │   │   ├── validation.ts          # Data validation logic
│   │   │   └── export.ts              # Data export functions
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   │   ├── favicon.ico
│   │   └── images/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── README.md
└── ... (existing project structure)
```

---

## 🚀 Phase 1: Setup & Foundation (Day 1)

### 1.1 Initialize Next.js Project

```bash
# Create new Next.js app in data-preview-app folder
cd myanmar-dhamma-catalog
npx create-next-app@latest data-preview-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd data-preview-app
```

### 1.2 Install Dependencies

```bash
# Database & utilities
npm install better-sqlite3 @types/better-sqlite3
npm install lucide-react class-variance-authority clsx tailwind-merge

# UI components (using shadcn/ui)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input table badge pagination textarea select checkbox

# Data validation & processing
npm install zod date-fns
npm install react-hook-form @hookform/resolvers

# Charts and visualization (optional)
npm install recharts

# Context7 integration for up-to-date docs
npm install @upstash/context7-mcp
```

### 1.3 Configure Context7

Add to VS Code settings or configure for your editor:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

### 1.4 Database Connection Setup

Create `src/lib/database.ts`:

```typescript
import Database from "better-sqlite3";
import path from "path";
import { ContentItem, DatabaseStats } from "./types";

export class DhammaDatabase {
  private db: Database.Database;

  constructor() {
    // Connect to existing SQLite database
    const dbPath = path.join(process.cwd(), "..", "data", "dhamma_dataset.db");
    this.db = new Database(dbPath, { readonly: false });
  }

  // Get all content with pagination
  getContent(
    page = 1,
    limit = 20,
    filters?: ContentFilters
  ): {
    items: ContentItem[];
    total: number;
    totalPages: number;
  } {
    // Implementation here
  }

  // Search content
  searchContent(query: string, filters?: ContentFilters): ContentItem[] {
    // Implementation here
  }

  // Get by ID
  getContentById(id: number): ContentItem | null {
    // Implementation here
  }

  // Update content
  updateContent(id: number, updates: Partial<ContentItem>): boolean {
    // Implementation here
  }

  // Get statistics
  getStatistics(): DatabaseStats {
    // Implementation here
  }

  // Data quality checks
  getQualityIssues(): QualityIssue[] {
    // Implementation here
  }

  close() {
    this.db.close();
  }
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
```

---

## 🚀 Phase 2: Core Components (Day 2)

### 2.1 Dashboard Page

Create `src/app/page.tsx`:

```typescript
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentItems } from '@/components/dashboard/RecentItems';
import { QualityMetrics } from '@/components/dashboard/QualityMetrics';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Myanmar Dhamma Catalog</h1>
        <p className="text-muted-foreground">
          Preview and validate scraped dhamma content
        </p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentItems />
        <QualityMetrics />
      </div>
    </div>
  );
}
```

### 2.2 Content Table Component

Create `src/components/content/ContentTable.tsx`:

```typescript
import { ContentItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Play } from 'lucide-react';

interface ContentTableProps {
  items: ContentItem[];
  onEdit: (id: number) => void;
  onPreview: (item: ContentItem) => void;
}

export function ContentTable({ items, onEdit, onPreview }: ContentTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-4">Title</th>
            <th className="text-left p-4">Speaker</th>
            <th className="text-left p-4">Type</th>
            <th className="text-left p-4">Category</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-muted/30">
              <td className="p-4">
                <div className="max-w-md">
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {item.id}
                  </div>
                </div>
              </td>
              <td className="p-4">{item.speaker || 'Unknown'}</td>
              <td className="p-4">
                <Badge variant="outline">{item.contentType}</Badge>
              </td>
              <td className="p-4">{item.category || 'Uncategorized'}</td>
              <td className="p-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPreview(item)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item.id!)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a href={item.fileUrl} target="_blank" rel="noopener">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 2.3 Search & Filter Components

Create `src/components/search/SearchForm.tsx`:

```typescript
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: string, filters: ContentFilters) => void;
  speakers: string[];
  categories: string[];
}

export function SearchForm({ onSearch, speakers, categories }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ContentFilters>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search titles, speakers, or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={filters.contentType || ''}
          onValueChange={(value) =>
            setFilters({ ...filters, contentType: value || undefined })
          }
        >
          <option value="">All Types</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
          <option value="ebook">E-book</option>
        </Select>

        <Select
          value={filters.speaker || ''}
          onValueChange={(value) =>
            setFilters({ ...filters, speaker: value || undefined })
          }
        >
          <option value="">All Speakers</option>
          {speakers.map(speaker => (
            <option key={speaker} value={speaker}>{speaker}</option>
          ))}
        </Select>

        <Select
          value={filters.category || ''}
          onValueChange={(value) =>
            setFilters({ ...filters, category: value || undefined })
          }
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setQuery('');
            setFilters({});
            onSearch('', {});
          }}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
```

---

## 🚀 Phase 3: Data Quality & Validation (Day 3)

### 3.1 Quality Check Page

Create `src/app/quality/page.tsx`:

```typescript
import { QualityReport } from '@/components/quality/QualityReport';
import { ValidationResults } from '@/components/quality/ValidationResults';
import { DataCorrection } from '@/components/quality/DataCorrection';

export default function QualityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Quality</h1>
        <p className="text-muted-foreground">
          Review and fix data quality issues
        </p>
      </div>

      <QualityReport />
      <ValidationResults />
      <DataCorrection />
    </div>
  );
}
```

### 3.2 Quality Validation Logic

Create `src/lib/validation.ts`:

```typescript
import { ContentItem } from "./types";
import { QualityIssue } from "./database";

export class DataValidator {
  validateContent(item: ContentItem): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check for missing speaker
    if (!item.speaker || item.speaker.trim() === "") {
      issues.push({
        id: Date.now(),
        type: "missing_speaker",
        severity: "medium",
        description: "Content has no speaker assigned",
        suggestedFix: 'Add speaker name or set to "Unknown"',
        contentId: item.id!
      });
    }

    // Check for invalid URLs
    if (!this.isValidUrl(item.fileUrl)) {
      issues.push({
        id: Date.now() + 1,
        type: "invalid_url",
        severity: "high",
        description: "File URL appears to be invalid",
        suggestedFix: "Verify and update the URL",
        contentId: item.id!
      });
    }

    // Check for empty titles
    if (!item.title || item.title.trim() === "") {
      issues.push({
        id: Date.now() + 2,
        type: "empty_title",
        severity: "high",
        description: "Content has no title",
        suggestedFix: "Add a descriptive title",
        contentId: item.id!
      });
    }

    // Check for suspicious content (too short titles, etc.)
    if (item.title && item.title.trim().length < 5) {
      issues.push({
        id: Date.now() + 3,
        type: "suspicious_content",
        severity: "low",
        description: "Title seems too short",
        suggestedFix: "Review and expand title if needed",
        contentId: item.id!
      });
    }

    return issues;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateDatabase(items: ContentItem[]): {
    totalIssues: number;
    issuesByType: Record<string, number>;
    duplicateTitles: Array<{ title: string; count: number; ids: number[] }>;
    duplicateUrls: Array<{ url: string; count: number; ids: number[] }>;
  } {
    const allIssues = items.flatMap((item) => this.validateContent(item));

    const issuesByType = allIssues.reduce(
      (acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Find duplicates
    const titleCounts = new Map<string, number[]>();
    const urlCounts = new Map<string, number[]>();

    items.forEach((item) => {
      if (item.title) {
        const ids = titleCounts.get(item.title) || [];
        ids.push(item.id!);
        titleCounts.set(item.title, ids);
      }

      if (item.fileUrl) {
        const ids = urlCounts.get(item.fileUrl) || [];
        ids.push(item.id!);
        urlCounts.set(item.fileUrl, ids);
      }
    });

    const duplicateTitles = Array.from(titleCounts.entries())
      .filter(([_, ids]) => ids.length > 1)
      .map(([title, ids]) => ({ title, count: ids.length, ids }));

    const duplicateUrls = Array.from(urlCounts.entries())
      .filter(([_, ids]) => ids.length > 1)
      .map(([url, ids]) => ({ url, count: ids.length, ids }));

    return {
      totalIssues: allIssues.length,
      issuesByType,
      duplicateTitles,
      duplicateUrls
    };
  }
}
```

### 3.3 Content Edit Form

Create `src/app/edit/[id]/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContentEdit } from '@/components/content/ContentEdit';
import { ContentItem } from '@/lib/types';

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [params.id]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates: Partial<ContentItem>) => {
    try {
      const response = await fetch(`/api/content/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        router.push('/browse');
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!content) return <div>Content not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Content</h1>
        <p className="text-muted-foreground">
          Update metadata for: {content.title}
        </p>
      </div>

      <ContentEdit
        content={content}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </div>
  );
}
```

---

## 🚀 Phase 4: API Routes & Data Layer (Day 4)

### 4.1 Content API Routes

Create `src/app/api/content/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { DhammaDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const filters = {
    contentType: searchParams.get("contentType") || undefined,
    speaker: searchParams.get("speaker") || undefined,
    category: searchParams.get("category") || undefined
  };

  const db = new DhammaDatabase();
  try {
    const result = db.getContent(page, limit, filters);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  } finally {
    db.close();
  }
}
```

Create `src/app/api/content/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { DhammaDatabase } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = new DhammaDatabase();
  try {
    const content = db.getContentById(parseInt(params.id));
    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  } finally {
    db.close();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const updates = await request.json();
  const db = new DhammaDatabase();

  try {
    const success = db.updateContent(parseInt(params.id), updates);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update content" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  } finally {
    db.close();
  }
}
```

### 4.2 Search API Route

Create `src/app/api/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { DhammaDatabase } from "@/lib/database";

export async function POST(request: NextRequest) {
  const { query, filters } = await request.json();

  const db = new DhammaDatabase();
  try {
    const results = db.searchContent(query, filters);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  } finally {
    db.close();
  }
}
```

### 4.3 Quality API Route

Create `src/app/api/quality/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { DhammaDatabase } from "@/lib/database";
import { DataValidator } from "@/lib/validation";

export async function GET() {
  const db = new DhammaDatabase();
  const validator = new DataValidator();

  try {
    const allContent = db.getContent(1, 10000); // Get all for validation
    const qualityReport = validator.validateDatabase(allContent.items);

    return NextResponse.json(qualityReport);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate quality report" },
      { status: 500 }
    );
  } finally {
    db.close();
  }
}
```

---

## 🚀 Phase 5: Advanced Features (Day 5)

### 5.1 Data Export Functionality

Create `src/lib/export.ts`:

```typescript
import { ContentItem } from "./types";

export class DataExporter {
  exportToCSV(items: ContentItem[]): string {
    const headers = [
      "id",
      "title",
      "speaker",
      "contentType",
      "fileUrl",
      "language",
      "category",
      "description",
      "sourcePage",
      "scrapedDate"
    ];

    const csvRows = [
      headers.join(","),
      ...items.map((item) =>
        headers
          .map((header) =>
            JSON.stringify(item[header as keyof ContentItem] || "")
          )
          .join(",")
      )
    ];

    return csvRows.join("\n");
  }

  exportToJSON(items: ContentItem[]): string {
    return JSON.stringify(items, null, 2);
  }

  downloadFile(content: string, filename: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
```

### 5.2 Bulk Operations

Create `src/components/content/BulkActions.tsx`:

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface BulkActionsProps {
  selectedIds: number[];
  onBulkUpdate: (updates: Partial<ContentItem>) => void;
  onBulkDelete: (ids: number[]) => void;
  onExport: (ids: number[]) => void;
}

export function BulkActions({
  selectedIds,
  onBulkUpdate,
  onBulkDelete,
  onExport
}: BulkActionsProps) {
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkSpeaker, setBulkSpeaker] = useState('');

  const handleBulkCategoryUpdate = () => {
    if (bulkCategory && selectedIds.length > 0) {
      onBulkUpdate({ category: bulkCategory });
      setBulkCategory('');
    }
  };

  const handleBulkSpeakerUpdate = () => {
    if (bulkSpeaker && selectedIds.length > 0) {
      onBulkUpdate({ speaker: bulkSpeaker });
      setBulkSpeaker('');
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {selectedIds.length} item(s) selected
        </span>

        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={bulkCategory}
              onValueChange={setBulkCategory}
              placeholder="Set Category"
            >
              <option value="">Select category...</option>
              <option value="အဘိဓမ္မာ">အဘိဓမ္မာ</option>
              <option value="အသံတရား">အသံတရား</option>
              <option value="ရုပ်မြင်သံကြားတရား">ရုပ်မြင်သံကြားတရား</option>
            </Select>
            <Button onClick={handleBulkCategoryUpdate} size="sm">
              Update Category
            </Button>
          </div>

          <Button
            onClick={() => onExport(selectedIds)}
            variant="outline"
            size="sm"
          >
            Export Selected
          </Button>

          <Button
            onClick={() => onBulkDelete(selectedIds)}
            variant="destructive"
            size="sm"
          >
            Delete Selected
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 5.3 Advanced Analytics Dashboard

Create `src/components/dashboard/AdvancedAnalytics.tsx`:

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsProps {
  stats: {
    contentByType: Array<{ type: string; count: number }>;
    contentByYear: Array<{ year: string; count: number }>;
    topSpeakers: Array<{ speaker: string; count: number }>;
    qualityScore: number;
  };
}

export function AdvancedAnalytics({ stats }: AnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content by Type</CardTitle>
            <CardDescription>Distribution of content types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.contentByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Speakers</CardTitle>
            <CardDescription>Most prolific content creators</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topSpeakers.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="speaker" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Quality Score</CardTitle>
          <CardDescription>Overall quality of the dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600">
            {stats.qualityScore}%
          </div>
          <p className="text-muted-foreground">
            Based on completeness, validity, and consistency metrics
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔧 Configuration Files

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  // Enable SQLite in serverless functions
  webpack: (config) => {
    config.externals.push({
      "better-sqlite3": "commonjs better-sqlite3"
    });
    return config;
  }
};

module.exports = nextConfig;
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "context7": "npx @upstash/context7-mcp"
  }
}
```

---

## 🚀 Implementation Timeline

| Day | Task                                                       | Deliverable                     |
| --- | ---------------------------------------------------------- | ------------------------------- |
| 1   | Setup Next.js, install dependencies, configure Context7    | Working development environment |
| 2   | Create core components (Dashboard, ContentTable, Search)   | Basic UI components             |
| 3   | Implement data quality validation and editing features     | Quality checking system         |
| 4   | Build API routes and database integration                  | Functional backend              |
| 5   | Add advanced features (export, bulk operations, analytics) | Complete preview app            |

---

## 🎯 Key Features Summary

### Core Functionality

- ✅ **Browse Content**: Paginated table view of all scraped content
- ✅ **Search & Filter**: Full-text search with advanced filtering
- ✅ **Content Preview**: Quick preview of media links without downloading
- ✅ **Edit Metadata**: In-place editing of content information
- ✅ **Data Quality**: Automated validation and issue detection

### Data Management

- ✅ **Quality Reports**: Comprehensive data quality analysis
- ✅ **Bulk Operations**: Update multiple items simultaneously
- ✅ **Export Functions**: CSV/JSON export with filtering
- ✅ **Duplicate Detection**: Find and manage duplicate content
- ✅ **Validation Rules**: Customizable data validation

### User Experience

- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Fast Performance**: Optimized queries and pagination
- ✅ **Intuitive Interface**: Clean, modern UI with Tailwind CSS
- ✅ **Real-time Updates**: Immediate feedback on changes
- ✅ **Context7 Integration**: Up-to-date documentation access

---

## 🚀 Quick Start Commands

```bash
# 1. Create and setup the app
cd myanmar-dhamma-catalog
npx create-next-app@latest data-preview-app --typescript --tailwind --eslint --app --src-dir
cd data-preview-app

# 2. Install dependencies
npm install better-sqlite3 @types/better-sqlite3 lucide-react zod date-fns

# 3. Setup shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input table badge pagination

# 4. Configure Context7 (for up-to-date Next.js docs)
npm install @upstash/context7-mcp

# 5. Start development
npm run dev
```

---

## 🎨 Design Considerations

### UI/UX Principles

- **Clean & Minimal**: Focus on content, not decoration
- **Myanmar Text Support**: Proper Unicode rendering for Myanmar text
- **Accessibility**: WCAG compliant components
- **Performance**: Efficient data loading and rendering
- **Mobile-First**: Responsive design for all devices

### Technical Decisions

- **Next.js 14**: Latest App Router for modern React development
- **TypeScript**: Type safety throughout the application
- **Tailwind CSS**: Utility-first styling with shadcn/ui components
- **SQLite**: Direct database access for fast queries
- **Server Actions**: Modern data mutations with React Server Components

---

## 📈 Success Metrics

- ✅ Load 38,000+ content items efficiently
- ✅ Search response time < 200ms
- ✅ Quality validation covers 100% of data
- ✅ Edit operations complete in < 1 second
- ✅ Export functionality for filtered datasets
- ✅ Mobile responsive interface
- ✅ Context7 integration for development assistance

---

This plan provides a comprehensive roadmap for building a professional data preview app that will help you validate and manage your Myanmar dhamma catalog effectively. The integration with Context7 ensures you'll have access to the latest Next.js documentation and best practices throughout development.
