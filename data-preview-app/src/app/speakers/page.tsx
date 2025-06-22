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

// This would normally come from an API route
async function getSpeakerStats(): Promise<SpeakerStats[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/speakers`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch speaker statistics");
  }

  return response.json();
}

export default async function SpeakersPage() {
  const speakerStats = await getSpeakerStats();

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
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search speakers..." className="pl-8" />
            </div>
            <Button>Search</Button>
          </div>
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
