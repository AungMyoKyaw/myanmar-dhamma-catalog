"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileAudio, Users, FolderOpen } from "lucide-react";
import type { DatabaseStats } from "@/lib/types";

export function StatsCards() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    const loadingCards = ["total", "audio", "speakers", "languages"];
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingCards.map((cardType) => (
          <Card key={cardType}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load statistics</p>
      </div>
    );
  }

  const audioCount = stats.contentTypes.audio || 0;
  const speakerCount = stats.topSpeakers?.length || 0;
  const languageCount = Object.keys(stats.languages).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Content</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRecords}</div>
          <p className="text-xs text-muted-foreground">Items in catalog</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Audio Content</CardTitle>
          <FileAudio className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{audioCount}</div>
          <p className="text-xs text-muted-foreground">Audio recordings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Speakers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{speakerCount}</div>
          <p className="text-xs text-muted-foreground">Unique speakers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Languages</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{languageCount}</div>
          <p className="text-xs text-muted-foreground">Available languages</p>
        </CardContent>
      </Card>
    </div>
  );
}
