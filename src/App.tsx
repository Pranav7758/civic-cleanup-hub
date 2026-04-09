import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CitizenDashboard from "./pages/CitizenDashboard";
import CitizenTraining from "./pages/CitizenTraining";
import CitizenWallet from "./pages/CitizenWallet";
import CitizenReportWaste from "./pages/CitizenReportWaste";
import CitizenScrapSell from "./pages/CitizenScrapSell";
import CitizenDonateHub from "./pages/CitizenDonateHub";
import CommunityEvents from "./pages/CommunityEvents";
import WorkerDashboard from "./pages/WorkerDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import ScrapDashboard from "./pages/ScrapDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/citizen/training" element={<CitizenTraining />} />
          <Route path="/citizen/wallet" element={<CitizenWallet />} />
          <Route path="/citizen/report" element={<CitizenReportWaste />} />
          <Route path="/citizen/scrap" element={<CitizenScrapSell />} />
          <Route path="/citizen/donate" element={<CitizenDonateHub />} />
          <Route path="/citizen/events" element={<CommunityEvents />} />
          <Route path="/worker/*" element={<WorkerDashboard />} />
          <Route path="/ngo/*" element={<NgoDashboard />} />
          <Route path="/scrap/*" element={<ScrapDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
