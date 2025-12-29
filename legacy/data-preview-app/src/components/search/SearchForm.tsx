"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { TablePlayer } from "../content/TablePlayer";
import type { ContentItem, ContentFilters } from "@/lib/types";

export function SearchForm() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ContentFilters>({});
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [speakers, setSpeakers] = useState<
    Array<{ speaker: string; count: number }>
  >([]);
  const [categories, setCategories] = useState<
    Array<{ category: string; count: number }>
  >([]);

  useEffect(() => {
    // Load speakers and categories for filters
    Promise.all([
      fetch("/api/speakers").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json())
    ]).then(([speakersData, categoriesData]) => {
      setSpeakers(speakersData);
      setCategories(categoriesData);
    });
  }, []);

  // On first render, if URL has search params, populate form and fetch
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const ct = searchParams.get("contentType") || "";
    const sp = searchParams.get("speaker") || "";
    const cat = searchParams.get("category") || "";
    const lang = searchParams.get("language") || "";
    const initialFilters: ContentFilters = {};
    if (ct) initialFilters.contentType = ct;
    if (sp) initialFilters.speaker = sp;
    if (cat) initialFilters.category = cat;
    if (lang) initialFilters.language = lang;
    if (q || ct || sp || cat || lang) {
      setQuery(q);
      setFilters(initialFilters);
      const run = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          if (q) params.append("q", q);
          if (ct) params.append("contentType", ct);
          if (sp) params.append("speaker", sp);
          if (cat) params.append("category", cat);
          if (lang) params.append("language", lang);
          const res = await fetch(`/api/search?${params}`);
          const data = await res.json();
          setResults(data);
        } catch (e) {
          console.error("Error initial search:", e);
        } finally {
          setLoading(false);
        }
      };
      run();
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow search even if query is empty when filters are provided
    // if no query and no filters, form submission can still proceed (server handles empty result)

    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (query.trim()) {
        searchParams.append("q", query);
      }

      if (filters.contentType)
        searchParams.append("contentType", filters.contentType);
      if (filters.speaker) searchParams.append("speaker", filters.speaker);
      if (filters.category) searchParams.append("category", filters.category);
      if (filters.language) searchParams.append("language", filters.language);

      const response = await fetch(`/api/search?${searchParams}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number | undefined) => {
    if (id) {
      window.location.href = `/edit/${id}`;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search titles, speakers, or content..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                <Search className="w-4 h-4" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, contentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="ebook">eBook</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, speaker: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Speaker" />
                </SelectTrigger>
                <SelectContent>
                  {speakers.map((speakerItem) => (
                    <SelectItem
                      key={speakerItem.speaker}
                      value={speakerItem.speaker}
                    >
                      {speakerItem.speaker} ({speakerItem.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((categoryItem) => (
                    <SelectItem
                      key={categoryItem.category}
                      value={categoryItem.category}
                    >
                      {categoryItem.category} ({categoryItem.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Myanmar">Myanmar</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {Object.keys(filters).length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {Object.entries(filters).map(([key, value]) =>
                  value ? (
                    <Badge key={key} variant="secondary">
                      {key}: {value}
                      <button
                        type="button"
                        className="ml-1 hover:text-destructive"
                        onClick={() =>
                          setFilters({ ...filters, [key]: undefined })
                        }
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({})}
                >
                  Clear all
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({results.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Title & Player</TableHead>
                  <TableHead>Speaker</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((item) => (
                  <TableRow key={item.id} className="align-top">
                    <TableCell className="p-4">
                      <div className="space-y-3">
                        <div>
                          <div className="font-medium truncate text-sm">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {item.id}
                          </div>
                        </div>
                        <TablePlayer item={item} />
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      {item.speaker || "Unknown"}
                    </TableCell>
                    <TableCell className="p-4">
                      {item.category || "Uncategorized"}
                    </TableCell>
                    <TableCell className="p-4">{item.language}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={item.fileUrl} target="_blank" rel="noopener">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="text-muted-foreground">Searching...</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
