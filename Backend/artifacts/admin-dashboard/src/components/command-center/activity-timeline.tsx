import { HeartHandshake, HeartPulse, Package, PawPrint, UsersRound, Wallet } from "lucide-react";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";
import type { TimelineItemData } from "@/features/command-center/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardEmptyState } from "./dashboard-states";

const icons: Record<TimelineItemData["type"], LucideIcon> = { rescue: PawPrint, medical: HeartPulse, adoption: HeartHandshake, inventory: Package, donation: Wallet, volunteer: UsersRound };
const iconTone: Record<TimelineItemData["type"], string> = { rescue: "bg-primary/10 text-primary", medical: "bg-rose-500/10 text-rose-700", adoption: "bg-violet-500/10 text-violet-700", inventory: "bg-amber-500/10 text-amber-700", donation: "bg-emerald-500/10 text-emerald-700", volunteer: "bg-sky-500/10 text-sky-700" };

export function ActivityItem({ item }: { item: TimelineItemData }) {
  const Icon = icons[item.type];
  return (
    <Link href={item.href} className="group relative flex gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ${iconTone[item.type]}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1"><div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3"><p className="font-medium leading-5 group-hover:text-primary">{item.title}</p><time className="shrink-0 text-xs text-muted-foreground" dateTime={item.occurredAt}>{formatDate(item.occurredAt)}</time></div><p className="mt-0.5 truncate text-sm text-muted-foreground">{item.detail}</p></div>
    </Link>
  );
}

export function ActivityTimeline({ items }: { items: TimelineItemData[] }) {
  return (
    <Card><CardHeader><CardTitle>Activity timeline</CardTitle><CardDescription>Recent events derived from rescue, care, adoption, inventory, volunteer, and donation records.</CardDescription></CardHeader><CardContent>{items.length ? <div className="relative max-h-[33rem] overflow-y-auto pr-1 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-border">{items.map((item) => <ActivityItem key={item.id} item={item} />)}</div> : <DashboardEmptyState title="No recent operational activity" detail="Records matching the current filters will appear here when the system has dated activity to show." />}</CardContent></Card>
  );
}
