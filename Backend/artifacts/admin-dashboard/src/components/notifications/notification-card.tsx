import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ChevronDown,
  HeartHandshake,
  HeartPulse,
  Package,
  PawPrint,
  Target,
  UsersRound,
  Wallet,
} from "lucide-react";
import { Link } from "wouter";
import type { Notification, NotificationCategory } from "@/features/notifications/notification-types";
import { categoryLabel, priorityVariant, relativeTime } from "@/features/notifications/notification-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const categoryIcons: Record<NotificationCategory, LucideIcon> = {
  system: Bell,
  rescue: PawPrint,
  medical: HeartPulse,
  volunteer: UsersRound,
  adoption: HeartHandshake,
  inventory: Package,
  donation: Wallet,
  campaign: Target,
};

const categoryTones: Record<NotificationCategory, string> = {
  system: "bg-slate-500/10 text-slate-700",
  rescue: "bg-primary/10 text-primary",
  medical: "bg-rose-500/10 text-rose-700",
  volunteer: "bg-sky-500/10 text-sky-700",
  adoption: "bg-violet-500/10 text-violet-700",
  inventory: "bg-amber-500/10 text-amber-700",
  donation: "bg-emerald-500/10 text-emerald-700",
  campaign: "bg-teal-500/10 text-teal-700",
};

type NotificationCardProps = {
  notification: Notification;
  isRead: boolean;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
};

export function NotificationCard({
  notification,
  isRead,
  onMarkRead,
  onMarkUnread,
}: NotificationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = categoryIcons[notification.category];
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:border-primary/30 hover:shadow-sm",
        !isRead && "border-primary/30 bg-primary/[0.025]",
      )}
    >
      {!isRead ? <span className="absolute bottom-0 left-0 top-0 w-1 bg-primary" aria-label="Unread notification" /> : null}
      <CardContent className="p-4 sm:p-5">
        <article className="flex gap-3 sm:gap-4">
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", categoryTones[notification.category])}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={priorityVariant(notification.priority) as never}>{notification.priority}</Badge>
                  <span className="text-xs font-medium text-muted-foreground">{categoryLabel(notification.category)}</span>
                  {!isRead ? <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" /> : null}
                </div>
                <h3 className="mt-2 font-medium leading-5">{notification.title}</h3>
              </div>
              <time className="shrink-0 text-xs text-muted-foreground" dateTime={notification.occurredAt}>
                {relativeTime(notification.occurredAt)}
              </time>
            </div>
            <p className={cn("mt-2 text-sm leading-6 text-muted-foreground", !expanded && "line-clamp-2")}>
              {notification.detail}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={notification.href} onClick={() => onMarkRead(notification.id)}>
                  {notification.actionLabel}
                </Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
                {expanded ? "Hide details" : "Show details"}
                <ChevronDown className={cn("ml-1.5 h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto"
                onClick={() => (isRead ? onMarkUnread(notification.id) : onMarkRead(notification.id))}
              >
                {isRead ? "Mark unread" : "Mark read"}
              </Button>
            </div>
          </div>
        </article>
      </CardContent>
    </Card>
  );
}
