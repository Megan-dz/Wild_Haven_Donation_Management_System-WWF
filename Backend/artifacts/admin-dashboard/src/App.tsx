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
import { Volunteers } from '@/pages/volunteers';
import { MedicalRecovery } from '@/pages/medical-recovery';
import { Adoptions } from '@/pages/adoptions';
import { Inventory } from '@/pages/inventory';
import { CommandCenter } from '@/pages/command-center';
import { Notifications } from '@/pages/notifications';
import { NotificationsProvider } from '@/features/notifications/use-notifications';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/command-center" component={CommandCenter} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/donations" component={Donations} />
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/donors" component={Donors} />
        <Route path="/donors/:id" component={DonorDetail} />
        <Route path="/rescue-cases" component={RescueCases} />
        <Route path="/rescue-cases/:id" component={RescueCaseDetail} />
        <Route path="/volunteers" component={Volunteers} />
        <Route path="/medical-recovery" component={MedicalRecovery} />
        <Route path="/adoptions" component={Adoptions} />
        <Route path="/inventory" component={Inventory} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </NotificationsProvider>
    </QueryClientProvider>
  );
}

export default App;
