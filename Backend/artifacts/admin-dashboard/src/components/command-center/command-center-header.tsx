import { Clock3, Radio } from "lucide-react";
import { RefreshControl } from "./dashboard-filters";

export function CommandCenterHeader({ isRefreshing, onRefresh, lastUpdated }: { isRefreshing: boolean; onRefresh: () => void; lastUpdated: Date }) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="flex items-center gap-2 text-sm font-medium text-primary"><Radio className="h-4 w-4" aria-hidden="true" /> Live operational view</div><h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">Impact & Operations Command Center</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">A focused view of rescue, care, placement, supplies, volunteers, and funding. Select a card or action to continue in the existing management workspace.</p></div>
      <div className="flex items-center gap-3"><p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><Clock3 className="h-3.5 w-3.5" /> Refreshed {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p><RefreshControl isRefreshing={isRefreshing} onRefresh={onRefresh} /></div>
    </header>
  );
}
