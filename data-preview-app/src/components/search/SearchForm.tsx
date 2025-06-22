"use client";

import { useState, useEffect } from "react";
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
import { Search, ExternalLink, Edit, Play } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { ContentItem, ContentFilters } from "@/lib/types";

export function SearchForm() {
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("q", query);

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

  const handlePreview = (item: ContentItem) => {
    window.open(item.fileUrl, "_blank");
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
                  <TableHead>Title</TableHead>
                  <TableHead>Speaker</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {item.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.speaker || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.contentType}</Badge>
                    </TableCell>
                    <TableCell>{item.category || "Uncategorized"}</TableCell>
                    <TableCell>{item.language}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(item)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
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
