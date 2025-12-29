"use client";

import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search } from "lucide-react";

interface SpeakerStats {
  speaker: string;
  count: number;
}

export default function SpeakersPage() {
  const [speakerStats, setSpeakerStats] = useState<SpeakerStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch speakers from API, optional search filter
  const fetchSpeakers = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const url = new URL("/api/speakers", window.location.origin);
      if (query) url.searchParams.set("search", query);
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch speakers");
      const data: SpeakerStats[] = await res.json();
      setSpeakerStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpeakers();
  }, [fetchSpeakers]);

  const handleSearch = () => {
    fetchSpeakers(searchQuery);
  };

  // Trigger search on Enter key via form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Speakers</h1>
          <p className="text-muted-foreground">
            Browse content by speaker and view statistics
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Speakers</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder="Search speakers..."
                className="pl-8"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Speaker Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Speaker Statistics</CardTitle>
          <CardDescription>Content count per speaker</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {speakerStats.map((speaker) => (
              <div
                key={speaker.speaker}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="font-medium">{speaker.speaker}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {speaker.count} content{speaker.count !== 1 ? "s" : ""}
                  </Badge>
                  <Link
                    href={`/search?speaker=${encodeURIComponent(speaker.speaker)}`}
                  >
                    <Button variant="outline" size="sm">
                      View Content
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
