import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CitizenDashboard from "./pages/CitizenDashboard";
import CitizenTraining from "./pages/CitizenTraining";
import CitizenWallet from "./pages/CitizenWallet";
import CitizenReportWaste from "./pages/CitizenReportWaste";
import CitizenScrapSell from "./pages/CitizenScrapSell";
import CitizenDonateHub from "./pages/CitizenDonateHub";
import CommunityEvents from "./pages/CommunityEvents";
import CommunityFeed from "./pages/CommunityFeed";
import PeerVerify from "./pages/PeerVerify";
import WorkerDashboard from "./pages/WorkerDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import ScrapDashboard from "./pages/ScrapDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.some(r => roles.includes(r))) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/citizen" element={<ProtectedRoute allowedRoles={["citizen"]}><CitizenDashboard /></ProtectedRoute>} />
    <Route path="/citizen/training" element={<ProtectedRoute allowedRoles={["citizen"]}><CitizenTraining /></ProtectedRoute>} />
    <Route path="/citizen/wallet" element={<ProtectedRoute allowedRoles={["citizen"]}><CitizenWallet /></ProtectedRoute>} />
    <Route path="/citizen/report" element={<ProtectedRoute allowedRoles={["citizen"]}><CitizenReportWaste /></ProtectedRoute>} />
    <Route path="/citizen/scrap" element={<ProtectedRoute allowedRoles={["citizen"]}><CitizenScrapSell /></ProtectedRoute>} />
    <Route path="/citizen/donate" element={<ProtectedRoute allowedRoles={["citizen"]}><CitizenDonateHub /></ProtectedRoute>} />
    <Route path="/citizen/events" element={<ProtectedRoute allowedRoles={["citizen"]}><CommunityEvents /></ProtectedRoute>} />
    <Route path="/citizen/verify" element={<ProtectedRoute allowedRoles={["citizen"]}><PeerVerify /></ProtectedRoute>} />
    <Route path="/community" element={<ProtectedRoute allowedRoles={["citizen", "ngo", "admin"]}><CommunityFeed /></ProtectedRoute>} />
    <Route path="/worker/*" element={<ProtectedRoute allowedRoles={["worker"]}><WorkerDashboard /></ProtectedRoute>} />
    <Route path="/ngo/*" element={<ProtectedRoute allowedRoles={["ngo"]}><NgoDashboard /></ProtectedRoute>} />
    <Route path="/scrap/*" element={<ProtectedRoute allowedRoles={["scrap_dealer"]}><ScrapDashboard /></ProtectedRoute>} />
    <Route path="/admin/*" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
