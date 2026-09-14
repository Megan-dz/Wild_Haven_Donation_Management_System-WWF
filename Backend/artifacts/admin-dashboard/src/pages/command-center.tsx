import { useEffect, useMemo, useState } from "react";
import { Activity, HeartHandshake, HeartPulse, Package, PawPrint, Siren, UsersRound, Wallet } from "lucide-react";
import { AttentionCenter } from "@/components/command-center/attention-center";
import { ActivityTimeline } from "@/components/command-center/activity-timeline";
import { CampaignProgress } from "@/components/command-center/campaign-progress";
import { CommandCenterHeader } from "@/components/command-center/command-center-header";
import { DashboardFilters } from "@/components/command-center/dashboard-filters";
import { DashboardErrorState, DashboardSkeleton } from "@/components/command-center/dashboard-states";
import { DashboardStats, MetricCard } from "@/components/command-center/metric-card";
import { AdoptionOverview, DonationOverview, InventoryOverview, MedicalOverview, RescueOverview, VolunteerOverview } from "@/components/command-center/overview-panels";
import { DistributionChart, TrendSection } from "@/components/command-center/trend-section";
import { useCommandCenter } from "@/features/command-center/hooks/use-command-center";
import { emptyCommandCenterFilters, createCommandCenterView } from "@/features/command-center/utils";
import type { CommandCenterFilters } from "@/features/command-center/types";
import { formatCurrency } from "@/lib/utils";

export function CommandCenter() {
  const [filters, setFilters] = useState<CommandCenterFilters>(emptyCommandCenterFilters);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const center = useCommandCenter(filters);
  const view = useMemo(() => center.data ? createCommandCenterView(center.data, filters) : undefined, [center.data, filters]);
  const activeFilterCount = Object.values(filters).filter((value) => value && value !== "all").length;

  useEffect(() => { if (center.data && !center.isFetching) setLastUpdated(new Date()); }, [center.data, center.isFetching]);

  const updateFilters = (next: Partial<CommandCenterFilters>) => setFilters((current) => ({ ...current, ...next }));
  const clearFilters = () => setFilters(emptyCommandCenterFilters);

  if (center.isLoading && !center.data) return <main className="flex-1 p-4 sm:p-6 lg:p-8"><DashboardSkeleton /></main>;
  if (center.isError && !center.data) return <main className="flex-1 p-4 sm:p-6 lg:p-8"><DashboardErrorState onRetry={center.refresh} /></main>;
  if (!center.data || !view) return null;

  const scoped = activeFilterCount > 0;
  const rescueCount = scoped ? view.rescueCases.length : center.data.rescueDashboard.totalRescueCases;
  const activeRescueCount = scoped ? view.activeRescues.length : center.data.rescueDashboard.activeCases;
  const criticalCount = scoped ? view.criticalCases.length : center.data.rescueDashboard.highPriorityCases;
  const adoptionCount = scoped ? view.completedAdoptions.length : center.data.adoptionDashboard.completedAdoptions;
  const lowInventoryCount = scoped ? view.lowInventory.length : center.data.inventoryDashboard.lowStock + center.data.inventoryDashboard.outOfStock;

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <CommandCenterHeader isRefreshing={center.isFetching} onRefresh={center.refresh} lastUpdated={lastUpdated} />
      <DashboardFilters filters={filters} onChange={updateFilters} onClear={clearFilters} activeCount={activeFilterCount} />
      <DashboardStats>
        <MetricCard label="Total rescue cases" value={rescueCount} detail={scoped ? "Matching the current operational filters" : "All recorded rescue cases"} icon={PawPrint} href="/rescue-cases" />
        <MetricCard label="Active rescue cases" value={activeRescueCount} detail="Cases currently in operations" icon={Siren} href="/rescue-cases" tone="warning" />
        <MetricCard label="High-priority cases" value={criticalCount} detail="High and critical cases requiring close review" icon={Activity} href="/rescue-cases" tone={criticalCount ? "critical" : "default"} />
        <MetricCard label="Under medical treatment" value={view.underTreatment.length} detail="Open treatment or recovery records" icon={HeartPulse} href="/medical-recovery" tone="warning" />
        <MetricCard label="Completed adoptions" value={adoptionCount} detail={scoped ? "Decisions in the selected date range" : "Recorded completed placements"} icon={HeartHandshake} href="/adoptions" tone="success" />
        <MetricCard label="Active volunteers" value={view.volunteers.reduce((total, item) => total + item.activeCases, 0)} detail={`${view.volunteers.filter((item) => item.activeCases >= 8).length} overloaded workload${view.volunteers.filter((item) => item.activeCases >= 8).length === 1 ? "" : "s"}`} icon={UsersRound} href="/volunteers" tone="warning" />
        <MetricCard label="Inventory alerts" value={lowInventoryCount} detail="Low-stock and out-of-stock items" icon={Package} href="/inventory" tone={lowInventoryCount ? "critical" : "success"} />
        <MetricCard label="Donation total" value={formatCurrency(center.data.donationAnalytics.summary.totalAmount)} detail={`${center.data.donationAnalytics.summary.totalDonations} donations in the selected date range`} icon={Wallet} href="/analytics" tone="success" />
      </DashboardStats>
      <section className="grid gap-6 xl:grid-cols-5"><div className="xl:col-span-3"><AttentionCenter items={view.attentionItems} /></div><div className="xl:col-span-2"><ActivityTimeline items={view.timeline} /></div></section>
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"><RescueOverview cases={view.rescueCases} activeCases={view.activeRescues} criticalCases={view.criticalCases} /><MedicalOverview items={view.medicalItems} underTreatment={view.underTreatment} /><AdoptionOverview dashboard={center.data.adoptionDashboard} applications={view.adoptionApplications} /><VolunteerOverview volunteers={view.volunteers} /><InventoryOverview dashboard={center.data.inventoryDashboard} items={view.inventoryItems} /><DonationOverview analytics={center.data.donationAnalytics} /></section>
      <section className="grid gap-6 xl:grid-cols-2"><TrendSection title="Rescue intake trend" description="Reported rescue cases across the last seven days." data={view.rescueTrend} valueLabel="Cases" /><TrendSection title="Adoption decision trend" description="Application submissions and recorded review decisions across the last seven days." data={view.adoptionTrend} valueLabel="Applications" /></section>
      <section className="grid gap-6 xl:grid-cols-3"><TrendSection title="Donation trend" description="Donation amount by reporting period from the analytics API." data={view.donationTrend} valueLabel="Amount" formatValue={(value) => value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)} /><CampaignProgress campaigns={view.campaignProgress} /><DistributionChart title="Rescue case status" description="Status distribution for rescue cases in view." data={view.rescueStatusDistribution} /></section>
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"><DistributionChart title="Medical & recovery distribution" description="Treatment status for matching medical records." data={view.medicalDistribution} /><DistributionChart title="Volunteer workload distribution" description="Workload thresholds based on active case assignments." data={view.volunteerDistribution} /><DistributionChart title="Inventory status distribution" description="Availability based on current quantity and reorder levels." data={view.inventoryDistribution} /></section>
    </main>
  );
}
