import { AlertCircle, AlertTriangle, ArrowRight, CircleAlert, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import type { AttentionItemData, Severity } from "@/features/command-center/types";
import { severityVariant } from "@/features/command-center/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardEmptyState } from "./dashboard-states";

const severityIcon = (severity: Severity) => severity === "critical" ? CircleAlert : severity === "warning" ? AlertTriangle : AlertCircle;

export function AttentionItem({ item }: { item: AttentionItemData }) {
  const Icon = severityIcon(item.severity);
  return (
    <article className="flex gap-3 border-b border-border/60 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <span className={item.severity === "critical" ? "mt-0.5 text-destructive" : item.severity === "warning" ? "mt-0.5 text-amber-700" : "mt-0.5 text-primary"}><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge variant={severityVariant(item.severity) as never}>{item.category}</Badge><p className="font-medium leading-5">{item.title}</p></div><p className="mt-1 text-sm leading-5 text-muted-foreground">{item.detail}</p><Button asChild variant="link" size="sm" className="mt-1 h-auto px-0"><Link href={item.href}>{item.actionLabel}<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link></Button></div>
    </article>
  );
}

export function AttentionCenter({ items }: { items: AttentionItemData[] }) {
  const critical = items.filter((item) => item.severity === "critical").length;
  return (
    <Card className={critical ? "border-destructive/30" : "border-primary/20"}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0"><div><CardTitle className="flex items-center gap-2"><AlertTriangle className={critical ? "h-5 w-5 text-destructive" : "h-5 w-5 text-primary"} /> Attention center</CardTitle><CardDescription className="mt-1">Actionable records from the existing operations data.</CardDescription></div>{critical ? <Badge variant="destructive">{critical} critical</Badge> : <Badge variant="success">No critical alerts</Badge>}</CardHeader>
      <CardContent>{items.length ? <div className="max-h-[31rem] overflow-y-auto pr-1">{items.slice(0, 12).map((item) => <AttentionItem key={item.id} item={item} />)}</div> : <DashboardEmptyState title="No actions need immediate attention" detail="No critical cases, workload alerts, stock warnings, follow-ups, or pending adoption reviews match the current view." />}</CardContent>
    </Card>
  );
}
