"use client";

export function Header() {
  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Myanmar Dhamma Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Preview and validate scraped dhamma content
          </p>
        </div>
      </div>
    </header>
  );
}
