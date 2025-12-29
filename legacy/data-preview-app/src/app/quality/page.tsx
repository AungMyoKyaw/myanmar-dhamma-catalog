import { QualityReport } from "@/components/quality/QualityReport";

export default function QualityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Quality</h1>
        <p className="text-muted-foreground">
          Review and fix data quality issues in the catalog
        </p>
      </div>

      <QualityReport />
    </div>
  );
}
