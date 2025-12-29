import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentItems } from "@/components/dashboard/RecentItems";
import { QualityMetrics } from "@/components/dashboard/QualityMetrics";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your dhamma content catalog
        </p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentItems />
        <QualityMetrics />
      </div>
    </div>
  );
}
