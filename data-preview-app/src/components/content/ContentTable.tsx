"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Edit, Play } from "lucide-react";
import type { ContentItem, PaginatedResult } from "@/lib/types";

export function ContentTable() {
  const [data, setData] = useState<PaginatedResult<ContentItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchContentForPage = (page: number) => {
      setLoading(true);
      fetch(`/api/content?page=${page}&limit=20`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching content:", error);
          setLoading(false);
        });
    };

    fetchContentForPage(currentPage);
  }, [currentPage]);

  const handlePreview = (item: ContentItem) => {
    // For now, just open the URL in a new tab
    window.open(item.fileUrl, "_blank");
  };

  const handleEdit = (id: number | undefined) => {
    if (id) {
      // Navigate to edit page
      window.location.href = `/edit/${id}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading content...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Content Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No content items are currently available in the catalog.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Items ({data.total} total)</CardTitle>
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
            {data.items.map((item) => (
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {data.currentPage} of {data.totalPages} ({data.total} items)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === data.totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
