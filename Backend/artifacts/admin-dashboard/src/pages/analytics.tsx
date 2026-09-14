import { useEffect, useState } from "react";
import { customFetch, getListCampaignsQueryKey } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarDays, CreditCard, IndianRupee, Medal, RefreshCw, Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AnalyticsData = {
  summary: { totalDonations: number; totalAmount: number; averageAmount: number };
  byCampaign: Array<{ campaignId: number | null; campaignName: string; donationCount: number; amount: number }>;
  byMonth: Array<{ month: string; donationCount: number; amount: number }>;
  byStatus: Array<{ status: string; donationCount: number; amount: number }>;
  topDonors: Array<{ donorId: number; donorName: string; donationCount: number; amount: number }>;
  recentDonations: Array<{ id: number; donorName: string; amount: number; status: string; campaignName: string; donatedAt: string }>;
  campaignProgress: Array<{ id: number; name: string; raised: number; goal: number; percent: number; status: string }>;
};

function AnalyticsCard({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: typeof Activity }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

const getStatusVariant = (status: string) => {
  if (status === "completed") return "success";
  if (status === "pending") return "warning";
  if (status === "refunded") return "destructive";
  return "secondary";
};

export function Analytics() {
  const [campaignId, setCampaignId] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");

  const { data: campaigns } = useQuery({
    queryKey: getListCampaignsQueryKey(),
    queryFn: () => customFetch<Array<{ id: number; name: string }>>("/api/campaigns"),
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (campaignId !== "all") params.set("campaignId", campaignId);
      if (status !== "all") params.set("status", status);
      if (from) params.set("from", from);
      if (to) params.set("to", `${to}T23:59:59.999Z`);
      setQuery(params.toString());
    }, 150);
    return () => window.clearTimeout(timer);
  }, [campaignId, status, from, to]);

  const analyticsQuery = useQuery({
    queryKey: ["donation-analytics", query],
    queryFn: () => customFetch<AnalyticsData>(`/api/donation-analytics${query ? `?${query}` : ""}`),
  });
  const analytics = analyticsQuery.data;
  const maxMonthlyAmount = Math.max(...(analytics?.byMonth.map((item) => item.amount) ?? [1]), 1);
  const maxCampaignAmount = Math.max(...(analytics?.byCampaign.map((item) => item.amount) ?? [1]), 1);

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-primary">Donation Analytics</h2>
          <p className="text-muted-foreground">Track contribution volume, donor patterns, and campaign progress.</p>
        </div>
        <Button variant="outline" onClick={() => analyticsQuery.refetch()} disabled={analyticsQuery.isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${analyticsQuery.isFetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-4">
          <Select value={campaignId} onValueChange={setCampaignId}>
            <SelectTrigger><SelectValue placeholder="All campaigns" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All campaigns</SelectItem>
              {campaigns?.map((campaign) => <SelectItem key={campaign.id} value={String(campaign.id)}>{campaign.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative"><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="From date" /></div>
          <div className="relative"><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="To date" /></div>
        </CardContent>
      </Card>

      {analyticsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3"><div className="h-28 animate-pulse rounded-lg bg-muted" /><div className="h-28 animate-pulse rounded-lg bg-muted" /><div className="h-28 animate-pulse rounded-lg bg-muted" /></div>
      ) : analyticsQuery.isError ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center"><p className="text-sm text-destructive">Unable to load donation analytics.</p><Button variant="outline" onClick={() => analyticsQuery.refetch()}>Try again</Button></CardContent></Card>
      ) : analytics ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <AnalyticsCard title="Total donations" value={analytics.summary.totalDonations.toLocaleString("en-IN")} detail="Records matching the selected filters" icon={CreditCard} />
            <AnalyticsCard title="Total amount" value={formatCurrency(analytics.summary.totalAmount)} detail="Across all donation statuses" icon={IndianRupee} />
            <AnalyticsCard title="Average donation" value={formatCurrency(analytics.summary.averageAmount)} detail="Average contribution amount" icon={Activity} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Donations by campaign</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {analytics.byCampaign.length === 0 ? <p className="text-sm text-muted-foreground">No campaign donations match these filters.</p> : analytics.byCampaign.map((item) => (
                  <div key={item.campaignId ?? "general"} className="space-y-1"><div className="flex justify-between text-sm"><span>{item.campaignName}</span><span className="font-medium">{formatCurrency(item.amount)}</span></div><Progress value={(item.amount / maxCampaignAmount) * 100} /><p className="text-xs text-muted-foreground">{item.donationCount} donations</p></div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Donations by month</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {analytics.byMonth.length === 0 ? <p className="text-sm text-muted-foreground">No monthly data matches these filters.</p> : analytics.byMonth.map((item) => (
                  <div key={item.month} className="flex items-center gap-3"><span className="w-20 text-sm text-muted-foreground">{item.month}</span><div className="h-3 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${(item.amount / maxMonthlyAmount) * 100}%` }} /></div><span className="w-24 text-right text-sm font-medium">{formatCurrency(item.amount)}</span></div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card><CardHeader><CardTitle>Status breakdown</CardTitle></CardHeader><CardContent className="space-y-3">{analytics.byStatus.length === 0 ? <p className="text-sm text-muted-foreground">No status data available.</p> : analytics.byStatus.map((item) => <div key={item.status} className="flex items-center justify-between"><Badge variant={getStatusVariant(item.status) as any} className="capitalize">{item.status}</Badge><span className="text-sm">{item.donationCount} · {formatCurrency(item.amount)}</span></div>)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Medal className="h-4 w-4" /> Top donors</CardTitle></CardHeader><CardContent className="space-y-3">{analytics.topDonors.length === 0 ? <p className="text-sm text-muted-foreground">No donors match these filters.</p> : analytics.topDonors.map((donor) => <div key={donor.donorId} className="flex justify-between gap-3"><span className="truncate text-sm">{donor.donorName}</span><span className="whitespace-nowrap text-sm font-medium">{formatCurrency(donor.amount)}</span></div>)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Campaign progress</CardTitle></CardHeader><CardContent className="space-y-4">{analytics.campaignProgress.length === 0 ? <p className="text-sm text-muted-foreground">No campaigns available.</p> : analytics.campaignProgress.slice(0, 5).map((campaign) => <div key={campaign.id} className="space-y-1"><div className="flex justify-between text-sm"><span className="truncate">{campaign.name}</span><span>{campaign.percent}%</span></div><Progress value={campaign.percent} /><p className="text-xs text-muted-foreground">{formatCurrency(campaign.raised)} of {formatCurrency(campaign.goal)}</p></div>)}</CardContent></Card>
          </div>

          <Card><CardHeader><CardTitle>Recent donations</CardTitle></CardHeader><CardContent>{analytics.recentDonations.length === 0 ? <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">No donations match these filters.</div> : <div className="space-y-3">{analytics.recentDonations.map((donation) => <div key={donation.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium">{donation.donorName}</p><p className="text-xs text-muted-foreground">{donation.campaignName} · {formatDate(donation.donatedAt)}</p></div><div className="flex items-center gap-3"><Badge variant={getStatusVariant(donation.status) as any} className="capitalize">{donation.status}</Badge><span className="text-sm font-semibold">{formatCurrency(donation.amount)}</span></div></div>)}</div>}</CardContent></Card>
        </>
      ) : null}
    </div>
  );
}
