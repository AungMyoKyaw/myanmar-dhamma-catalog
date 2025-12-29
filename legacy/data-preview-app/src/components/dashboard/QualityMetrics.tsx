"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { QualityIssue } from "@/lib/types";

export function QualityMetrics() {
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quality")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data.slice(0, 5)); // Show only first 5 issues
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quality issues:", error);
        setLoading(false);
      });
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Quality</CardTitle>
          <CardDescription>Issues that need attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Quality</CardTitle>
        <CardDescription>Issues that need attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issues.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No quality issues found
            </p>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="flex items-start space-x-4">
                <div className="mt-0.5">{getSeverityIcon(issue.severity)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityVariant(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    <Badge variant="outline">
                      {issue.type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {issue.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
