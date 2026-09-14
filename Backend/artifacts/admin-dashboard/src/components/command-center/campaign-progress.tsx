import { ArrowRight, Target } from "lucide-react";
import { Link } from "wouter";
import type { DonationAnalytics } from "@/features/command-center/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardEmptyState } from "./dashboard-states";

export function CampaignProgress({ campaigns }: { campaigns: DonationAnalytics["campaignProgress"] }) {
  return (
    <Card><CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0"><div><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Campaign progress</CardTitle><CardDescription className="mt-1">Fundraising progress from the existing donation analytics.</CardDescription></div><Button asChild size="sm" variant="outline"><Link href="/campaigns">All campaigns<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link></Button></CardHeader><CardContent>{campaigns.length ? <div className="space-y-5">{campaigns.slice(0, 6).map((campaign) => <div key={campaign.id}><div className="mb-2 flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{campaign.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{formatCurrency(campaign.raised)} of {formatCurrency(campaign.goal)}</p></div><Badge variant={campaign.status === "active" ? "success" : "secondary"}>{campaign.percent}%</Badge></div><Progress value={Math.min(campaign.percent, 100)} className="h-2" /></div>)}</div> : <DashboardEmptyState title="No campaign progress available" detail="Create or fund a campaign to monitor its progress here." />}</CardContent></Card>
  );
}
