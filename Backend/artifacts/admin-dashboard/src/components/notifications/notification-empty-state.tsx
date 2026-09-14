import { AlertTriangle, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSkeleton() {
  return <div className="space-y-3" aria-busy="true" aria-label="Loading notifications">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-32 w-full" />)}</div>;
}

export function NotificationEmptyState({ filtered }: { filtered: boolean }) {
  return <Card><CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center"><span className="rounded-full bg-primary/10 p-3 text-primary"><BellRing className="h-6 w-6" /></span><div><h2 className="font-serif text-xl font-bold">{filtered ? "No notifications match this view" : "You’re all caught up"}</h2><p className="mt-1 max-w-md text-sm text-muted-foreground">{filtered ? "Try clearing a filter or searching for a different term." : "New notifications appear here when current rescue, care, placement, supply, and donation records need your attention."}</p></div></CardContent></Card>;
}

export function NotificationErrorState({ onRetry }: { onRetry: () => void }) {
  return <Card className="border-destructive/30"><CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center"><span className="rounded-full bg-destructive/10 p-3 text-destructive"><AlertTriangle className="h-6 w-6" /></span><div><h2 className="font-serif text-xl font-bold">Notifications could not be loaded</h2><p className="mt-1 max-w-md text-sm text-muted-foreground">Operational records have not been changed. Check the connection and try again.</p></div><Button variant="outline" onClick={onRetry}>Try again</Button></CardContent></Card>;
}
