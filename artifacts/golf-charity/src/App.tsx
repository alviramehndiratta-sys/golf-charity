import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";

import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import CharitiesPage from "@/pages/charities";
import CharityDetailPage from "@/pages/charity-detail";
import DrawsPage from "@/pages/draws";
import AdminPage from "@/pages/admin/index";
import AdminUsersPage from "@/pages/admin/users";
import AdminDrawsPage from "@/pages/admin/draws";
import AdminCharitiesPage from "@/pages/admin/charities";
import AdminWinnersPage from "@/pages/admin/winners";
import NotFound from "@/pages/not-found";

setAuthTokenGetter(() => localStorage.getItem("gc_token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const NO_NAVBAR_PATHS = ["/login", "/register"];

function AppLayout() {
  const [location] = useLocation();
  const showNavbar = !NO_NAVBAR_PATHS.includes(location);

  return (
    <>
      {showNavbar && <Navbar />}
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/charities" component={CharitiesPage} />
        <Route path="/charities/:id" component={CharityDetailPage} />
        <Route path="/draws" component={DrawsPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/admin/users" component={AdminUsersPage} />
        <Route path="/admin/draws" component={AdminDrawsPage} />
        <Route path="/admin/charities" component={AdminCharitiesPage} />
        <Route path="/admin/winners" component={AdminWinnersPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppLayout />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
