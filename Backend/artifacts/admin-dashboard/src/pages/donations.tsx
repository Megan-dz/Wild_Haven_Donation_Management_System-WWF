import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListDonations, getListDonationsQueryKey,
  useCreateDonation,
  useUpdateDonation,
  useListCampaigns, getListCampaignsQueryKey
} from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Filter, MoreHorizontal, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type DonationStatus = "pending" | "completed" | "refunded";

export function Donations() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple debounce for search
  import("react").then((React) => {
    React.useEffect(() => {
      const timer = setTimeout(() => setDebouncedSearch(search), 300);
      return () => clearTimeout(timer);
    }, [search]);
  });

  const queryParams = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {})
  };

  const { data: donations, isLoading } = useListDonations(queryParams, {
    query: { queryKey: getListDonationsQueryKey(queryParams) }
  });

  const { data: campaigns } = useListCampaigns(undefined, {
    query: { queryKey: getListCampaignsQueryKey() }
  });

  const createMutation = useCreateDonation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDonationsQueryKey() });
        setIsAddOpen(false);
        toast({ title: "Donation added successfully" });
      }
    }
  });

  const updateMutation = useUpdateDonation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDonationsQueryKey() });
        toast({ title: "Donation status updated" });
      }
    }
  });

  const form = useForm({
    defaultValues: {
      donorName: "",
      donorEmail: "",
      amount: "",
      campaignId: "",
      paymentMethod: "",
      status: "completed" as DonationStatus
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      data: {
        ...data,
        amount: Number(data.amount),
        campaignId: data.campaignId ? Number(data.campaignId) : undefined
      }
    });
  };

  const updateStatus = (id: number, status: DonationStatus) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'refunded': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-serif text-primary">Donations Ledger</h2>
          <p className="text-muted-foreground">Manage and track incoming contributions.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="hover-elevate">
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Donation Record</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="donorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Donor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="donorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (INR)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="card">Credit Card</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="campaignId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="General Fund" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">General Fund</SelectItem>
                          {campaigns?.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Donation
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-muted rounded-full animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-muted rounded float-right animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : donations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                  No donations found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              donations?.map((donation) => (
                <TableRow key={donation.id} className="group">
                  <TableCell>
                    <div className="font-medium text-foreground">{donation.donorName}</div>
                    <div className="text-xs text-muted-foreground">{donation.donorEmail}</div>
                  </TableCell>
                  <TableCell className="font-bold font-mono text-primary">
                    {formatCurrency(donation.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {donation.campaignName || "General Fund"}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(donation.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(donation.status) as any} className="capitalize">
                      {donation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {donation.status === 'pending' && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200"
                          onClick={() => updateStatus(donation.id, 'completed')}
                          disabled={updateMutation.isPending}
                        >
                          Mark Complete
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
