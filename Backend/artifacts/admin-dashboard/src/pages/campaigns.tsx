import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListCampaigns, getListCampaignsQueryKey,
  useCreateCampaign,
  useUpdateCampaign
} from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TreePine, Plus, Users, Calendar, PauseCircle, PlayCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type CampaignStatus = "active" | "completed" | "paused";

export function Campaigns() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryParams = statusFilter !== "all" ? { status: statusFilter } : {};
  
  const { data: campaigns, isLoading } = useListCampaigns(queryParams, {
    query: { queryKey: getListCampaignsQueryKey(queryParams) }
  });

  const createMutation = useCreateCampaign({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
        setIsAddOpen(false);
        toast({ title: "Campaign created successfully" });
      }
    }
  });

  const updateMutation = useUpdateCampaign({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
        toast({ title: "Campaign status updated" });
      }
    }
  });

  const form = useForm({
    defaultValues: {
      name: "",
      species: "",
      targetAmount: "",
      description: "",
      status: "active" as CampaignStatus
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      data: {
        ...data,
        targetAmount: Number(data.targetAmount)
      }
    });
  };

  const toggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateMutation.mutate({ id, data: { status: newStatus as CampaignStatus } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-serif text-primary">Active Campaigns</h2>
          <p className="text-muted-foreground">Monitor fundraising efforts and conservation targets.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="hover-elevate">
              <Plus className="mr-2 h-4 w-4" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Launch Campaign</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Save the Tigers 2024" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Species</FormLabel>
                        <FormControl>
                          <Input placeholder="Bengal Tiger" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Goal (INR)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500000" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Details about the campaign objectives..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Launch Campaign
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex w-full sm:w-[250px] mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : campaigns?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card border-dashed">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <TreePine className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-foreground">No Campaigns Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            You don't have any campaigns matching this filter. Start a new campaign to begin raising funds.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns?.map((campaign) => {
            const progress = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));
            return (
              <Card key={campaign.id} className="flex flex-col hover-elevate transition-all border-l-4 border-l-transparent hover:border-l-primary data-[status=paused]:opacity-75 data-[status=completed]:border-l-muted-foreground" data-status={campaign.status}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={getStatusColor(campaign.status) as any} className="capitalize shadow-none">
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm shadow-none border-primary/20 text-primary">
                      {campaign.species}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{campaign.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold text-foreground">{formatCurrency(campaign.raisedAmount)} raised</span>
                        <span className="text-muted-foreground">of {formatCurrency(campaign.targetAmount)}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="mr-1.5 h-3.5 w-3.5" />
                        <span>{campaign.donorCount || 0} donors</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                        <span>{formatDate(campaign.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 justify-end border-t bg-muted/20 px-6 py-3">
                  {campaign.status !== 'completed' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => toggleStatus(campaign.id, campaign.status)}
                      disabled={updateMutation.isPending}
                    >
                      {campaign.status === 'active' ? (
                        <><PauseCircle className="mr-1.5 h-3.5 w-3.5" /> Pause</>
                      ) : (
                        <><PlayCircle className="mr-1.5 h-3.5 w-3.5" /> Resume</>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
