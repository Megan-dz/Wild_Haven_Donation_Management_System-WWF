import type { Notification } from "@/features/notifications/notification-types";
import { groupNotifications } from "@/features/notifications/notification-utils";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "./notification-card";
import { NotificationEmptyState } from "./notification-empty-state";

const groupOrder = ["Upcoming", "Today", "Yesterday", "Previous 7 days", "Earlier"];

export function NotificationCenter({ notifications, readIds, onMarkRead, onMarkUnread, onMarkAllRead, filtered }: { notifications: Notification[]; readIds: Set<string>; onMarkRead: (id: string) => void; onMarkUnread: (id: string) => void; onMarkAllRead: (ids: string[]) => void; filtered: boolean }) {
  const groups = groupNotifications(notifications);
  const unread = notifications.filter((item) => !readIds.has(item.id));
  if (!notifications.length) return <NotificationEmptyState filtered={filtered} />;
  return <section aria-label="Notification feed" className="space-y-6"><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground"><strong className="text-foreground">{notifications.length}</strong> notifications · <strong className="text-foreground">{unread.length}</strong> unread</p><Button size="sm" variant="outline" onClick={() => onMarkAllRead(unread.map((item) => item.id))} disabled={!unread.length}>Mark visible read</Button></div>{groupOrder.filter((group) => groups[group]?.length).map((group) => <div key={group}><h2 className="mb-3 text-sm font-semibold text-muted-foreground">{group}</h2><div className="space-y-3">{groups[group].map((notification) => <NotificationCard key={notification.id} notification={notification} isRead={readIds.has(notification.id)} onMarkRead={onMarkRead} onMarkUnread={onMarkUnread} />)}</div></div>)}</section>;
}
