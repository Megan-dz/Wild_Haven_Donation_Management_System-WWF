import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading command center" aria-busy="true">
      <div className="flex items-center justify-between"><div className="space-y-2"><Skeleton className="h-5 w-36" /><Skeleton className="h-9 w-80" /></div><Skeleton className="h-10 w-28" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-36" />)}</div>
      <div className="grid gap-6 xl:grid-cols-5"><Skeleton className="h-[28rem] xl:col-span-3" /><Skeleton className="h-[28rem] xl:col-span-2" /></div>
      <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div>
    </div>
  );
}

export function DashboardErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="rounded-full bg-destructive/10 p-3 text-destructive"><AlertTriangle className="h-6 w-6" /></span>
        <div><h2 className="font-serif text-xl font-bold">Command center data could not be loaded</h2><p className="mt-1 max-w-md text-sm text-muted-foreground">The underlying operational data remains unchanged. Check your connection or try the request again.</p></div>
        <Button variant="outline" onClick={onRetry}>Try again</Button>
      </CardContent>
    </Card>
  );
}

export function DashboardEmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
