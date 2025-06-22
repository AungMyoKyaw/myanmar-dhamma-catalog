import { SearchForm } from "@/components/search/SearchForm";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search Content</h1>
        <p className="text-muted-foreground">
          Find specific content using advanced search and filters
        </p>
      </div>

      <SearchForm />
    </div>
  );
}
