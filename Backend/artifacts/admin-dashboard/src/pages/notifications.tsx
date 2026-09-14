import { useMemo, useState } from "react";
import { BellRing, CheckCheck, RefreshCw } from "lucide-react";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { NotificationFilters } from "@/components/notifications/notification-filters";
import { NotificationPreferences } from "@/components/notifications/notification-preferences";
import { NotificationErrorState, NotificationSkeleton } from "@/components/notifications/notification-empty-state";
import { useNotifications } from "@/features/notifications/use-notifications";
import type { NotificationFilters as Filters } from "@/features/notifications/notification-types";
import { defaultNotificationFilters, filterNotifications } from "@/features/notifications/notification-utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Notifications() {
  const [filters, setFilters] = useState<Filters>(defaultNotificationFilters);
  const notifications = useNotifications();
  const { toast } = useToast();
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key !== "sort" && value && value !== "all").length;
  const visible = useMemo(() => filterNotifications(notifications.notifications, filters, notifications.readIds, notifications.preferences), [notifications.notifications, filters, notifications.readIds, notifications.preferences]);
  const unread = visible.filter((item) => !notifications.readIds.has(item.id));
  const allUnread = notifications.notifications.filter((item) => !notifications.readIds.has(item.id));
  const hasPreferenceFilter = !notifications.preferences.showReadNotifications || Object.values(notifications.preferences.categories).some((enabled) => !enabled);
  const updateFilters = (next: Partial<Filters>) => setFilters((current) => ({ ...current, ...next }));
  const markAllRead = (ids: string[]) => {
    notifications.markAllAsRead(ids);
    if (ids.length) toast({ title: `${ids.length} notification${ids.length === 1 ? "" : "s"} marked as read` });
  };

  if (notifications.isLoading && !notifications.notifications.length) {
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-9 w-80 animate-pulse rounded bg-muted" />
        </div>
        <NotificationSkeleton />
      </main>
    );
  }

  if (notifications.isError && !notifications.notifications.length) {
    return <main className="flex-1 p-4 sm:p-6 lg:p-8"><NotificationErrorState onRetry={notifications.refresh} /></main>;
  }

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <BellRing className="h-4 w-4" /> Communication hub
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Notifications & communications
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            A focused feed of current operational records that need attention, plus recent system activity. Open any item to continue in its existing workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={notifications.refresh} disabled={notifications.isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${notifications.isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" onClick={() => markAllRead(allUnread.map((item) => item.id))} disabled={!allUnread.length}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        </div>
      </header>
      <NotificationFilters
        filters={filters}
        onChange={updateFilters}
        onClear={() => setFilters(defaultNotificationFilters)}
        activeCount={activeFilterCount}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <NotificationCenter
          notifications={visible}
          readIds={notifications.readIds}
          onMarkRead={notifications.markAsRead}
          onMarkUnread={notifications.markAsUnread}
          onMarkAllRead={markAllRead}
          filtered={Boolean(activeFilterCount || hasPreferenceFilter)}
        />
        <aside>
          <NotificationPreferences preferences={notifications.preferences} onChange={notifications.updatePreferences} />
        </aside>
      </div>
    </main>
  );
}
