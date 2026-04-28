import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Explorer from "./pages/Explorer.tsx";
import ActivityDetail from "./pages/ActivityDetail.tsx";
import MyBookings from "./pages/MyBookings.tsx";
import ProLanding from "./pages/ProLanding.tsx";
import ProDashboard from "./pages/ProDashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/activite/:id" element={<ActivityDetail />} />
            <Route path="/mes-reservations" element={<MyBookings />} />
            <Route path="/pro" element={<ProLanding />} />
            <Route path="/pro/dashboard" element={<ProDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
