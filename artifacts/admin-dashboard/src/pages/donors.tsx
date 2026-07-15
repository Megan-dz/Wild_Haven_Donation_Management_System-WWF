import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListDonors, getListDonorsQueryKey,
  useCreateDonor
} from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

export function Donors() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  import("react").then((React) => {
    React.useEffect(() => {
      const timer = setTimeout(() => setDebouncedSearch(search), 300);
      return () => clearTimeout(timer);
    }, [search]);
  });

  const queryParams = debouncedSearch ? { search: debouncedSearch } : {};

  const { data: donors, isLoading } = useListDonors(queryParams, {
    query: { queryKey: getListDonorsQueryKey(queryParams) }
  });

  const createMutation = useCreateDonor({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDonorsQueryKey() });
        setIsAddOpen(false);
        toast({ title: "Donor profile created" });
      }
    }
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: ""
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({ data });
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-serif text-primary">Donor Directory</h2>
          <p className="text-muted-foreground">Manage relationships with your supporters.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="hover-elevate">
              <Plus className="mr-2 h-4 w-4" /> Add Donor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Donor Profile</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Profile
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex w-full sm:max-w-md mb-6 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Donor Profile</TableHead>
              <TableHead>Total Contribution</TableHead>
              <TableHead>Donations</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 w-16 float-right bg-muted rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : donors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  No donors found in the directory.
                </TableCell>
              </TableRow>
            ) : (
              donors?.map((donor) => (
                <TableRow key={donor.id} className="group cursor-pointer hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="font-medium text-foreground">{donor.name}</div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>{donor.email}</span>
                      {donor.phone && (
                        <>
                          <span className="text-muted-foreground/30">•</span>
                          <span>{donor.phone}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatCurrency(donor.totalDonated)}
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center justify-center bg-secondary text-secondary-foreground rounded-full h-6 px-2.5 text-xs font-medium">
                      {donor.donationCount}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {donor.lastDonationAt ? formatDate(donor.lastDonationAt) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/donors/${donor.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10">
                        View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
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
