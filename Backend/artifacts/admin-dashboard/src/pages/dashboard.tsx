import { 
  useGetDashboardStats, 
  getGetDashboardStatsQueryKey,
  useGetRecentActivity,
  getGetRecentActivityQueryKey,
  useGetMonthlyTotals,
  getGetMonthlyTotalsQueryKey,
  useListCampaigns,
  getListCampaignsQueryKey
} from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Activity, DollarSign, Target, Users } from "lucide-react";

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ limit: 5 }, { query: { queryKey: getGetRecentActivityQueryKey({ limit: 5 }) } });
  const { data: monthlyTotals, isLoading: monthlyLoading } = useGetMonthlyTotals({ query: { queryKey: getGetMonthlyTotalsQueryKey() } });
  const { data: campaigns, isLoading: campaignsLoading } = useListCampaigns({ status: 'active' }, { query: { queryKey: getListCampaignsQueryKey({ status: 'active' }) } });

  const chartData = monthlyTotals?.map(m => ({
    name: `${new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' })}`,
    total: m.totalAmount
  })) || [];

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-serif text-primary">Operations Dashboard</h2>
        <p className="text-muted-foreground">Overview of current conservation funding and activities.</p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">From {stats.totalDonations} donations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonors}</div>
              <p className="text-xs text-muted-foreground mt-1">Total engaged supporters</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">Out of {stats.totalCampaigns} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Donations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingDonations}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Funding Trajectory</CardTitle>
            <CardDescription>Monthly donation totals over the past year.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {monthlyLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => [formatCurrency(value), "Total"]}
                    />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--chart-1))" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest donations and updates across all campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {activityLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted rounded-md" />)}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-6">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.donorName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.campaignName || "General Fund"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatCurrency(item.amount)}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaignsLoading ? (
          <div className="col-span-3 space-y-4 animate-pulse">
            <div className="h-8 bg-muted w-48 rounded" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <>
            <div className="col-span-full">
              <h3 className="text-lg font-serif font-semibold text-primary">Active Campaigns Progress</h3>
            </div>
            {campaigns.slice(0, 3).map(campaign => {
              const progress = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));
              return (
                <Card key={campaign.id} className="hover-elevate">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="mb-2">{campaign.species}</Badge>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{progress}%</Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-1">{campaign.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(campaign.raisedAmount)}</span>
                      <span>{formatCurrency(campaign.targetAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        ) : null}
      </div>
    </div>
  );
}
