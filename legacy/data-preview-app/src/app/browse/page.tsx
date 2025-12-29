import { ContentTable } from "@/components/content/ContentTable";

export default function BrowsePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Content</h1>
        <p className="text-muted-foreground">
          Explore all content in the catalog
        </p>
      </div>

      <ContentTable />
    </div>
  );
}
