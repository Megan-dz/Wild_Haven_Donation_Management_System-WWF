import { useParams, Link } from "wouter";
import { 
  useGetDonor, getGetDonorQueryKey,
  useGetDonorDonations, getGetDonorDonationsQueryKey
} from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Calendar, Heart, Award } from "lucide-react";

export function DonorDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: donor, isLoading: donorLoading } = useGetDonor(id, {
    query: { enabled: !!id, queryKey: getGetDonorQueryKey(id) }
  });

  const { data: donations, isLoading: donationsLoading } = useGetDonorDonations(id, {
    query: { enabled: !!id, queryKey: getGetDonorDonationsQueryKey(id) }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'refunded': return 'destructive';
      default: return 'default';
    }
  };

  if (!id) return <div>Invalid Donor ID</div>;

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Link href="/donors">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-serif text-primary">Donor Profile</h2>
          <p className="text-muted-foreground">Detailed history and engagement metrics.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            {donorLoading ? (
              <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <CardTitle className="text-2xl font-serif text-foreground">{donor?.name}</CardTitle>
                <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {donor?.email}
                  </div>
                  {donor?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {donor.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Joined {donor?.createdAt ? formatDate(donor.createdAt) : ''}
                  </div>
                </div>
              </>
            )}
          </CardHeader>
          <CardContent className="pt-4 border-t border-primary/10">
            {donorLoading ? (
              <div className="space-y-4">
                <div className="h-12 bg-muted animate-pulse rounded" />
                <div className="h-12 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4 border shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Award className="h-4 w-4 text-primary" /> Lifetime Contribution
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {donor ? formatCurrency(donor.totalDonated) : ''}
                  </div>
                </div>
                <div className="bg-background rounded-lg p-4 border shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Heart className="h-4 w-4 text-primary" /> Total Donations
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {donor?.donationCount}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donationsLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted rounded-full float-right animate-pulse" /></TableCell>
                      </TableRow>
                    ))
                  ) : donations?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No donations recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    donations?.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDate(donation.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(donation.amount)}
                        </TableCell>
                        <TableCell>
                          {donation.campaignName || "General Fund"}
                        </TableCell>
                        <TableCell className="text-muted-foreground uppercase text-xs">
                          {donation.paymentMethod || "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getStatusColor(donation.status) as any} className="capitalize">
                            {donation.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
