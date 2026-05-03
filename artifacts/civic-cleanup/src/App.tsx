import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";

// Auth
import AuthPage from "@/pages/AuthPage";
import LandingPage from "@/pages/LandingPage";

// Citizen
import CitizenDashboard from "@/pages/citizen/CitizenDashboard";
import ReportsPage from "@/pages/citizen/ReportsPage";
import WalletPage from "@/pages/citizen/WalletPage";
import TrainingPage from "@/pages/citizen/TrainingPage";
import ScrapPage from "@/pages/citizen/ScrapPage";
import DonationsPage from "@/pages/citizen/DonationsPage";
import EventsPage from "@/pages/citizen/EventsPage";
import LeaderboardPage from "@/pages/citizen/LeaderboardPage";
import SettingsPage from "@/pages/citizen/SettingsPage";
import CitizenDustbinPage from "@/pages/citizen/CitizenDustbinPage";

// Worker
import WorkerDashboard from "@/pages/worker/WorkerDashboard";
import WorkerReportsPage from "@/pages/worker/WorkerReportsPage";
import DustbinScanPage from "@/pages/worker/DustbinScanPage";
import SmartBinPage from "@/pages/worker/SmartBinPage";
import WorkerTaskPage from "@/pages/worker/WorkerTaskPage";

// NGO
import NgoDashboard from "@/pages/ngo/NgoDashboard";
import NgoDonationsPage from "@/pages/ngo/NgoDonationsPage";
import NgoEventsPage from "@/pages/ngo/NgoEventsPage";
import NgoUrgentPage from "@/pages/ngo/NgoUrgentPage";

// Citizen extras
import CitizenUrgentNeedsPage from "@/pages/citizen/CitizenUrgentNeedsPage";

// Scrap Dealer
import ScrapDealerDashboard from "@/pages/scrap/ScrapDealerDashboard";

// Admin
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminTrainingPage from "@/pages/admin/AdminTrainingPage";
import AdminRedeemPage from "@/pages/admin/AdminRedeemPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

function AuthGuard({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, roles, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Redirect to="/auth" />;

  if (role && !roles.includes(role) && !roles.includes("admin")) {
    const fallback = roles.includes("admin") ? "/admin" : roles.includes("worker") ? "/worker" : roles.includes("ngo") ? "/ngo" : roles.includes("scrap_dealer") ? "/scrap" : "/citizen";
    return <Redirect to={fallback} />;
  }

  return <>{children}</>;
}

function AppRouter() {
  const { user, roles } = useAuth();

  return (
    <Switch>
      {/* Auth */}
      <Route path="/auth" component={AuthPage} />

      {/* Root — landing for guests, dashboard for authenticated */}
      <Route path="/">
        {user ? (
          <Redirect to={
            roles.includes("admin") ? "/admin" :
            roles.includes("worker") ? "/worker" :
            roles.includes("ngo") ? "/ngo" :
            roles.includes("scrap_dealer") ? "/scrap" :
            "/citizen"
          } />
        ) : (
          <LandingPage />
        )}
      </Route>

      {/* Citizen routes */}
      <Route path="/citizen">
        <AuthGuard><CitizenDashboard /></AuthGuard>
      </Route>
      <Route path="/citizen/reports">
        <AuthGuard><ReportsPage /></AuthGuard>
      </Route>
      <Route path="/citizen/wallet">
        <AuthGuard><WalletPage /></AuthGuard>
      </Route>
      <Route path="/citizen/training">
        <AuthGuard><TrainingPage /></AuthGuard>
      </Route>
      <Route path="/citizen/scrap">
        <AuthGuard><ScrapPage /></AuthGuard>
      </Route>
      <Route path="/citizen/donate">
        <AuthGuard><DonationsPage /></AuthGuard>
      </Route>
      <Route path="/citizen/events">
        <AuthGuard><EventsPage /></AuthGuard>
      </Route>
      <Route path="/citizen/leaderboard">
        <AuthGuard><LeaderboardPage /></AuthGuard>
      </Route>
      <Route path="/citizen/notifications">
        <AuthGuard><CitizenDashboard /></AuthGuard>
      </Route>
      <Route path="/citizen/settings">
        <AuthGuard><SettingsPage /></AuthGuard>
      </Route>
      <Route path="/citizen/dustbin">
        <AuthGuard><CitizenDustbinPage /></AuthGuard>
      </Route>
      <Route path="/citizen/ngo-needs">
        <AuthGuard><CitizenUrgentNeedsPage /></AuthGuard>
      </Route>

      {/* Worker routes */}
      <Route path="/worker">
        <AuthGuard role="worker"><WorkerDashboard /></AuthGuard>
      </Route>
      <Route path="/worker/reports">
        <AuthGuard role="worker"><WorkerReportsPage /></AuthGuard>
      </Route>
      <Route path="/worker/bins">
        <AuthGuard role="worker"><SmartBinPage /></AuthGuard>
      </Route>
      <Route path="/worker/dustbin">
        <AuthGuard role="worker"><DustbinScanPage /></AuthGuard>
      </Route>
      <Route path="/worker/training">
        <AuthGuard role="worker"><TrainingPage /></AuthGuard>
      </Route>
      <Route path="/worker/task/:id">
        <AuthGuard role="worker"><WorkerTaskPage /></AuthGuard>
      </Route>

      {/* NGO routes */}
      <Route path="/ngo">
        <AuthGuard role="ngo"><NgoDashboard /></AuthGuard>
      </Route>
      <Route path="/ngo/donations">
        <AuthGuard role="ngo"><NgoDonationsPage /></AuthGuard>
      </Route>
      <Route path="/ngo/feed">
        <AuthGuard role="ngo"><NgoDashboard /></AuthGuard>
      </Route>
      <Route path="/ngo/events">
        <AuthGuard role="ngo"><EventsPage /></AuthGuard>
      </Route>
      <Route path="/ngo/manage-events">
        <AuthGuard role="ngo"><NgoEventsPage /></AuthGuard>
      </Route>
      <Route path="/ngo/urgent">
        <AuthGuard role="ngo"><NgoUrgentPage /></AuthGuard>
      </Route>

      {/* Scrap Dealer routes */}
      <Route path="/scrap">
        <AuthGuard role="scrap_dealer"><ScrapDealerDashboard /></AuthGuard>
      </Route>
      <Route path="/scrap/listings">
        <AuthGuard role="scrap_dealer"><ScrapDealerDashboard /></AuthGuard>
      </Route>
      <Route path="/scrap/prices">
        <AuthGuard role="scrap_dealer"><ScrapDealerDashboard /></AuthGuard>
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        <AuthGuard role="admin"><AdminDashboard /></AuthGuard>
      </Route>
      <Route path="/admin/users">
        <AuthGuard role="admin"><AdminUsersPage /></AuthGuard>
      </Route>
      <Route path="/admin/reports">
        <AuthGuard role="admin"><AdminReportsPage /></AuthGuard>
      </Route>
      <Route path="/admin/training">
        <AuthGuard role="admin"><AdminTrainingPage /></AuthGuard>
      </Route>
      <Route path="/admin/redeem">
        <AuthGuard role="admin"><AdminRedeemPage /></AuthGuard>
      </Route>
      <Route path="/admin/events">
        <AuthGuard role="admin"><EventsPage /></AuthGuard>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
