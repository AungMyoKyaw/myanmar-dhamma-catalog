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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Edit } from "lucide-react";
import { TablePlayer } from "./TablePlayer";

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

  const handleEdit = (id: number | undefined) => {
    if (id) {
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
              <TableHead className="w-[300px]">Title & Player</TableHead>
              <TableHead>Speaker</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
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
