import { Bell } from "lucide-react";
import { useNotifications } from "@/features/notifications/use-notifications";

export function NotificationBadge({ compact = false }: { compact?: boolean }) {
  const { notifications, preferences, readIds, isLoading } = useNotifications();
  const unread = notifications.filter((item) => preferences.categories[item.category] && !readIds.has(item.id)).length;
  if (isLoading) return compact ? <span className="h-2 w-2 rounded-full bg-sidebar-foreground/30" aria-label="Loading notifications" /> : <Bell className="h-4 w-4 animate-pulse text-muted-foreground" aria-label="Loading notifications" />;
  if (!unread) return null;
  return compact ? <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground" aria-label={`${unread} unread notifications`}>{unread > 99 ? "99+" : unread}</span> : <span className="relative inline-flex"><Bell className="h-4 w-4" /><span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">{unread > 99 ? "99+" : unread}</span></span>;
}
