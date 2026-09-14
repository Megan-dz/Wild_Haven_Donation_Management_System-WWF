import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  href: string;
  tone?: "default" | "critical" | "warning" | "success";
};

const toneClasses = {
  default: "bg-primary/10 text-primary",
  critical: "bg-destructive/10 text-destructive",
  warning: "bg-amber-500/10 text-amber-700",
  success: "bg-emerald-500/10 text-emerald-700",
};

export function MetricCard({ label, value, detail, icon: Icon, href, tone = "default" }: MetricCardProps) {
  return (
    <Link href={href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3"><span className={cn("rounded-lg p-2.5", toneClasses[tone])}><Icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" /></div>
          <p className="mt-5 text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 font-serif text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function DashboardStats({ children }: { children: ReactNode }) {
  return <section aria-label="Operations summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</section>;
}
