import { CalendarDays, RotateCcw, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { CommandCenterFilters } from "@/features/command-center/types";
import { rescuePriorities, rescueStatuses } from "@/features/rescue/types";
import { titleCase } from "@/features/command-center/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DateRangeFilter({ filters, onChange }: { filters: CommandCenterFilters; onChange: (next: Partial<CommandCenterFilters>) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2"><label className="relative"><span className="sr-only">Start date</span><CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => onChange({ from: event.target.value })} /></label><label className="relative"><span className="sr-only">End date</span><CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => onChange({ to: event.target.value })} /></label></div>;
}

export function DashboardFilters({ filters, onChange, onClear, activeCount }: { filters: CommandCenterFilters; onChange: (next: Partial<CommandCenterFilters>) => void; onClear: () => void; activeCount: number }) {
  return (
    <Card>
      <CardContent className="grid gap-4 p-4 xl:grid-cols-[auto_minmax(22rem,1fr)_11rem_11rem_auto] xl:items-center">
        <div className="flex items-center gap-2 text-sm font-medium"><SlidersHorizontal className="h-4 w-4 text-primary" /> Operational filters</div>
        <DateRangeFilter filters={filters} onChange={onChange} />
        <Select value={filters.rescueStatus} onValueChange={(rescueStatus) => onChange({ rescueStatus })}><SelectTrigger aria-label="Filter rescue status"><SelectValue placeholder="All rescue statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All rescue statuses</SelectItem>{rescueStatuses.map((status) => <SelectItem key={status} value={status}>{titleCase(status)}</SelectItem>)}</SelectContent></Select>
        <Select value={filters.priority} onValueChange={(priority) => onChange({ priority })}><SelectTrigger aria-label="Filter rescue priority"><SelectValue placeholder="All priorities" /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{rescuePriorities.map((priority) => <SelectItem key={priority} value={priority}>{titleCase(priority)}</SelectItem>)}</SelectContent></Select>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={!activeCount}><RotateCcw className="mr-1.5 h-4 w-4" /> Clear{activeCount ? ` (${activeCount})` : ""}</Button>
      </CardContent>
    </Card>
  );
}

export function RefreshControl({ isRefreshing, onRefresh }: { isRefreshing: boolean; onRefresh: () => void }) {
  return <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}><RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh</Button>;
}
