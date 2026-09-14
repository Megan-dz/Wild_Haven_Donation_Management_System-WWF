import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { AppLayout } from '@/components/layout/app-layout';
import { Dashboard } from '@/pages/dashboard';
import { Analytics } from '@/pages/analytics';
import { Donations } from '@/pages/donations';
import { Campaigns } from '@/pages/campaigns';
import { Donors } from '@/pages/donors';
import { DonorDetail } from '@/pages/donor-detail';
import { RescueCases } from '@/pages/rescue-cases';
import { RescueCaseDetail } from '@/pages/rescue-case-detail';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/donations" component={Donations} />
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/donors" component={Donors} />
        <Route path="/donors/:id" component={DonorDetail} />
        <Route path="/rescue-cases" component={RescueCases} />
        <Route path="/rescue-cases/:id" component={RescueCaseDetail} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
