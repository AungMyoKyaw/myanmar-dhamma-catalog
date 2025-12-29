"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Save, ArrowLeft } from "lucide-react";
import type { ContentItem } from "@/lib/types";
import Link from "next/link";

interface EditContentFormProps {
  content: ContentItem;
}

export function EditContentForm({ content }: EditContentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: content.title,
    speaker: content.speaker || "",
    contentType: content.contentType,
    language: content.language,
    category: content.category || "",
    tags: content.tags || "",
    description: content.description || "",
    dateRecorded: content.dateRecorded || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/content/${content.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push("/browse");
        router.refresh();
      } else {
        const error = await response.text();
        alert(`Failed to update content: ${error}`);
      }
    } catch (error) {
      console.error("Error updating content:", error);
      alert("Failed to update content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-2">
        <Link href="/browse">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Browse
          </Button>
        </Link>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
          <CardDescription>
            Update the metadata for this content item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="speaker">Speaker</Label>
                  <Input
                    id="speaker"
                    value={formData.speaker}
                    onChange={(e) => handleChange("speaker", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) =>
                      handleChange("contentType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="Comma-separated tags"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateRecorded">Date Recorded</Label>
                <Input
                  id="dateRecorded"
                  type="date"
                  value={formData.dateRecorded}
                  onChange={(e) => handleChange("dateRecorded", e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Link href="/browse">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-1" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Information</CardTitle>
          <CardDescription>Read-only technical details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>File URL</Label>
              <div className="p-2 bg-muted rounded text-sm break-all">
                {content.fileUrl}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Source Page</Label>
              <div className="p-2 bg-muted rounded text-sm break-all">
                {content.sourcePage}
              </div>
            </div>

            <div className="space-y-2">
              <Label>File Size</Label>
              <div className="p-2 bg-muted rounded text-sm">
                {content.fileSizeEstimate
                  ? `${content.fileSizeEstimate} bytes`
                  : "Unknown"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="p-2 bg-muted rounded text-sm">
                {content.durationEstimate
                  ? `${content.durationEstimate} seconds`
                  : "Unknown"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Scraped Date</Label>
              <div className="p-2 bg-muted rounded text-sm">
                {content.scrapedDate}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content ID</Label>
              <div className="p-2 bg-muted rounded text-sm">{content.id}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
