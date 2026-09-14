import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import type { DistributionItem, TrendPoint } from "@/features/command-center/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { DashboardEmptyState } from "./dashboard-states";

export function TrendSection({ title, description, data, valueLabel, formatValue = (value) => String(value) }: { title: string; description: string; data: TrendPoint[]; valueLabel: string; formatValue?: (value: number) => string }) {
  const hasData = data.some((item) => item.value > 0);
  return (
    <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{hasData ? <ChartContainer config={{ value: { label: valueLabel, color: "hsl(var(--primary))" } }} className="h-60 w-full"><AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}><defs><linearGradient id={`fill-${title.replace(/\s/g, "-")}`} x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.35} /><stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tickFormatter={formatValue} /><Tooltip formatter={(value) => formatValue(Number(value))} /><Area type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2.5} fill={`url(#fill-${title.replace(/\s/g, "-")})`} /></AreaChart></ChartContainer> : <DashboardEmptyState title={`No ${valueLabel.toLowerCase()} data in this range`} detail="Adjust the date filters or record a new operational event to populate this trend." />}</CardContent></Card>
  );
}

export function DistributionChart({ title, description, data }: { title: string; description: string; data: DistributionItem[] }) {
  return (
    <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{data.length ? <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]"><ChartContainer config={{}} className="mx-auto h-48 w-full max-w-[14rem]"><PieChart><Tooltip /><Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>{data.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ChartContainer><ul className="space-y-2">{data.map((item) => <li key={item.name} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="truncate">{item.name}</span></span><span className="font-semibold">{item.value}</span></li>)}</ul></div> : <DashboardEmptyState title="No distribution data" detail="This view will populate when matching records are available." />}</CardContent></Card>
  );
}
