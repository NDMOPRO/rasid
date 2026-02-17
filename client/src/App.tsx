import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Overview from "./pages/Overview";
import PrivacyDashboard from "./pages/PrivacyDashboard";
import PrivacySites from "./pages/PrivacySites";
import SiteDetails from "./pages/SiteDetails";
import IncidentsDashboard from "./pages/IncidentsDashboard";
import IncidentsList from "./pages/IncidentsList";
import IncidentDetails from "./pages/IncidentDetails";
import FollowupsList from "./pages/FollowupsList";
import ReportsList from "./pages/ReportsList";
import MyDashboard from "./pages/MyDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import VerifyPage from "./pages/VerifyPage";
import SmartRasid from "./pages/SmartRasid";
import SmartRasidFAB from "./components/SmartRasidFAB";
import { useEffect } from "react";
import { useLocation } from "wouter";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Public pages */}
        <Route path="/" component={Home} />
        <Route path="/verify" component={VerifyPage} />
        <Route path="/verify/:code" component={VerifyPage} />

        {/* App pages - wrapped in AppLayout */}
        <Route path="/app/:rest*">
          <AppLayout>
            <Switch>
              <Route path="/app/overview" component={Overview} />
              <Route path="/app/privacy" component={PrivacyDashboard} />
              <Route path="/app/privacy/sites" component={PrivacySites} />
              <Route path="/app/privacy/sites/:siteId" component={SiteDetails} />
              <Route path="/app/incidents" component={IncidentsDashboard} />
              <Route path="/app/incidents/list" component={IncidentsList} />
              <Route path="/app/incidents/:incidentId" component={IncidentDetails} />
              <Route path="/app/followups" component={FollowupsList} />
              <Route path="/app/reports" component={ReportsList} />
              <Route path="/app/my" component={MyDashboard} />
              <Route path="/app/smart-rasid" component={SmartRasid} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </Route>

        {/* Admin pages */}
        <Route path="/admin/:rest*">
          <AppLayout>
            <Switch>
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/settings" component={AdminSettings} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </Route>

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
          <SmartRasidFAB />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
