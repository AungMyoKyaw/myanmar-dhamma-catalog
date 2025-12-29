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
import { Search, Folder } from "lucide-react";

interface CategoryStats {
  category: string;
  count: number;
}

// This would normally come from an API route
async function getCategoryStats(): Promise<CategoryStats[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/categories`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch category statistics");
  }

  return response.json();
}

export default async function CategoriesPage() {
  const categoryStats = await getCategoryStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Browse content by category and view distribution
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search categories..." className="pl-8" />
            </div>
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoryStats.map((category) => (
          <Card
            key={category.category}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Folder className="h-5 w-5 text-primary" />
                <span>{category.category}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {category.count} content{category.count !== 1 ? "s" : ""}
                </Badge>
                <Link
                  href={`/search?category=${encodeURIComponent(category.category)}`}
                >
                  <Button variant="outline" size="sm">
                    View Content
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Category Summary</CardTitle>
          <CardDescription>Distribution overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Categories:</span>
              <span className="font-medium">{categoryStats.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Content:</span>
              <span className="font-medium">
                {categoryStats.reduce((sum, cat) => sum + cat.count, 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average per Category:</span>
              <span className="font-medium">
                {categoryStats.length > 0
                  ? Math.round(
                      categoryStats.reduce((sum, cat) => sum + cat.count, 0) /
                        categoryStats.length
                    )
                  : 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
