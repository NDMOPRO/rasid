# rasid-leaks - client-src

> Auto-extracted source code documentation

---

## `client/src/App.tsx`

```tsx
import { Suspense, lazy, useState, useCallback } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/atlas/DataContext";
import { FilterProvider } from "./contexts/FilterContext";
import { PlatformSettingsProvider } from "./contexts/PlatformSettingsContext";
import { GuideProvider } from "./contexts/GuideContext";
import DashboardLayout from "./components/DashboardLayout";
import AtlasDashboardLayout from "./components/atlas/AtlasDashboardLayout";
import TopProgressBar from "./components/TopProgressBar";
import RasidLoadingScreen from "./components/RasidLoadingScreen";
import { PageSkeleton } from "./components/Skeletons";
import CommandPalette from "./components/CommandPalette";
import ScrollToTop from "./components/ScrollToTop";
import { WorkspaceProvider } from "./core/contexts/WorkspaceContext";
import WorkspaceGuard from "./core/components/WorkspaceGuard";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Reports = lazy(() => import("./pages/Reports"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Members = lazy(() => import("./pages/Members"));
const Login = lazy(() => import("./pages/Login"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const ActivityLogs = lazy(() => import("./pages/ActivityLogs"));
const MobileApps = lazy(() => import("./pages/MobileApps"));
const Cases = lazy(() => import("./pages/Cases"));
const MessageTemplates = lazy(() => import("./pages/MessageTemplates"));
const RoleDashboard = lazy(() => import("./pages/RoleDashboard"));
const EscalationRules = lazy(() => import("./pages/EscalationRules"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const Profile = lazy(() => import("./pages/Profile"));
const MyCustomDashboard = lazy(() => import("./pages/MyDashboard"));
const VisualAlerts = lazy(() => import("./pages/VisualAlerts"));
const EmailNotifications = lazy(() => import("./pages/EmailNotifications"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const ExportData = lazy(() => import("./pages/ExportData"));
const InteractiveComparison = lazy(() => import("./pages/InteractiveComparison"));
const EmailManagement = lazy(() => import("./pages/EmailManagement"));
const VerifyDocument = lazy(() => import("./pages/VerifyDocument"));
const PublicVerify = lazy(() => import("./pages/PublicVerify"));
const DocumentsRegistry = lazy(() => import("./pages/DocumentsRegistry"));
const DocumentStats = lazy(() => import("./pages/DocumentStats"));
const PresentationMode = lazy(() => import("./pages/PresentationMode"));
const SmartRasid = lazy(() => import("./pages/SmartRasid"));
const ScenarioManagement = lazy(() => import("./pages/ScenarioManagement"));
const TrainingCenter = lazy(() => import("./pages/TrainingCenter"));
const AiManagement = lazy(() => import("./pages/AiManagement"));
const BulkAnalysis = lazy(() => import("./pages/BulkAnalysis"));
const UsageAnalytics = lazy(() => import("./pages/UsageAnalytics"));
const SuperAdminPanel = lazy(() => import("./pages/SuperAdminPanel"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthLog = lazy(() => import("./pages/AuthLog"));
const Permissions = lazy(() => import("./pages/Permissions"));

// Hub Pages — Platform Separation
const BreachDashboardsHub = lazy(() => import("./pages/BreachDashboardsHub"));
const BreachOperationsHub = lazy(() => import("./pages/BreachOperationsHub"));

// Import Pages
const BreachImport = lazy(() => import("./pages/BreachImport"));

// Platform 2 unique pages
const TelegramMonitor = lazy(() => import("./pages/TelegramMonitor"));
const DarkWebMonitor = lazy(() => import("./pages/DarkWebMonitor"));
const PasteSites = lazy(() => import("./pages/PasteSites"));
const PIIClassifier = lazy(() => import("./pages/PIIClassifier"));
const Leaks = lazy(() => import("./pages/Leaks"));
const ReportApproval = lazy(() => import("./pages/ReportApproval"));
const MonitoringJobs = lazy(() => import("./pages/MonitoringJobs"));
const ThreatMap = lazy(() => import("./pages/ThreatMap"));
const AlertChannels = lazy(() => import("./pages/AlertChannels"));
const DataRetention = lazy(() => import("./pages/DataRetention"));
const AuditLog = lazy(() => import("./pages/AuditLog"));
const ThreatRules = lazy(() => import("./pages/ThreatRules"));
const EvidenceChain = lazy(() => import("./pages/EvidenceChain"));
const SellerProfiles = lazy(() => import("./pages/SellerProfiles"));
const OsintTools = lazy(() => import("./pages/OsintTools"));
const FeedbackAccuracy = lazy(() => import("./pages/FeedbackAccuracy"));
const KnowledgeGraph = lazy(() => import("./pages/KnowledgeGraph"));
const PIIAtlas = lazy(() => import("./pages/PIIAtlas"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const LiveScan = lazy(() => import("./pages/LiveScan"));
const KnowledgeBaseAdmin = lazy(() => import("./pages/KnowledgeBaseAdmin"));
const PersonalityScenarios = lazy(() => import("./pages/PersonalityScenarios"));
const NationalOverview = lazy(() => import("./pages/NationalOverview"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LeakAnatomy = lazy(() => import("./pages/LeakAnatomy"));
const SectorAnalysis = lazy(() => import("./pages/SectorAnalysis"));
const LeakTimeline = lazy(() => import("./pages/LeakTimeline"));
const ThreatActorsAnalysis = lazy(() => import("./pages/ThreatActorsAnalysis"));
const ImpactAssessment = lazy(() => import("./pages/ImpactAssessment"));
const SourceIntelligence = lazy(() => import("./pages/SourceIntelligence"));
const GeoAnalysis = lazy(() => import("./pages/GeoAnalysis"));
const IncidentCompare = lazy(() => import("./pages/IncidentCompare"));

const CampaignTracker = lazy(() => import("./pages/CampaignTracker"));
const RecommendationsHub = lazy(() => import("./pages/RecommendationsHub"));
const ExecutiveBrief = lazy(() => import("./pages/ExecutiveBrief"));
const IncidentsRegistry = lazy(() => import("./pages/IncidentsRegistry"));
const PlatformLogin = lazy(() => import("./pages/PlatformLogin"));

// Admin sub-pages
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminGroups = lazy(() => import("./pages/admin/AdminGroups"));
const AdminFeatureFlags = lazy(() => import("./pages/admin/AdminFeatureFlags"));
const AdminTheme = lazy(() => import("./pages/admin/AdminTheme"));
const AdminMenus = lazy(() => import("./pages/admin/AdminMenus"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminContentTypes = lazy(() => import("./pages/admin/AdminContentTypes"));
const AdminMediaLibrary = lazy(() => import("./pages/admin/AdminMediaLibrary"));
const AdminBackups = lazy(() => import("./pages/admin/AdminBackups"));
const AdminPageTemplates = lazy(() => import("./pages/admin/AdminPageTemplates"));
const AdminScheduledContent = lazy(() => import("./pages/admin/AdminScheduledContent"));
const AdminControlPanel = lazy(() => import("./pages/AdminControlPanel"));
const AdminCMSPage = lazy(() => import("./pages/AdminCMS"));
const AdminOperationsPage = lazy(() => import("./pages/AdminOperations"));
const AdminSettingsPage = lazy(() => import("./pages/AdminSettings"));

// Additional missing pages
const IncidentsDashboard = lazy(() => import("./pages/IncidentsDashboard"));
const IncidentsList = lazy(() => import("./pages/IncidentsList"));
const IncidentDetails = lazy(() => import("./pages/IncidentDetails"));
const FollowupsList = lazy(() => import("./pages/FollowupsList"));
const Overview = lazy(() => import("./pages/Overview"));
const ReportsList = lazy(() => import("./pages/ReportsList"));

// Atlas Pages — from rasid-atlas
const AtlasNationalOverview = lazy(() => import("./pages/atlas/NationalOverview"));
const AtlasIncidentRegistry = lazy(() => import("./pages/atlas/IncidentRegistry"));
const AtlasPiiAtlas = lazy(() => import("./pages/atlas/PiiAtlas"));
const AtlasPatternLab = lazy(() => import("./pages/atlas/PatternLab"));
const AtlasImpactLens = lazy(() => import("./pages/atlas/ImpactLens"));
const AtlasTrendsComparison = lazy(() => import("./pages/atlas/TrendsComparison"));
const AtlasReportsCenter = lazy(() => import("./pages/atlas/ReportsCenter"));
const AtlasExternalPlatform = lazy(() => import("./pages/atlas/ExternalPlatform"));

// Control Hub — لوحة التحكم الشاملة
const ControlHub = lazy(() => import("./pages/ControlHub"));

// Contracts & Teams Pages
const Contracts = lazy(() => import("./pages/Contracts"));
const TeamPage = lazy(() => import("./pages/Team"));

// Dynamic custom pages
const DynamicDashboard = lazy(() => import("./pages/DynamicDashboard"));
const DynamicTable = lazy(() => import("./pages/DynamicTable"));
const DynamicReport = lazy(() => import("./pages/DynamicReport"));

// ═══════════════ Privacy Workspace Pages ═══════════════
const PrivacyDashboard = lazy(() => import("./privacy/pages/PrivacyDashboard"));
const PrivacySites = lazy(() => import("./privacy/pages/PrivacySites"));
const PrivacyScans = lazy(() => import("./privacy/pages/PrivacyScans"));
const ComplianceClauses = lazy(() => import("./privacy/pages/ComplianceClauses"));
const ComplianceLetters = lazy(() => import("./privacy/pages/ComplianceLetters"));
const ComplianceAlerts = lazy(() => import("./privacy/pages/ComplianceAlerts"));
const SiteWatchers = lazy(() => import("./privacy/pages/SiteWatchers"));
const BatchScanning = lazy(() => import("./privacy/pages/BatchScanning"));
const SectorComparison = lazy(() => import("./privacy/pages/SectorComparison"));
const ComplianceTrends = lazy(() => import("./privacy/pages/ComplianceTrends"));
const PrivacyLiveScan = lazy(() => import("./privacy/pages/PrivacyLiveScan"));
const PrivacyAssessment = lazy(() => import("./privacy/pages/PrivacyAssessment"));
const DSARRequests = lazy(() => import("./privacy/pages/DSARRequests"));
const PrivacyImpact = lazy(() => import("./privacy/pages/PrivacyImpact"));
const ConsentManagement = lazy(() => import("./privacy/pages/ConsentManagement"));
const ProcessingRecords = lazy(() => import("./privacy/pages/ProcessingRecords"));
const MobileAppsPrivacy = lazy(() => import("./privacy/pages/MobileAppsPrivacy"));
const PrivacyExecutiveDashboard = lazy(() => import("./privacy/pages/PrivacyExecutiveDashboard"));

function Router() {
  return (
    <DashboardLayout>
      <ScrollToTop />
      <Suspense fallback={<PageSkeleton />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/reports" component={Reports} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/members" component={Members} />
          <Route path="/change-password" component={ChangePassword} />
          <Route path="/activity-logs" component={ActivityLogs} />
          <Route path="/mobile-apps" component={MobileApps} />
          <Route path="/cases" component={Cases} />
          <Route path="/message-templates" component={MessageTemplates} />
          <Route path="/my-dashboard" component={RoleDashboard} />
          <Route path="/escalation" component={EscalationRules} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/api-keys" component={ApiKeys} />
          <Route path="/system-health" component={SystemHealth} />
          <Route path="/profile" component={Profile} />
          <Route path="/my-custom-dashboard" component={MyCustomDashboard} />
          <Route path="/visual-alerts" component={VisualAlerts} />
          <Route path="/email-notifications" component={EmailNotifications} />
          <Route path="/admin-panel" component={AdminPanel} />
          <Route path="/export-data" component={ExportData} />
          <Route path="/interactive-comparison" component={InteractiveComparison} />
          <Route path="/email-management" component={EmailManagement} />
          <Route path="/verify/:code?" component={VerifyDocument} />
          <Route path="/documents-registry" component={DocumentsRegistry} />
          <Route path="/document-stats" component={DocumentStats} />
          <Route path="/presentation" component={PresentationMode} />
          <Route path="/smart-rasid" component={SmartRasid} />
          <Route path="/scenario-management" component={ScenarioManagement} />
          <Route path="/training-center" component={TrainingCenter} />
          <Route path="/ai-management" component={AiManagement} />
          <Route path="/bulk-analysis" component={BulkAnalysis} />
          <Route path="/usage-analytics" component={UsageAnalytics} />
          <Route path="/super-admin" component={SuperAdminPanel} />
          {/* Platform 2 unique routes */}
          <Route path="/telegram" component={TelegramMonitor} />
          <Route path="/darkweb" component={DarkWebMonitor} />
          <Route path="/paste-sites" component={PasteSites} />
          <Route path="/pii-classifier" component={PIIClassifier} />
          <Route path="/leaks" component={Leaks} />
          <Route path="/report-approval" component={ReportApproval} />
          <Route path="/monitoring-jobs" component={MonitoringJobs} />
          <Route path="/threat-map" component={ThreatMap} />
          <Route path="/alert-channels" component={AlertChannels} />
          <Route path="/data-retention" component={DataRetention} />
          <Route path="/audit-log" component={AuditLog} />
          <Route path="/auth-log" component={AuthLog} />
          <Route path="/permissions" component={Permissions} />
          <Route path="/threat-rules" component={ThreatRules} />
          <Route path="/evidence-chain" component={EvidenceChain} />
          <Route path="/seller-profiles" component={SellerProfiles} />
          <Route path="/osint-tools" component={OsintTools} />
          <Route path="/feedback-accuracy" component={FeedbackAccuracy} />
          <Route path="/knowledge-graph" component={KnowledgeGraph} />
          <Route path="/pii-atlas" component={PIIAtlas} />
          <Route path="/user-management" component={UserManagement} />
          <Route path="/live-scan" component={LiveScan} />
          <Route path="/knowledge-base" component={KnowledgeBaseAdmin} />
          <Route path="/personality-scenarios" component={PersonalityScenarios} />
          <Route path="/leak-anatomy" component={LeakAnatomy} />
          <Route path="/sector-analysis" component={SectorAnalysis} />
          <Route path="/leak-timeline" component={LeakTimeline} />
          <Route path="/threat-actors-analysis" component={ThreatActorsAnalysis} />
          <Route path="/impact-assessment" component={ImpactAssessment} />
          <Route path="/source-intelligence" component={SourceIntelligence} />
          <Route path="/geo-analysis" component={GeoAnalysis} />
          <Route path="/incident-compare" component={IncidentCompare} />

          <Route path="/campaign-tracker" component={CampaignTracker} />
          <Route path="/recommendations" component={RecommendationsHub} />
          <Route path="/executive-brief" component={ExecutiveBrief} />
          <Route path="/incidents-registry" component={IncidentsRegistry} />
          {/* Admin sub-routes */}
          <Route path="/admin" component={AdminOverview} />
          <Route path="/admin/roles" component={AdminRoles} />
          <Route path="/admin/groups" component={AdminGroups} />
          <Route path="/admin/feature-flags" component={AdminFeatureFlags} />
          <Route path="/admin/theme" component={AdminTheme} />
          <Route path="/admin/menus" component={AdminMenus} />
          <Route path="/admin/audit-log" component={AdminAuditLog} />
          <Route path="/admin/control" component={AdminControlPanel} />
          <Route path="/admin/cms" component={AdminCMSPage} />
          <Route path="/admin/operations" component={AdminOperationsPage} />
          <Route path="/admin/settings" component={AdminSettingsPage} />
          <Route path="/admin/security" component={AdminSecurity} />
          <Route path="/admin/content-types" component={AdminContentTypes} />
          <Route path="/admin/media" component={AdminMediaLibrary} />
          <Route path="/admin/backups" component={AdminBackups} />
          <Route path="/admin/page-templates" component={AdminPageTemplates} />
          <Route path="/admin/scheduled-content" component={AdminScheduledContent} />
          {/* New structured routes per spec */}
          <Route path="/app/overview" component={Overview} />
          <Route path="/app/incidents" component={IncidentsDashboard} />
          <Route path="/app/incidents/list" component={IncidentsList} />
          <Route path="/app/incidents/:incidentId" component={IncidentDetails} />
          <Route path="/app/my" component={MyCustomDashboard} />
          <Route path="/app/followups" component={FollowupsList} />
          <Route path="/app/reports" component={ReportsList} />
          <Route path="/recommendations-hub" component={RecommendationsHub} />
          {/* Hub Pages — Platform Separation */}
          <Route path="/breach-dashboards" component={BreachDashboardsHub} />
          <Route path="/breach-operations" component={BreachOperationsHub} />
          {/* Import Pages */}
          <Route path="/breach-import" component={BreachImport} />
          {/* Atlas Pages — inside DashboardLayout to keep same sidebar */}
          <Route path="/atlas/overview" component={AtlasNationalOverview} />
          <Route path="/atlas/incidents" component={AtlasIncidentRegistry} />
          <Route path="/atlas/pii-atlas" component={AtlasPiiAtlas} />
          <Route path="/atlas/pattern-lab" component={AtlasPatternLab} />
          <Route path="/atlas/impact-lens" component={AtlasImpactLens} />
          <Route path="/atlas/trends" component={AtlasTrendsComparison} />
          <Route path="/atlas/reports" component={AtlasReportsCenter} />
          <Route path="/atlas/platform/compliance">
            {() => <AtlasExternalPlatform url="https://rasid-leaks-production.up.railway.app" title="راصد الحالات" titleEn="Rasid Leaks" description="رصد البيانات الشخصية" icon={() => null} accentColor="#F0D060" />}
          </Route>

          {/* Dynamic Custom Pages */}
          <Route path="/contracts" component={Contracts} />
          <Route path="/team" component={TeamPage} />
          <Route path="/custom/dashboard/:id" component={DynamicDashboard} />
          <Route path="/custom/table/:id" component={DynamicTable} />
          <Route path="/custom/report/:id" component={DynamicReport} />
          {/* ═══════════════ Privacy Workspace Routes (Protected) ═══════════════ */}
          <Route path="/privacy/:rest*">
            <WorkspaceGuard workspace="privacy">
              <Suspense fallback={<PageSkeleton />}>
                <Switch>
                  <Route path="/privacy/dashboard" component={PrivacyDashboard} />
                  <Route path="/privacy/sites" component={PrivacySites} />
                  <Route path="/privacy/scans" component={PrivacyScans} />
                  <Route path="/privacy/clauses" component={ComplianceClauses} />
                  <Route path="/privacy/letters" component={ComplianceLetters} />
                  <Route path="/privacy/alerts" component={ComplianceAlerts} />
                  <Route path="/privacy/watchers" component={SiteWatchers} />
                  <Route path="/privacy/batch-scan" component={BatchScanning} />
                  <Route path="/privacy/sector-comparison" component={SectorComparison} />
                  <Route path="/privacy/trends" component={ComplianceTrends} />
                  <Route path="/privacy/live-scan" component={PrivacyLiveScan} />
                  <Route path="/privacy/assessment" component={PrivacyAssessment} />
                  <Route path="/privacy/dsar" component={DSARRequests} />
                  <Route path="/privacy/dpia" component={PrivacyImpact} />
                  <Route path="/privacy/consent" component={ConsentManagement} />
                  <Route path="/privacy/processing-records" component={ProcessingRecords} />
                  <Route path="/privacy/mobile-apps" component={MobileAppsPrivacy} />
                  <Route path="/privacy/executive" component={PrivacyExecutiveDashboard} />
                  <Route component={NotFound} />
                </Switch>
              </Suspense>
            </WorkspaceGuard>
          </Route>

          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </DashboardLayout>
  );
}

/** Atlas Router — uses AtlasDashboardLayout with its own sidebar/topbar */
function AtlasRouter() {
  return (
    <AtlasDashboardLayout>
      <Suspense fallback={<PageSkeleton />}>
        <Switch>
          <Route path="/atlas/overview" component={AtlasNationalOverview} />
          <Route path="/atlas/incidents" component={AtlasIncidentRegistry} />
          <Route path="/atlas/pii-atlas" component={AtlasPiiAtlas} />
          <Route path="/atlas/pattern-lab" component={AtlasPatternLab} />
          <Route path="/atlas/impact-lens" component={AtlasImpactLens} />
          <Route path="/atlas/trends" component={AtlasTrendsComparison} />
          <Route path="/atlas/reports" component={AtlasReportsCenter} />
          <Route path="/atlas/platform/compliance">
            {() => <AtlasExternalPlatform url="https://rasid-leaks-production.up.railway.app" title="راصد الحالات" titleEn="Rasid Leaks" description="رصد البيانات الشخصية" icon={() => null} accentColor="#F0D060" />}
          </Route>
          <Route component={() => { window.location.href = '/atlas/overview'; return null; }} />
        </Switch>
      </Suspense>
    </AtlasDashboardLayout>
  );
}

function App() {
  const [appReady, setAppReady] = useState(false);
  const handleLoadingFinish = useCallback(() => setAppReady(true), []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <WorkspaceProvider>
        <GuideProvider>
        <FilterProvider>
        <PlatformSettingsProvider>
        <DataProvider>
        <TooltipProvider>
          {/* Premium Loading Screen with Rasid Character */}
          <RasidLoadingScreen show={!appReady} onFinish={handleLoadingFinish} minDuration={1200} />
          <TopProgressBar />
          <Toaster />
          <CommandPalette />
          <Switch>
            <Route path="/login">
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
                <Login />
              </Suspense>
            </Route>
            <Route path="/forgot-password">
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
                <ForgotPassword />
              </Suspense>
            </Route>
            <Route path="/public-verify">
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
                <PublicVerify />
              </Suspense>
            </Route>
            <Route path="/control-hub">
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
                <ControlHub />
              </Suspense>
            </Route>
            <Route>
              <Router />
            </Route>
          </Switch>
        </TooltipProvider>
        </DataProvider>
        </PlatformSettingsProvider>
        </FilterProvider>
        </GuideProvider>
        </WorkspaceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

```

---

## `client/src/const.ts`

```typescript
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local login — always redirect to /login page (no Manus OAuth)
export const getLoginUrl = (returnPath?: string) => {
  if (returnPath) {
    return `/login?returnTo=${encodeURIComponent(returnPath)}`;
  }
  return "/login";
};

```

---

## `client/src/core/components/WorkspaceGuard.tsx`

```tsx
import { type ReactNode } from "react";
import { useWorkspace, type Workspace } from "../contexts/WorkspaceContext";
import { ShieldX } from "lucide-react";

interface WorkspaceGuardProps {
  workspace: Workspace;
  children: ReactNode;
}

export default function WorkspaceGuard({ workspace, children }: WorkspaceGuardProps) {
  const { allowed } = useWorkspace();

  if (!allowed.includes(workspace)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white/90">غير مصرّح بالوصول</h2>
        <p className="text-sm text-white/50 max-w-md">
          ليس لديك صلاحية الوصول إلى مساحة {workspace === "leaks" ? "رصد الحالات" : "رصد الخصوصية"}.
          تواصل مع مسؤول النظام لتحديث صلاحياتك.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

```

---

## `client/src/core/components/WorkspaceSwitcher.tsx`

```tsx
import { useWorkspace, type Workspace } from "../contexts/WorkspaceContext";
import { Shield, Eye, ArrowLeftRight } from "lucide-react";

const workspaceConfig: Record<Workspace, { label: string; labelEn: string; icon: typeof Shield; color: string; bg: string }> = {
  leaks: {
    label: "رصد الحالات",
    labelEn: "Leak Monitoring",
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-500/10 hover:bg-red-500/20 border-red-500/20",
  },
  privacy: {
    label: "رصد الخصوصية",
    labelEn: "Privacy Compliance",
    icon: Eye,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
  },
};

export default function WorkspaceSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { current, allowed, switchWorkspace } = useWorkspace();
  const config = workspaceConfig[current];
  const Icon = config.icon;

  // Only one workspace allowed — no switch needed
  if (allowed.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/5" dir="rtl">
        <Icon className={`w-4 h-4 ${config.color}`} />
        {!collapsed && <span className="text-xs font-medium text-white/80">{config.label}</span>}
      </div>
    );
  }

  const otherWs: Workspace = current === "leaks" ? "privacy" : "leaks";
  const otherConfig = workspaceConfig[otherWs];

  return (
    <div className="space-y-1.5" dir="rtl">
      {/* Current workspace indicator */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color} flex-shrink-0`} />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white/90 truncate">{config.label}</div>
          </div>
        )}
      </div>

      {/* Switch button */}
      <button
        onClick={() => switchWorkspace(otherWs)}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10"
      >
        <ArrowLeftRight className="w-3 h-3 flex-shrink-0" />
        {!collapsed && (
          <span className="text-[10px]">التبديل إلى {otherConfig.label}</span>
        )}
      </button>
    </div>
  );
}

```

---

## `client/src/core/contexts/WorkspaceContext.tsx`

```tsx
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";

export type Workspace = "leaks" | "privacy";

interface WorkspaceState {
  current: Workspace;
  allowed: Workspace[];
  isLeaks: boolean;
  isPrivacy: boolean;
  switchWorkspace: (ws: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceState | null>(null);

function getAllowedWorkspaces(role?: string): Workspace[] {
  if (!role) return ["leaks"];
  const bothAccess = ["root_admin", "director", "vice_president", "admin", "superadmin", "auditor"];
  const leaksOnly = ["security_analyst", "monitoring_officer", "smart_monitor_manager"];
  const privacyOnly = ["privacy_officer"];

  if (bothAccess.includes(role)) return ["leaks", "privacy"];
  if (privacyOnly.includes(role)) return ["privacy"];
  if (leaksOnly.includes(role)) return ["leaks"];
  return ["leaks", "privacy"];
}

function detectWorkspaceFromPath(path: string): Workspace | null {
  if (path.startsWith("/leaks")) return "leaks";
  if (path.startsWith("/privacy")) return "privacy";
  return null;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  const sessionStr = typeof window !== "undefined" ? localStorage.getItem("rasid_session") : null;
  const session = sessionStr ? JSON.parse(sessionStr) : null;
  const role = session?.role || "viewer";
  const allowed = getAllowedWorkspaces(role);

  const savedWs = (typeof window !== "undefined" ? localStorage.getItem("rasid_workspace") : null) as Workspace | null;
  const initialWs = savedWs && allowed.includes(savedWs) ? savedWs : allowed[0];

  const [current, setCurrent] = useState<Workspace>(initialWs);

  // Detect workspace from URL path
  useEffect(() => {
    const detected = detectWorkspaceFromPath(location);
    if (detected && detected !== current && allowed.includes(detected)) {
      setCurrent(detected);
      localStorage.setItem("rasid_workspace", detected);
    }
  }, [location]);

  const switchWorkspace = useCallback((ws: Workspace) => {
    if (!allowed.includes(ws)) return;
    setCurrent(ws);
    localStorage.setItem("rasid_workspace", ws);
    setLocation(ws === "leaks" ? "/" : "/privacy/dashboard");
  }, [allowed, setLocation]);

  return (
    <WorkspaceContext.Provider
      value={{
        current,
        allowed,
        isLeaks: current === "leaks",
        isPrivacy: current === "privacy",
        switchWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceState {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    // Fallback for components outside provider
    return {
      current: "leaks",
      allowed: ["leaks", "privacy"],
      isLeaks: true,
      isPrivacy: false,
      switchWorkspace: () => {},
    };
  }
  return ctx;
}

export default WorkspaceContext;

```

---

## `client/src/index.css`

```css
@import "tailwindcss";
@import "tw-animate-css";
@import './styles/design-tokens.css';
@import './styles/platform-theme.css';
@import './styles/ultra-themes.css';
@import './styles/premium-3d-themes.css';
@import './styles/atlas-login.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --font-sans: 'Tajawal', 'Cairo', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  /* SDAIA Official Glow Colors */
  --color-cyan-glow: #3DB1AC;
  --color-amber-glow: #FFC107;
  --color-red-glow: #EB3D63;
  --color-emerald-glow: #10B981;
  --color-violet-glow: #6459A7;
  --color-purple-glow: #273470;
}

/* ═══════════════════════════════════════════════════
   SDAIA OFFICIAL COLOR SYSTEM — Light Theme (Premium)
   Matching design.rasid.vip quality
   ═══════════════════════════════════════════════════ */
:root {
  --radius: 0.625rem;
  /* ═══ LIGHT THEME — Exact 1:1 match with design.rasid.vip ═══ */
  --background: #f0f3f8;
  --foreground: #1c2833;
  --card: #fff;
  --card-foreground: #1c2833;
  --popover: #fff;
  --popover-foreground: #1c2833;
  --primary: #6459A7;
  --primary-foreground: #fff;
  --secondary: #8B7FD4;
  --secondary-foreground: #fff;
  --muted: #edf0f7;
  --muted-foreground: #374151;
  --accent: #8B7FD4;
  --accent-foreground: #fff;
  --destructive: #eb3d63;
  --destructive-foreground: #fff;
  --border: #d8dce8;
  --input: #e0e3ee;
  --ring: #6459A7;
  /* Chart Colors */
  --chart-1: #3DB1AC;
  --chart-2: #6459A7;
  --chart-3: #FFC107;
  --chart-4: #EB3D63;
  --chart-5: #6459A7;
  /* ═══ Sidebar Light — WHITE (matching design.rasid.vip light sidebar) ═══ */
  --sidebar: rgba(255, 255, 255, 0.97);
  --sidebar-foreground: #1c2833;
  --sidebar-primary: #6459A7;
  --sidebar-primary-foreground: #fff;
  --sidebar-accent: rgba(100, 80, 180, 0.08);
  --sidebar-accent-foreground: #6459A7;
  --sidebar-border: rgba(100, 80, 180, 0.06);
  --sidebar-ring: #6459A7;
  /* Glassmorphism Light — NO blur, solid white (clean light theme) */
  --glass-bg: #ffffff;
  --glass-border: rgba(100, 80, 180, 0.08);
  --glass-shadow: rgba(100, 80, 180, 0.05) 0px 2px 8px 0px, rgba(100, 80, 180, 0.06) 0px 8px 32px 0px, rgba(100, 80, 180, 0.03) 0px 1px 2px 0px, rgb(255, 255, 255) 0px 1px 0px 0px inset;
  --glass-blur: none;
  /* Glow Light */
  --glow-primary: rgba(120, 100, 200, 0.12);
  --glow-accent: rgba(100, 89, 167, 0.12);
  --glow-danger: rgba(235, 61, 99, 0.12);
}

/* ═══════════════════════════════════════════════════
   SDAIA OFFICIAL COLOR SYSTEM — Dark Theme
   ═══════════════════════════════════════════════════ */
.dark {
  --background: #0D1529;
  --foreground: #E1DEF5;
  --card: #1A2550;
  --card-foreground: #E1DEF5;
  --popover: #1A2550;
  --popover-foreground: #E1DEF5;
  /* Teal primary in dark mode per SDAIA spec */
  --primary: #3DB1AC;
  --primary-foreground: #FFFFFF;
  --secondary: #6459A7;
  --secondary-foreground: #FFFFFF;
  --muted: rgba(26, 37, 80, 0.5);
  --muted-foreground: rgba(225, 222, 245, 0.65);
  --accent: #3DB1AC;
  --accent-foreground: #FFFFFF;
  --destructive: #EB3D63;
  --destructive-foreground: #FFFFFF;
  --border: rgba(61, 177, 172, 0.12);
  --input: rgba(26, 37, 80, 0.5);
  --ring: #3DB1AC;
  /* SDAIA Chart Colors */
  --chart-1: #3DB1AC;
  --chart-2: #6459A7;
  --chart-3: #FFC107;
  --chart-4: #EB3D63;
  --chart-5: #273470;
  /* Sidebar Dark */
  --sidebar: rgba(13, 21, 41, 0.95);
  --sidebar-foreground: #E1DEF5;
  --sidebar-primary: #3DB1AC;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: rgba(61, 177, 172, 0.12);
  --sidebar-accent-foreground: #E1DEF5;
  --sidebar-border: rgba(61, 177, 172, 0.08);
  --sidebar-ring: #3DB1AC;
  /* Glassmorphism Dark */
  --glass-bg: rgba(100, 80, 180, 0.25);
  --glass-border: rgba(61, 177, 172, 0.12);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  --glass-blur: blur(20px);
  /* Glow Dark */
  --glow-primary: rgba(61, 177, 172, 0.4);
  --glow-accent: rgba(61, 177, 172, 0.3);
  --glow-danger: rgba(235, 61, 99, 0.3);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  html {
    overflow-x: hidden;
    max-width: 100vw;
    width: 100%;
  }
  body {
    @apply bg-background text-foreground font-sans;
    direction: rtl;
    font-size: 16px;
    overflow-x: hidden;
    max-width: 100vw;
    width: 100%;
    -webkit-overflow-scrolling: touch;
    position: relative;
  }
  #root {
    overflow-x: hidden;
    max-width: 100vw;
    width: 100%;
  }
  /* ═══ Mobile Responsive Global Fixes ═══ */
  @media (max-width: 1024px) {
    html, body, #root {
      overflow-x: hidden !important;
      max-width: 100vw !important;
      width: 100% !important;
    }
    body {
      overflow-y: auto !important;
      min-height: 100vh;
      min-height: 100dvh;
      -webkit-overflow-scrolling: touch;
    }
    /* Make tables scrollable on mobile */
    table {
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      max-width: 100%;
    }
    thead, tbody, tfoot, tr, th, td {
      max-width: 100vw;
    }
    /* Fix text overflow on mobile */
    h1, h2, h3, h4, h5, h6, p, span, a, label {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    /* Prevent any element from exceeding viewport */
    * {
      max-width: 100vw;
    }
    /* Fix fixed/absolute elements on mobile */
    .fixed, [class*="fixed"] {
      max-width: 100vw;
    }
  }
  @media (max-width: 768px) {
    /* Reduce padding on mobile */
    .p-6 { padding: 0.75rem !important; }
    .p-8 { padding: 1rem !important; }
    .px-6 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
    .gap-6 { gap: 1rem !important; }
    .gap-8 { gap: 1.25rem !important; }

    /* ═══ Mobile Touch Targets ═══ */
    button:not(.h-7):not(.h-6):not(.w-7):not(.w-6),
    [role="button"]:not(.h-7):not(.h-6) {
      min-height: 36px;
    }

    /* ═══ TabsList horizontal scroll on mobile ═══ */
    [role="tablist"] {
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      flex-wrap: nowrap !important;
      justify-content: flex-start !important;
      width: 100% !important;
    }
    [role="tablist"]::-webkit-scrollbar {
      display: none;
    }
    [role="tab"] {
      flex-shrink: 0 !important;
      white-space: nowrap !important;
      font-size: 0.75rem !important;
      padding-left: 0.5rem !important;
      padding-right: 0.5rem !important;
    }

    /* ═══ Dialog/Modal mobile full-width ═══ */
    [data-slot="dialog-content"] {
      max-width: calc(100vw - 1rem) !important;
      width: calc(100vw - 1rem) !important;
      margin: 0.5rem !important;
      max-height: 90vh !important;
      max-height: 90dvh !important;
      overflow-y: auto !important;
    }

    /* ═══ Card hover: disable translateY on mobile to prevent layout shifts ═══ */
    [data-slot="card"]:hover {
      transform: none !important;
    }
    .glass-card:hover {
      transform: none !important;
    }
  }
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  [type="button"]:not(:disabled),
  [type="submit"]:not(:disabled),
  [type="reset"]:not(:disabled),
  a[href],
  select:not(:disabled),
  input[type="checkbox"]:not(:disabled),
  input[type="radio"]:not(:disabled) {
    @apply cursor-pointer;
  }

  /* ═══ GLOBAL CLICKABLE ELEMENTS — Phase 14 ═══ */
  .kpi-card,
  .glass-card,
  .stat-card,
  .drill-indicator,
  [data-clickable],
  [role="tab"],
  [role="menuitem"],
  [role="option"],
  [role="link"],
  [role="row"][onclick],
  .group,
  .hover\:bg-accent\/50,
  .gold-sweep,
  tr[onclick],
  tr.cursor-pointer,
  div[onclick],
  li[onclick] {
    cursor: pointer;
  }

  /* ═══ FONT SIZE NORMALIZATION — Phase 14 ═══ */
  :root {
    --fs-xs: 0.75rem;    /* 12px */
    --fs-sm: 0.8125rem;  /* 13px */
    --fs-base: 0.875rem; /* 14px */
    --fs-md: 0.9375rem;  /* 15px */
    --fs-lg: 1rem;       /* 16px */
    --fs-xl: 1.125rem;   /* 18px */
    --fs-2xl: 1.25rem;   /* 20px */
    --fs-3xl: 1.5rem;    /* 24px */
  }

  /* Normalize page headings */
  h1 { font-size: var(--fs-3xl); font-weight: 700; line-height: 1.3; }
  h2 { font-size: var(--fs-2xl); font-weight: 600; line-height: 1.35; }
  h3 { font-size: var(--fs-xl); font-weight: 600; line-height: 1.4; }
  h4 { font-size: var(--fs-lg); font-weight: 600; line-height: 1.4; }

  /* Normalize body text inside dashboard pages */
  main p, main span, main div, main td, main th, main li {
    font-size: var(--fs-base);
  }
  main .text-xs, main .text-\[10px\], main .text-\[11px\], main .text-\[12px\] {
    font-size: var(--fs-xs);
  }
  main .text-sm, main .text-\[13px\] {
    font-size: var(--fs-sm);
  }
  main .text-lg {
    font-size: var(--fs-xl);
  }
  main .text-xl {
    font-size: var(--fs-2xl);
  }

  /* ═══ DRILL-DOWN INDICATOR ═══ */
  .drill-indicator {
    position: relative;
  }
  .drill-indicator::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: #8B7FD4;
    border-radius: 1px;
    transition: width 0.3s ease;
  }
  .drill-indicator:hover::after {
    width: 80%;
  }

  @media (max-width: 640px) {
    .drill-indicator::after {
      display: none;
    }
  }
}

@layer components {
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .flex {
    min-height: 0;
    min-width: 0;
  }

  @media (min-width: 640px) {
    .container {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    .container {
      padding-left: 2rem;
      padding-right: 2rem;
      max-width: 1280px;
    }
  }

  /* ═══════════════════════════════════════════
     GLASSMORPHISM CARDS — SDAIA Style
     ═══════════════════════════════════════════ */
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid rgba(100, 80, 180, 0.08);
    box-shadow: var(--glass-shadow);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .glass-card:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: rgba(100, 80, 180, 0.15);
  }
  .dark .glass-card {
    background: rgba(100, 80, 180, 0.25);
    backdrop-filter: blur(24px) saturate(1.3);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border: 1px solid rgba(61, 177, 172, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 0.5px rgba(61, 177, 172, 0.1);
  }
  .dark .glass-card:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: rgba(61, 177, 172, 0.35);
    backdrop-filter: blur(24px) saturate(1.3);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 15px rgba(61, 177, 172, 0.08);
  }

  /* ═══ PREMIUM GLASS SIDEBAR ═══ */
  .dark .glass-sidebar {
    background: rgba(13, 21, 41, 0.95);
    backdrop-filter: blur(24px) saturate(1.8);
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    border-left: 1px solid rgba(61, 177, 172, 0.08);
  }

  /* ═══════════════════════════════════════════
     GLOW EFFECTS — SDAIA Colors
     ═══════════════════════════════════════════ */
  .dark .glow-teal {
    box-shadow: 0 0 20px rgba(61, 177, 172, 0.25), 0 0 60px rgba(61, 177, 172, 0.1);
  }
  .glow-teal {
    box-shadow: 0 1px 3px rgba(61, 177, 172, 0.08);
  }

  .dark .glow-purple {
    box-shadow: 0 0 20px rgba(100, 89, 167, 0.25), 0 0 60px rgba(100, 89, 167, 0.1);
  }
  .glow-purple {
    box-shadow: 0 1px 3px rgba(100, 89, 167, 0.08);
  }

  .dark .glow-navy {
    box-shadow: 0 0 20px rgba(100, 80, 180, 0.25), 0 0 60px rgba(100, 80, 180, 0.1);
  }

  .dark .glow-cyan {
    box-shadow: 0 0 20px rgba(61, 177, 172, 0.2), 0 0 40px rgba(61, 177, 172, 0.08);
  }
  .glow-cyan {
    box-shadow: 0 1px 3px rgba(61, 177, 172, 0.08);
  }

  .dark .glow-amber {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.15), 0 0 40px rgba(255, 193, 7, 0.05);
  }
  .glow-amber {
    box-shadow: 0 1px 3px rgba(255, 193, 7, 0.08);
  }

  .dark .glow-red {
    box-shadow: 0 0 20px rgba(235, 61, 99, 0.15), 0 0 40px rgba(235, 61, 99, 0.05);
  }
  .glow-red {
    box-shadow: 0 1px 3px rgba(235, 61, 99, 0.08);
  }

  .dark .glow-emerald {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.15), 0 0 40px rgba(16, 185, 129, 0.05);
  }
  .glow-emerald {
    box-shadow: 0 1px 3px rgba(16, 185, 129, 0.08);
  }

  .dark .glow-violet {
    box-shadow: 0 0 15px rgba(100, 89, 167, 0.2), 0 0 40px rgba(100, 89, 167, 0.08);
  }

  /* Dot grid background */
  .dark .dot-grid {
    background-image: radial-gradient(circle, rgba(61, 177, 172, 0.08) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .dot-grid {
    background-image: radial-gradient(circle, rgba(100, 80, 180, 0.03) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  /* ═══════════════════════════════════════════
     AURORA BACKGROUND — SDAIA Navy/Teal
     ═══════════════════════════════════════════ */
  @keyframes aurora-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .dark .aurora-bg {
    position: relative;
    overflow: hidden;
  }
  .dark .aurora-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, rgba(61, 177, 172, 0.12), transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 20%, rgba(100, 89, 167, 0.08), transparent 50%),
      radial-gradient(ellipse 50% 30% at 20% 80%, rgba(100, 80, 180, 0.1), transparent 50%);
    pointer-events: none;
    z-index: 0;
    animation: aurora-shift 15s ease-in-out infinite;
    background-size: 200% 200%;
  }

  /* ═══════════════════════════════════════════
     ANIMATIONS — Ultra Premium
     ═══════════════════════════════════════════ */
  @keyframes stat-count-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes icon-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  @keyframes progress-fill {
    from { width: 0; }
  }

  @keyframes badge-pop {
    0% { transform: scale(0); }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  @keyframes card-entrance {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes orbit-spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes orbit-spin-reverse {
    from { transform: translate(-50%, -50%) rotate(360deg); }
    to { transform: translate(-50%, -50%) rotate(0deg); }
  }

  @keyframes breathing-glow {
    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 8px rgba(61, 177, 172, 0.2); }
    50% { box-shadow: 0 0 20px rgba(61, 177, 172, 0.4); }
  }

  @keyframes border-glow {
    0%, 100% { border-color: rgba(61, 177, 172, 0.15); }
    50% { border-color: rgba(61, 177, 172, 0.35); }
  }

  @keyframes float-bubble {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    33% { transform: translateY(-8px) rotate(2deg); }
    66% { transform: translateY(4px) rotate(-1deg); }
  }

  @keyframes scan-line {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }

  @keyframes data-flow {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes breathe {
    0%, 100% { opacity: 0.5; transform: scaleY(0.8); }
    50% { opacity: 1; transform: scaleY(1); }
  }

  @keyframes logo-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
  }

  @keyframes orbit {
    0% { transform: rotate(0deg) translateX(8px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(8px) rotate(-360deg); }
  }

  /* Animation utility classes */
  .animate-stat-count-up {
    animation: stat-count-up 0.6s ease-out forwards;
  }

  .animate-icon-bounce {
    animation: icon-bounce 2s ease-in-out infinite;
  }

  .animate-card-entrance {
    animation: card-entrance 0.6s ease-out forwards;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .animate-orbit-spin {
    animation: orbit-spin 8s linear infinite;
  }

  .animate-orbit-reverse {
    animation: orbit-spin-reverse 12s linear infinite;
  }

  .animate-breathing-glow {
    animation: breathing-glow 3s ease-in-out infinite;
  }

  .animate-float {
    animation: float-bubble 6s ease-in-out infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(61, 177, 172, 0.08), transparent);
    background-size: 200% 100%;
    animation: shimmer 3s ease-in-out infinite;
  }

  .animate-glow-pulse {
    animation: glow-pulse 3s ease-in-out infinite;
  }

  .animate-border-glow {
    animation: border-glow 3s ease-in-out infinite;
  }

  .animate-scan-line {
    animation: scan-line 4s ease-in-out infinite;
  }

  /* ═══ SCAN EFFECT — Premium Card Effect ═══ */
  .scan-effect {
    position: relative;
    overflow: hidden;
  }
  .scan-effect::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(transparent, rgba(61, 177, 172, 0.04), transparent);
    height: 30%;
    animation: scan-line 4s ease-in-out infinite;
  }

  /* ═══ DATA FLOW LINE ═══ */
  .data-flow-line {
    height: 2px;
    background: linear-gradient(90deg, transparent, #3DB1AC, #6459A7, #3DB1AC, transparent);
    background-size: 200% 100%;
    animation: data-flow 3s linear infinite;
  }

  /* ═══ ACTIVE INDICATOR ═══ */
  .active-indicator {
    width: 3px;
    height: 24px;
    background: #3DB1AC;
    border-radius: 4px;
    animation: breathe 2s ease-in-out infinite;
    box-shadow: 0 0 8px rgba(61, 177, 172, 0.4);
  }

  /* ═══ FOCUS GLOW ON INPUTS ═══ */
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #6459A7 !important;
    box-shadow: 0 0 0 3px rgba(100, 89, 167, 0.15) !important;
    transition: all 0.3s ease;
  }

  /* ═══ GRADIENT TEXT — SDAIA ═══ */
  .dark .gradient-text-teal {
    background: linear-gradient(135deg, #E1DEF5, #3DB1AC);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .gradient-text-teal {
    background: linear-gradient(135deg, #6459A7, #3DB1AC);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .dark .gradient-text-purple {
    background: linear-gradient(135deg, #E1DEF5, #6459A7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .gradient-text-purple {
    background: linear-gradient(135deg, #6459A7, #8B7FD4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ═══ PREMIUM HOVER EFFECTS ═══ */
  .dark .hover-glass:hover {
    background: rgba(100, 80, 180, 0.35);
    border-color: rgba(61, 177, 172, 0.25);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ═══ ACTIVE NAV INDICATOR ═══ */
  .dark .nav-active-glow {
    background: rgba(61, 177, 172, 0.12);
    border: 1px solid rgba(61, 177, 172, 0.25);
  }
}

/* ═══════════════════════════════════════════
   SCROLLBAR — SDAIA Theme
   ═══════════════════════════════════════════ */
.dark ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.dark ::-webkit-scrollbar-track {
  background: rgba(18, 14, 45, 0.5);
}
.dark ::-webkit-scrollbar-thumb {
  background: rgba(120, 100, 200, 0.3);
  border-radius: 3px;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(120, 100, 200, 0.5);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(248, 247, 244, 0.8);
}
::-webkit-scrollbar-thumb {
  background: rgba(120, 100, 200, 0.2);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(120, 100, 200, 0.35);
}

/* ═══════════════════════════════════════════
   RECHARTS THEME — SDAIA Colors
   ═══════════════════════════════════════════ */
.dark .recharts-cartesian-grid line {
  stroke: rgba(61, 177, 172, 0.08) !important;
}
.dark .recharts-text {
  fill: rgba(225, 222, 245, 0.5) !important;
  font-family: 'Tajawal', 'Cairo', sans-serif !important;
}
.recharts-cartesian-grid line {
  stroke: rgba(100, 80, 180, 0.08) !important;
}
.recharts-text {
  fill: rgba(28, 40, 51, 0.6) !important;
  font-family: 'Tajawal', 'Cairo', sans-serif !important;
}

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL GLASSMORPHISM — Auto-applies to all shadcn/ui components
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Cards: frosted glass effect ─── */
.dark [data-slot="card"] {
  background: rgba(26, 37, 80, 0.5);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  border-color: rgba(61, 177, 172, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.dark [data-slot="card"]::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(transparent, rgba(61, 177, 172, 0.03), transparent);
  height: 30%;
  animation: scan-line 5s ease-in-out infinite;
}
.dark [data-slot="card"]:hover {
  border-color: rgba(61, 177, 172, 0.25);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 20px rgba(61, 177, 172, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

/* ─── Dialog/Modal: frosted glass overlay ─── */
.dark [data-slot="dialog-overlay"] {
  background: rgba(13, 21, 41, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.dark [data-slot="dialog-content"] {
  background: rgba(26, 37, 80, 0.85);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  border-color: rgba(61, 177, 172, 0.15);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* ─── Tables: glass rows with hover glow ─── */
.dark table {
  border-collapse: separate;
  border-spacing: 0;
}
.dark table thead tr {
  background: rgba(13, 21, 41, 0.6);
}
.dark table thead th {
  border-bottom: 1px solid rgba(61, 177, 172, 0.15);
  font-weight: 600;
}
.dark table tbody tr {
  transition: all 0.2s ease;
}
.dark table tbody tr:hover {
  background: rgba(61, 177, 172, 0.06);
}
.dark table tbody td {
  border-bottom: 1px solid rgba(61, 177, 172, 0.06);
}

/* ─── Inputs: glass input fields ─── */
.dark input:not([type="checkbox"]):not([type="radio"]),
.dark textarea,
.dark select {
  background: rgba(26, 37, 80, 0.5) !important;
  border-color: rgba(61, 177, 172, 0.15);
  transition: all 0.2s ease;
}
.dark input:not([type="checkbox"]):not([type="radio"]):focus,
.dark textarea:focus,
.dark select:focus {
  border-color: rgba(61, 177, 172, 0.4);
  box-shadow: 0 0 0 2px rgba(61, 177, 172, 0.15), 0 0 20px rgba(61, 177, 172, 0.08);
}

/* ─── Buttons: subtle glass effect with hover glow ─── */
.dark button[data-slot="button"] {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.dark button[data-slot="button"]:hover:not(:disabled) {
  box-shadow: 0 0 12px rgba(61, 177, 172, 0.15);
}
  button[data-slot="button"]:hover:not(:disabled) {
    box-shadow: 0 1px 4px rgba(100, 80, 180, 0.06);
}

/* ─── Badges/Tags: glass effect ─── */
.dark [data-slot="badge"] {
  backdrop-filter: blur(8px);
  border-color: rgba(61, 177, 172, 0.15);
}

/* ─── Tabs: glass tab list ─── */
.dark [role="tablist"] {
  background: rgba(26, 37, 80, 0.5);
  backdrop-filter: blur(12px);
  border-color: rgba(61, 177, 172, 0.1);
}
.dark [role="tab"][data-state="active"] {
  background: rgba(61, 177, 172, 0.15);
  box-shadow: 0 2px 8px rgba(61, 177, 172, 0.1);
}

/* ─── Dropdown menus: glass popover ─── */
.dark [data-slot="dropdown-menu-content"],
.dark [data-slot="popover-content"],
.dark [data-slot="select-content"] {
  background: rgba(26, 37, 80, 0.9);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  border-color: rgba(61, 177, 172, 0.15);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

/* ─── Tooltips: glass tooltip ─── */
.dark [data-slot="tooltip-content"] {
  background: rgba(26, 37, 80, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(61, 177, 172, 0.15);
}

/* ─── Stat cards: subtle glow on value numbers ─── */
.dark .stat-value {
  text-shadow: 0 0 20px rgba(61, 177, 172, 0.3);
}

/* ─── Skeleton loaders: teal shimmer ─── */
.dark [data-slot="skeleton"] {
  background: linear-gradient(
    90deg,
    rgba(26, 37, 80, 0.4) 0%,
    rgba(61, 177, 172, 0.1) 50%,
    rgba(26, 37, 80, 0.4) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

/* ─── Toast notifications: glass effect ─── */
.dark [data-sonner-toaster] [data-sonner-toast] {
  background: rgba(26, 37, 80, 0.85);
  backdrop-filter: blur(20px);
  border-color: rgba(61, 177, 172, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* ─── Progress bars: teal gradient ─── */
.dark [role="progressbar"] > div {
  background: linear-gradient(90deg, #3DB1AC, #6459A7);
}

/* ─── Separator: subtle glass border ─── */
.dark [data-slot="separator"] {
  background: rgba(61, 177, 172, 0.1);
}

/* ─── Alert: glass alert ─── */
.dark [data-slot="alert"] {
  background: rgba(26, 37, 80, 0.5);
  backdrop-filter: blur(12px);
  border-color: rgba(61, 177, 172, 0.12);
}


/* ═══════════════════════════════════════════════════════════════════
   LIGHT THEME PREMIUM STYLES — Matching design.rasid.vip quality
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Light Cards: Clean white with subtle shadow (design.rasid.vip) ─── */
[data-slot="card"] {
  background: #fff;
  border-color: #e2e5ef;
  box-shadow: 0 1px 3px rgba(100, 80, 180, 0.04), 0 4px 16px rgba(100, 80, 180, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
[data-slot="card"]::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(transparent, rgba(120, 100, 200, 0.01), transparent);
  height: 30%;
  animation: scan-line 8s ease-in-out infinite;
}
[data-slot="card"]:hover {
  border-color: rgba(120, 100, 200, 0.15);
  box-shadow: 0 4px 20px rgba(100, 80, 180, 0.08), 0 1px 4px rgba(100, 80, 180, 0.04);
  transform: translateY(-4px) scale(1.02);
}

/* ─── Light Dialog/Modal — Clean white (design.rasid.vip) ─── */
[data-slot="dialog-overlay"] {
  background: rgba(15, 29, 50, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
[data-slot="dialog-content"] {
  background: #fff;
  border-color: #e2e5ef;
  box-shadow: 0 16px 48px rgba(100, 80, 180, 0.12), 0 4px 12px rgba(100, 80, 180, 0.06);
}

/* ─── Light Tables — Clean (design.rasid.vip) ─── */
table {
  border-collapse: separate;
  border-spacing: 0;
}
table thead tr {
  background: #f5f7fb;
}
table thead th {
  border-bottom: 1px solid #e2e5ef;
  font-weight: 600;
  color: #5a6478;
}
table tbody tr {
  transition: all 0.2s ease;
}
table tbody tr:hover {
  background: rgba(37, 99, 235, 0.04);
}
table tbody td {
  border-bottom: 1px solid #edf0f7;
}

/* ─── Light Inputs — Clean (design.rasid.vip) ─── */
input:not([type="checkbox"]):not([type="radio"]),
textarea,
select {
  background: #fff !important;
  border-color: #d8dce8;
  transition: all 0.2s ease;
}

/* ─── Light Badges ─── */
[data-slot="badge"] {
  border-color: #e2e5ef;
}

/* ─── Light Tabs ─── */
[role="tablist"] {
  background: #edf0f7;
  border-color: #d8dce8;
}
[role="tab"][data-state="active"] {
  background: #fff;
  box-shadow: 0 1px 4px rgba(100, 80, 180, 0.06);
}

/* ─── Light Dropdowns ─── */
[data-slot="dropdown-menu-content"],
[data-slot="popover-content"],
[data-slot="select-content"] {
  background: #fff;
  border-color: #e2e5ef;
  box-shadow: 0 8px 32px rgba(100, 80, 180, 0.08), 0 2px 8px rgba(100, 80, 180, 0.04);
}

/* ─── Light Tooltips ─── */
[data-slot="tooltip-content"] {
  background: #1c2833;
  border: 1px solid #1c2833;
  color: #fff;
}

/* ─── Light Skeleton ─── */
[data-slot="skeleton"] {
  background: linear-gradient(
    90deg,
    #edf0f7 0%,
    #e0e3ee 50%,
    #edf0f7 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

/* ─── Light Toast ─── */
[data-sonner-toaster] [data-sonner-toast] {
  background: #fff;
  border-color: #e2e5ef;
  box-shadow: 0 4px 16px rgba(100, 80, 180, 0.08);
}

/* ─── Light Progress bars ─── */
[role="progressbar"] > div {
  background: linear-gradient(90deg, #6459A7, #8B7FD4);
}

/* ─── Light Separator ─── */
[data-slot="separator"] {
  background: #edf0f7;
}

/* ─── Light Alert ─── */
[data-slot="alert"] {
  background: #fff;
  border-color: #e2e5ef;
}

/* ─── Light Glass Card — Clean white (design.rasid.vip) ─── */
.glass-card {
  background: #fff;
  border: 1px solid #e2e5ef;
  box-shadow: 0 1px 3px rgba(100, 80, 180, 0.04), 0 4px 16px rgba(100, 80, 180, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-card:hover {
  border-color: rgba(120, 100, 200, 0.15);
  box-shadow: 0 4px 20px rgba(100, 80, 180, 0.08), 0 1px 4px rgba(100, 80, 180, 0.04);
  transform: translateY(-4px) scale(1.02);
}

/* ─── Dark Card Gradient Backgrounds (Atlas) ─── */
.dark [data-slot="card"] {
  background: linear-gradient(135deg, rgba(26,37,80,0.6) 0%, rgba(15,23,42,0.8) 100%);
  backdrop-filter: blur(24px) saturate(1.3);
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
  border-color: rgba(61,177,172,0.15);
}
.dark [data-slot="card"]:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(61,177,172,0.3);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 15px rgba(61,177,172,0.08);
}

/* ─── Light Glass Sidebar — Solid white (no blur) ─── */
.glass-sidebar {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-left: 1px solid rgba(100, 80, 180, 0.06);
  box-shadow: -2px 0 20px rgba(100, 80, 180, 0.04);
}

/* ─── Light Aurora Background — Very subtle (matching design.rasid.vip) ─── */
.aurora-bg {
  position: relative;
  overflow: hidden;
}
.aurora-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(120, 100, 200, 0.03), transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(139, 127, 212, 0.025), transparent 50%),
    radial-gradient(ellipse 50% 30% at 20% 80%, rgba(100, 89, 167, 0.02), transparent 50%);
  pointer-events: none;
  z-index: 0;
  animation: aurora-shift 20s ease-in-out infinite;
  background-size: 200% 200%;
}

/* ─── Light Dot Grid ─── */
.dot-grid {
  background-image: radial-gradient(circle, rgba(100, 80, 180, 0.025) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* ─── Light Hover Glass ─── */
.hover-glass:hover {
  background: rgba(120, 100, 200, 0.04);
  border-color: rgba(120, 100, 200, 0.1);
  box-shadow: 0 2px 8px rgba(100, 80, 180, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ─── Light Nav Active ─── */
.nav-active-glow {
  background: rgba(120, 100, 200, 0.06);
  border: 1px solid rgba(120, 100, 200, 0.1);
}

/* ─── Light Stat Value ─── */
.stat-value {
  color: #1c2833;
}

/* ─── Light Shimmer Hover ─── */
.shimmer-hover {
  background: linear-gradient(90deg, transparent, rgba(120, 100, 200, 0.02), transparent);
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dark .shimmer-hover {
  background: linear-gradient(90deg, transparent, rgba(61, 177, 172, 0.05), transparent);
  background-size: 200% 100%;
}
*:hover > .shimmer-hover {
  opacity: 1;
  animation: shimmer 2s ease-in-out infinite;
}

/* ─── Premium Stat Enter Animation ─── */
.premium-stat-enter {
  animation: stat-count-up 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* ═══════════════════════════════════════════════════════════════════
   MOTION ANIMATIONS — Enhanced for all cards & indicators
   ═══════════════════════════════════════════════════════════════════ */

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fade-in-right {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fade-in-left {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slide-in-bottom {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes number-pop {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes glow-border-pulse {
  0%, 100% { border-color: rgba(61, 177, 172, 0.12); box-shadow: 0 0 0 0 rgba(61, 177, 172, 0); }
  50% { border-color: rgba(61, 177, 172, 0.3); box-shadow: 0 0 16px rgba(61, 177, 172, 0.1); }
}

@keyframes subtle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.animate-fade-in-right {
  animation: fade-in-right 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.animate-fade-in-left {
  animation: fade-in-left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.animate-scale-in {
  animation: scale-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.animate-number-pop {
  animation: number-pop 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.animate-subtle-float {
  animation: subtle-float 4s ease-in-out infinite;
}

/* Staggered entrance delays */
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
.stagger-5 { animation-delay: 0.25s; }
.stagger-6 { animation-delay: 0.3s; }
.stagger-7 { animation-delay: 0.35s; }
.stagger-8 { animation-delay: 0.4s; }


/* ═══════════════════════════════════════════════════════════════════
   PHASE 74: ADVANCED MOTION EFFECTS — Ultra Premium Light Theme
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Shimmer Border Effect on Cards (Light Mode) ─── */
@keyframes border-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

[data-slot="card"]::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 35%,
    rgba(61, 177, 172, 0.2) 45%,
    rgba(100, 89, 167, 0.15) 50%,
    rgba(61, 177, 172, 0.2) 55%,
    transparent 65%,
    transparent 100%
  );
  background-size: 200% 100%;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
[data-slot="card"]:hover::before {
  opacity: 1;
  animation: border-shimmer 3s linear infinite;
}
.dark [data-slot="card"]::before {
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 35%,
    rgba(61, 177, 172, 0.3) 45%,
    rgba(100, 89, 167, 0.2) 50%,
    rgba(61, 177, 172, 0.3) 55%,
    transparent 65%,
    transparent 100%
  );
  background-size: 200% 100%;
}

/* ─── Icon Hover Micro-Interactions ─── */
@keyframes icon-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

@keyframes icon-rotate-bounce {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-8deg) scale(1.1); }
  50% { transform: rotate(0deg) scale(1.05); }
  75% { transform: rotate(8deg) scale(1.1); }
  100% { transform: rotate(0deg) scale(1); }
}

@keyframes icon-glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 0 transparent); }
  50% { filter: drop-shadow(0 0 8px rgba(61, 177, 172, 0.4)); }
}

.icon-hover-pulse:hover {
  animation: icon-pulse 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-hover-rotate:hover {
  animation: icon-rotate-bounce 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-hover-glow:hover {
  animation: icon-glow-pulse 1.2s ease-in-out infinite;
}

/* ─── Card Lift with 3D Perspective (Light Mode) ─── */
.card-3d-lift {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  perspective: 1000px;
}
.card-3d-lift:hover {
  transform: translateY(-6px) rotateX(2deg);
  box-shadow: 
    0 20px 40px rgba(22, 42, 84, 0.12),
    0 8px 16px rgba(22, 42, 84, 0.06),
    0 0 0 1px rgba(61, 177, 172, 0.08);
}
.dark .card-3d-lift:hover {
  transform: translateY(-6px) rotateX(2deg);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(61, 177, 172, 0.1);
}
.light .card-3d-lift {
  box-shadow: 0 2px 12px rgba(100, 80, 180, 0.08), 0 1px 3px rgba(0,0,0,0.04);
}
.light .card-3d-lift:hover {
  transform: translateY(-4px) rotateX(1deg);
  box-shadow: 
    0 12px 32px rgba(100, 80, 180, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(120, 100, 200, 0.15);
}

/* ─── Floating Particles Background (Light Mode) ─── */
@keyframes float-particle-1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
  25% { transform: translate(30px, -40px) rotate(90deg); opacity: 0.6; }
  50% { transform: translate(-20px, -80px) rotate(180deg); opacity: 0.3; }
  75% { transform: translate(40px, -40px) rotate(270deg); opacity: 0.5; }
}

@keyframes float-particle-2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
  33% { transform: translate(-40px, -60px) scale(1.3); opacity: 0.5; }
  66% { transform: translate(20px, -30px) scale(0.8); opacity: 0.3; }
}

@keyframes float-particle-3 {
  0%, 100% { transform: translate(0, 0); opacity: 0.15; }
  50% { transform: translate(50px, -50px); opacity: 0.4; }
}

.light-particles::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: 
    radial-gradient(2px 2px at 10% 20%, rgba(61, 177, 172, 0.25), transparent),
    radial-gradient(2px 2px at 30% 60%, rgba(100, 89, 167, 0.2), transparent),
    radial-gradient(3px 3px at 50% 30%, rgba(22, 42, 84, 0.15), transparent),
    radial-gradient(2px 2px at 70% 70%, rgba(61, 177, 172, 0.2), transparent),
    radial-gradient(2px 2px at 90% 40%, rgba(100, 89, 167, 0.15), transparent),
    radial-gradient(3px 3px at 20% 80%, rgba(22, 42, 84, 0.12), transparent),
    radial-gradient(2px 2px at 60% 10%, rgba(61, 177, 172, 0.18), transparent),
    radial-gradient(2px 2px at 80% 90%, rgba(100, 89, 167, 0.15), transparent);
  animation: float-particle-1 20s ease-in-out infinite;
}
.dark .light-particles::after {
  background-image: 
    radial-gradient(2px 2px at 10% 20%, rgba(61, 177, 172, 0.15), transparent),
    radial-gradient(2px 2px at 30% 60%, rgba(100, 89, 167, 0.12), transparent),
    radial-gradient(3px 3px at 50% 30%, rgba(61, 177, 172, 0.1), transparent),
    radial-gradient(2px 2px at 70% 70%, rgba(61, 177, 172, 0.12), transparent),
    radial-gradient(2px 2px at 90% 40%, rgba(100, 89, 167, 0.1), transparent),
    radial-gradient(3px 3px at 20% 80%, rgba(61, 177, 172, 0.08), transparent),
    radial-gradient(2px 2px at 60% 10%, rgba(61, 177, 172, 0.1), transparent),
    radial-gradient(2px 2px at 80% 90%, rgba(100, 89, 167, 0.08), transparent);
}

/* ─── Parallax Scroll Effect ─── */
.parallax-slow {
  will-change: transform;
  transition: transform 0.1s linear;
}

/* ─── Staggered Card Entrance with Bounce ─── */
@keyframes card-entrance {
  0% { opacity: 0; transform: translateY(30px) scale(0.95); }
  60% { opacity: 1; transform: translateY(-5px) scale(1.01); }
  80% { transform: translateY(2px) scale(0.995); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-card-entrance {
  animation: card-entrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

/* ─── Gradient Border Glow Animation ─── */
@keyframes gradient-border-rotate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-border-glow {
  position: relative;
}
.gradient-border-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(
    270deg,
    rgba(61, 177, 172, 0.3),
    rgba(100, 89, 167, 0.2),
    rgba(22, 42, 84, 0.3),
    rgba(61, 177, 172, 0.3)
  );
  background-size: 300% 300%;
  animation: gradient-border-rotate 4s ease infinite;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.gradient-border-glow:hover::before {
  opacity: 1;
}

/* ─── Ripple Click Effect ─── */
@keyframes ripple-effect {
  0% { transform: scale(0); opacity: 0.5; }
  100% { transform: scale(4); opacity: 0; }
}

.ripple-container {
  position: relative;
  overflow: hidden;
}
.ripple-container::after {
  content: '';
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(61, 177, 172, 0.2);
  transform: scale(0);
  pointer-events: none;
}
.ripple-container:active::after {
  animation: ripple-effect 0.6s ease-out;
}

/* ─── Breathing Glow for Active Status Indicators ─── */
@keyframes breathing-status {
  0%, 100% { box-shadow: 0 0 0 0 rgba(61, 177, 172, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(61, 177, 172, 0); }
}

.status-breathing {
  animation: breathing-status 2s ease-in-out infinite;
}

/* ─── Smooth Page Transitions ─── */
@keyframes page-enter {
  from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

.page-transition-enter {
  animation: page-enter 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* ─── Hover Shine Sweep Effect ─── */
@keyframes shine-sweep {
  0% { left: -100%; }
  100% { left: 200%; }
}

.hover-shine {
  position: relative;
  overflow: hidden;
}
.hover-shine::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  transition: none;
  pointer-events: none;
}
.hover-shine:hover::after {
  animation: shine-sweep 0.8s ease-in-out;
}
.dark .hover-shine::after {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(61, 177, 172, 0.08),
    transparent
  );
}

/* ─── Character Float Animation ─── */
@keyframes character-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(1deg); }
  50% { transform: translateY(-4px) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(-1deg); }
}

@keyframes character-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.character-float {
  animation: character-float 5s ease-in-out infinite;
}

.character-breathe {
  animation: character-breathe 3s ease-in-out infinite;
}

/* ─── Presentation Mode Styles ─── */
.presentation-mode {
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
}

@keyframes presentation-slide-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes presentation-slide-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}

.presentation-enter {
  animation: presentation-slide-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.presentation-exit {
  animation: presentation-slide-out 0.3s ease-in forwards;
}

/* Presentation mode progress bar */
@keyframes presentation-progress {
  from { width: 0%; }
  to { width: 100%; }
}

/* ─── Stagger Delays Extended ─── */
.stagger-9 { animation-delay: 0.45s; }
.stagger-10 { animation-delay: 0.5s; }
.stagger-11 { animation-delay: 0.55s; }
.stagger-12 { animation-delay: 0.6s; }


/* ═══════════════════════════════════════════════════════════════════════
   SIDEBAR PREMIUM — Ultra Creative Sidebar Effects
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PREMIUM SIDEBAR — Next-Level Cinematic Design System
   ═══════════════════════════════════════════════════════════════ */

/* ─── 1. Living Aurora Background with Floating Orbs ─── */
@keyframes sidebar-aurora {
  0% { background-position: 0% 0%; opacity: 0.7; }
  25% { background-position: 100% 30%; opacity: 1; }
  50% { background-position: 50% 100%; opacity: 0.8; }
  75% { background-position: 0% 60%; opacity: 1; }
  100% { background-position: 0% 0%; opacity: 0.7; }
}

@keyframes sidebar-orb-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(10px, -20px) scale(1.1); }
  50% { transform: translate(-5px, -40px) scale(0.95); }
  75% { transform: translate(15px, -15px) scale(1.05); }
}

@keyframes sidebar-orb-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-15px, 20px) scale(1.15); }
  66% { transform: translate(10px, 10px) scale(0.9); }
}

@keyframes sidebar-shimmer {
  0% { transform: translateY(100%) rotate(45deg); }
  100% { transform: translateY(-100%) rotate(45deg); }
}

.sidebar-aurora-bg {
  position: relative;
  isolation: isolate;
}

/* Main aurora gradient */
.sidebar-aurora-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 150% 100% at 15% 5%, rgba(100, 89, 167, 0.08), transparent 45%),
    radial-gradient(ellipse 120% 80% at 85% 95%, rgba(61, 177, 172, 0.06), transparent 45%),
    radial-gradient(ellipse 100% 60% at 50% 50%, rgba(139, 127, 212, 0.04), transparent 55%),
    radial-gradient(circle 200px at 30% 70%, rgba(100, 89, 167, 0.05), transparent);
  background-size: 200% 200%;
  animation: sidebar-aurora 12s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* Floating orbs */
.sidebar-aurora-bg::after {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(100, 89, 167, 0.06), transparent 70%);
  top: 20%;
  right: -20px;
  animation: sidebar-orb-float 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
  filter: blur(20px);
}

.dark .sidebar-aurora-bg::before {
  background:
    radial-gradient(ellipse 150% 100% at 15% 5%, rgba(61, 177, 172, 0.12), transparent 45%),
    radial-gradient(ellipse 120% 80% at 85% 95%, rgba(100, 89, 167, 0.08), transparent 45%),
    radial-gradient(ellipse 100% 60% at 50% 50%, rgba(61, 177, 172, 0.05), transparent 55%),
    radial-gradient(circle 200px at 30% 70%, rgba(100, 89, 167, 0.06), transparent);
  background-size: 200% 200%;
  animation: sidebar-aurora 12s ease-in-out infinite;
}

.dark .sidebar-aurora-bg::after {
  background: radial-gradient(circle, rgba(61, 177, 172, 0.08), transparent 70%);
  filter: blur(25px);
}

/* ─── 2. Sidebar Nav Item — Cinematic Base ─── */
.sidebar-nav-item {
  position: relative;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
  border-radius: 14px;
  margin: 2px 0;
  backdrop-filter: blur(0px);
}

/* Ripple effect on click — expanding wave */
.sidebar-nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--ripple-x, 50%) var(--ripple-y, 50%), rgba(100, 89, 167, 0.2), transparent 55%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
  z-index: 0;
}
.sidebar-nav-item:active::before {
  opacity: 1;
  animation: sidebar-ripple-expand 0.6s ease-out;
}
@keyframes sidebar-ripple-expand {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}
.dark .sidebar-nav-item:active::before {
  background: radial-gradient(circle at var(--ripple-x, 50%) var(--ripple-y, 50%), rgba(61, 177, 172, 0.25), transparent 55%);
}

/* Neon active indicator bar with glow */
.sidebar-nav-item::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3.5px;
  height: 0%;
  background: linear-gradient(180deg, #6459A7, #8B7FD4, #3DB1AC, #6459A7);
  background-size: 100% 300%;
  border-radius: 4px 0 0 4px;
  transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: indicator-flow 4s ease-in-out infinite;
  filter: blur(0px);
}
@keyframes indicator-flow {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 0% 100%; }
}

.sidebar-nav-item:hover::after {
  transform: translateY(-50%) scaleY(1);
  height: 65%;
  filter: blur(0px);
  box-shadow: -3px 0 12px rgba(100, 89, 167, 0.2);
}

/* ─── 3. Hover Effects — Glass Morphism Light Mode ─── */
.sidebar-nav-item:hover {
  padding-right: 16px;
  background: linear-gradient(135deg, rgba(100, 80, 180, 0.07), rgba(139, 127, 212, 0.03), rgba(100, 89, 167, 0.05));
  color: #1c2833;
  box-shadow:
    0 4px 16px rgba(100, 89, 167, 0.08),
    0 1px 3px rgba(100, 89, 167, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(100, 89, 167, 0.06);
  transform: translateX(-2px);
}

/* ─── 4. Icon Effects — Cinematic Glow + Morph ─── */
.sidebar-nav-icon {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
}

.sidebar-nav-item:hover .sidebar-nav-icon {
  filter: drop-shadow(0 0 10px rgba(100, 89, 167, 0.5)) drop-shadow(0 0 20px rgba(100, 89, 167, 0.15));
  transform: scale(1.25) rotate(-10deg);
  color: #6459A7;
}

/* ─── 5. Active Item — Neon Spotlight Effect (Light) ─── */
.sidebar-nav-item-active {
  background: linear-gradient(135deg, rgba(100, 80, 180, 0.12), rgba(139, 127, 212, 0.06), rgba(100, 89, 167, 0.08)) !important;
  color: #6459A7 !important;
  box-shadow:
    0 6px 24px rgba(100, 89, 167, 0.1),
    0 2px 8px rgba(100, 89, 167, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    inset 0 -1px 0 rgba(100, 89, 167, 0.04) !important;
  border: 1px solid rgba(100, 89, 167, 0.1) !important;
  transform: translateX(-3px) !important;
}

.sidebar-nav-item-active::after {
  transform: translateY(-50%) scaleY(1) !important;
  width: 4px !important;
  height: 75% !important;
  background: linear-gradient(180deg, #6459A7, #8B7FD4, #3DB1AC, #6459A7) !important;
  background-size: 100% 300% !important;
  box-shadow: -4px 0 20px rgba(100, 89, 167, 0.35), -2px 0 8px rgba(100, 89, 167, 0.2) !important;
  animation: indicator-flow 3s ease-in-out infinite, neon-pulse-light 2s ease-in-out infinite !important;
}
@keyframes neon-pulse-light {
  0%, 100% { box-shadow: -4px 0 15px rgba(100, 89, 167, 0.25); }
  50% { box-shadow: -6px 0 25px rgba(100, 89, 167, 0.45), -2px 0 10px rgba(139, 127, 212, 0.3); }
}

.sidebar-nav-item-active .sidebar-nav-icon {
  color: #6459A7 !important;
  filter: drop-shadow(0 0 8px rgba(100, 89, 167, 0.4)) drop-shadow(0 0 16px rgba(100, 89, 167, 0.15));
  animation: icon-breathe 2.5s ease-in-out infinite;
}
@keyframes icon-breathe {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(100, 89, 167, 0.25)); transform: scale(1); }
  50% { filter: drop-shadow(0 0 14px rgba(100, 89, 167, 0.55)) drop-shadow(0 0 24px rgba(100, 89, 167, 0.15)); transform: scale(1.1); }
}

/* Active item text glow */
.sidebar-nav-item-active span {
  text-shadow: 0 0 20px rgba(100, 89, 167, 0.15);
}

/* ─── 6. Group Header — Animated Section Indicator ─── */
.sidebar-group-header {
  position: relative;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  border-radius: 10px;
}

.sidebar-group-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0%;
  background: linear-gradient(180deg, rgba(100, 89, 167, 0.3), rgba(139, 127, 212, 0.1), transparent);
  border-radius: 0 4px 4px 0;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.sidebar-group-header:hover {
  background: rgba(100, 80, 180, 0.04);
  padding-right: 4px;
}

.sidebar-group-header:hover::before {
  width: 3px;
  height: 70%;
  box-shadow: 2px 0 10px rgba(100, 89, 167, 0.15);
}

/* ─── 7. Gradient Separator Lines — Luminous ─── */
.sidebar-gradient-divider {
  height: 1px;
  background: linear-gradient(to left, transparent 5%, rgba(100, 89, 167, 0.12) 30%, rgba(139, 127, 212, 0.18) 50%, rgba(100, 89, 167, 0.12) 70%, transparent 95%);
  margin: 10px 16px;
  position: relative;
  overflow: hidden;
}
.sidebar-gradient-divider::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -100%;
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(100, 89, 167, 0.4), rgba(139, 127, 212, 0.3), transparent);
  animation: divider-shimmer 6s ease-in-out infinite;
  filter: blur(1px);
}
@keyframes divider-shimmer {
  0% { left: -60%; }
  50% { left: 100%; }
  100% { left: 100%; }
}
.sidebar-gradient-divider::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to left, transparent, rgba(100, 89, 167, 0.25), transparent);
  animation: divider-pulse 5s ease-in-out infinite;
  opacity: 0;
}
@keyframes divider-pulse {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.8; }
}
.dark .sidebar-gradient-divider {
  background: linear-gradient(to left, transparent 5%, rgba(61, 177, 172, 0.1) 30%, rgba(100, 89, 167, 0.12) 50%, rgba(61, 177, 172, 0.1) 70%, transparent 95%);
}
.dark .sidebar-gradient-divider::before {
  background: linear-gradient(90deg, transparent, rgba(61, 177, 172, 0.5), rgba(100, 89, 167, 0.3), transparent);
}
.dark .sidebar-gradient-divider::after {
  background: linear-gradient(to left, transparent, rgba(61, 177, 172, 0.2), transparent);
}

/* ─── 8. Dark Mode — Neon Cyberpunk Sidebar ─── */
.dark .sidebar-nav-item::after {
  background: linear-gradient(180deg, #3DB1AC, #6459A7, #8B7FD4, #3DB1AC);
  background-size: 100% 300%;
}

.dark .sidebar-nav-item:hover {
  background: linear-gradient(135deg, rgba(61, 177, 172, 0.1), rgba(100, 89, 167, 0.05), rgba(61, 177, 172, 0.06));
  color: #E1DEF5;
  box-shadow:
    0 4px 20px rgba(61, 177, 172, 0.08),
    0 1px 4px rgba(61, 177, 172, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(61, 177, 172, 0.06);
  transform: translateX(-2px);
}

.dark .sidebar-nav-item:hover::after {
  box-shadow: -4px 0 15px rgba(61, 177, 172, 0.25);
}

.dark .sidebar-nav-item:hover .sidebar-nav-icon {
  filter: drop-shadow(0 0 12px rgba(61, 177, 172, 0.6)) drop-shadow(0 0 24px rgba(61, 177, 172, 0.2));
  color: #3DB1AC;
  transform: scale(1.25) rotate(-10deg);
}

.dark .sidebar-nav-item-active {
  background: linear-gradient(135deg, rgba(61, 177, 172, 0.15), rgba(100, 89, 167, 0.08), rgba(61, 177, 172, 0.1)) !important;
  color: #3DB1AC !important;
  box-shadow:
    0 6px 28px rgba(61, 177, 172, 0.1),
    0 2px 8px rgba(61, 177, 172, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -1px 0 rgba(61, 177, 172, 0.04) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(61, 177, 172, 0.1) !important;
  transform: translateX(-3px) !important;
}

.dark .sidebar-nav-item-active::after {
  width: 4px !important;
  height: 75% !important;
  background: linear-gradient(180deg, #3DB1AC, #6459A7, #8B7FD4, #3DB1AC) !important;
  background-size: 100% 300% !important;
  box-shadow: -5px 0 25px rgba(61, 177, 172, 0.4), -2px 0 10px rgba(61, 177, 172, 0.25) !important;
  animation: indicator-flow 3s ease-in-out infinite, neon-pulse-dark 2s ease-in-out infinite !important;
}
@keyframes neon-pulse-dark {
  0%, 100% { box-shadow: -4px 0 18px rgba(61, 177, 172, 0.3); }
  50% { box-shadow: -7px 0 30px rgba(61, 177, 172, 0.5), -3px 0 12px rgba(100, 89, 167, 0.3); }
}

.dark .sidebar-nav-item-active .sidebar-nav-icon {
  color: #3DB1AC !important;
  filter: drop-shadow(0 0 10px rgba(61, 177, 172, 0.5)) drop-shadow(0 0 20px rgba(61, 177, 172, 0.2));
  animation: icon-breathe-dark 2.5s ease-in-out infinite;
}
@keyframes icon-breathe-dark {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(61, 177, 172, 0.3)); transform: scale(1); }
  50% { filter: drop-shadow(0 0 16px rgba(61, 177, 172, 0.65)) drop-shadow(0 0 28px rgba(61, 177, 172, 0.2)); transform: scale(1.1); }
}

.dark .sidebar-nav-item-active span {
  text-shadow: 0 0 20px rgba(61, 177, 172, 0.2);
}

.dark .sidebar-group-header:hover {
  background: rgba(61, 177, 172, 0.06);
}

.dark .sidebar-group-header:hover::before {
  background: linear-gradient(180deg, rgba(61, 177, 172, 0.35), rgba(100, 89, 167, 0.15), transparent);
  box-shadow: 2px 0 10px rgba(61, 177, 172, 0.15);
}

/* ─── 9. Badge Notifications — Neon Glow ─── */
@keyframes badge-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  50% { transform: scale(1.2); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
}

.sidebar-badge-pulse {
  animation: badge-pulse 1.8s ease-in-out infinite;
}

.sidebar-badge {
  font-size: 9px;
  font-weight: 800;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0 6px;
  background: linear-gradient(135deg, #ef4444, #dc2626, #ef4444);
  background-size: 200% 200%;
  color: white;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.35), 0 0 20px rgba(239, 68, 68, 0.1);
  animation: badge-pulse 1.8s ease-in-out infinite, badge-gradient 3s ease infinite;
  letter-spacing: 0.5px;
}
@keyframes badge-gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* ─── 10. Tooltip — Glass Floating Card ─── */
.sidebar-tooltip {
  opacity: 0;
  transform: translateX(10px) scale(0.9);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  backdrop-filter: blur(16px) saturate(1.3);
  border: 1px solid rgba(100, 89, 167, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.sidebar-nav-item:hover .sidebar-tooltip {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.dark .sidebar-tooltip {
  border-color: rgba(61, 177, 172, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(61, 177, 172, 0.05);
}

/* ─── 11. User Card — Holographic Premium ─── */
.sidebar-user-card {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  border-radius: 16px;
}
.sidebar-user-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(100, 89, 167, 0.05), rgba(139, 127, 212, 0.02), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.sidebar-user-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg, transparent, rgba(100, 89, 167, 0.03), transparent, rgba(139, 127, 212, 0.02), transparent);
  animation: holographic-rotate 8s linear infinite;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}
@keyframes holographic-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.sidebar-user-card:hover::before {
  opacity: 1;
}
.sidebar-user-card:hover::after {
  opacity: 1;
}
.sidebar-user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(100, 89, 167, 0.08);
}
.dark .sidebar-user-card::before {
  background: linear-gradient(135deg, rgba(61, 177, 172, 0.08), rgba(100, 89, 167, 0.04), transparent);
}
.dark .sidebar-user-card::after {
  background: conic-gradient(from 0deg, transparent, rgba(61, 177, 172, 0.04), transparent, rgba(100, 89, 167, 0.03), transparent);
}
.dark .sidebar-user-card:hover {
  box-shadow: 0 8px 24px rgba(61, 177, 172, 0.06), 0 0 30px rgba(61, 177, 172, 0.03);
}

/* User avatar ring — Conic Gradient Spinning */
@keyframes avatar-ring-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.sidebar-avatar-ring {
  position: relative;
}
.sidebar-avatar-ring::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #6459A7, #3DB1AC, #8B7FD4, #3DB1AC, #6459A7);
  animation: avatar-ring-rotate 4s linear infinite;
  z-index: -1;
  opacity: 0.7;
  filter: blur(0.5px);
}
.sidebar-avatar-ring::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  background: var(--sidebar);
  z-index: -1;
}
.sidebar-user-card:hover .sidebar-avatar-ring::before {
  opacity: 1;
  filter: blur(0px) drop-shadow(0 0 6px rgba(100, 89, 167, 0.3));
}

/* Online status — Breathing Glow */
@keyframes status-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); transform: scale(1); }
  50% { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); transform: scale(1.1); }
}
.sidebar-status-online {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: 2px solid var(--sidebar);
  position: absolute;
  bottom: 0;
  left: 0;
  animation: status-pulse 2s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
}

/* ─── 12. Sidebar Search — Glowing Input ─── */
.sidebar-search {
  position: relative;
  transition: all 0.35s ease;
}
.sidebar-search input {
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  border: 1.5px solid transparent;
  border-radius: 12px;
}
.sidebar-search input:focus {
  border-color: rgba(100, 89, 167, 0.35);
  box-shadow:
    0 0 0 4px rgba(100, 89, 167, 0.08),
    0 4px 16px rgba(100, 89, 167, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transform: scale(1.01);
}
.dark .sidebar-search input:focus {
  border-color: rgba(61, 177, 172, 0.35);
  box-shadow:
    0 0 0 4px rgba(61, 177, 172, 0.08),
    0 4px 16px rgba(61, 177, 172, 0.08),
    0 0 20px rgba(61, 177, 172, 0.04);
  transform: scale(1.01);
}

/* ─── 13. Smooth Scroll ─── */
.sidebar-nav-scroll {
  scroll-behavior: smooth;
}
.sidebar-nav-scroll > * > * {
  transition: transform 0.2s ease-out;
}

/* ─── 14. Collapsed Sidebar — Floating Icons ─── */
.sidebar-collapsed-icon {
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.sidebar-collapsed-icon:hover {
  transform: scale(1.3) translateX(-2px);
  filter: drop-shadow(0 0 10px rgba(100, 89, 167, 0.5)) drop-shadow(0 0 20px rgba(100, 89, 167, 0.15));
}
.dark .sidebar-collapsed-icon:hover {
  filter: drop-shadow(0 0 10px rgba(61, 177, 172, 0.6)) drop-shadow(0 0 20px rgba(61, 177, 172, 0.2));
}

/* ─── 15. Sidebar Floating Particles (extra orb) ─── */
.sidebar-aurora-bg .sidebar-orb-2 {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 127, 212, 0.05), transparent 70%);
  bottom: 15%;
  left: -10px;
  animation: sidebar-orb-float-2 25s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
  filter: blur(15px);
}
.dark .sidebar-aurora-bg .sidebar-orb-2 {
  background: radial-gradient(circle, rgba(61, 177, 172, 0.06), transparent 70%);
}

/* ─── 16. Sidebar Edge Glow Line ─── */
.sidebar-edge-glow {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent 5%, rgba(100, 89, 167, 0.15) 20%, rgba(139, 127, 212, 0.2) 50%, rgba(100, 89, 167, 0.15) 80%, transparent 95%);
  z-index: 10;
  pointer-events: none;
}
.sidebar-edge-glow::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 60px;
  background: linear-gradient(180deg, rgba(100, 89, 167, 0.6), transparent);
  animation: edge-glow-travel 8s ease-in-out infinite;
  filter: blur(1px);
}
@keyframes edge-glow-travel {
  0% { top: -60px; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: calc(100% + 60px); opacity: 0; }
}
.dark .sidebar-edge-glow {
  background: linear-gradient(180deg, transparent 5%, rgba(61, 177, 172, 0.12) 20%, rgba(100, 89, 167, 0.15) 50%, rgba(61, 177, 172, 0.12) 80%, transparent 95%);
}
.dark .sidebar-edge-glow::after {
  background: linear-gradient(180deg, rgba(61, 177, 172, 0.7), transparent);
}

/* Responsive & Accessibility — Design System */
@media (max-width: 768px) {
  .sidebar-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px); z-index: 40;
  }
}

button, a, [role="button"], select { min-height: 44px; }

@media (max-width: 640px) {
  h1 { font-size: 1.375rem; }
  h2 { font-size: 1.125rem; }
}

/* ═══ Shared UI Components (theme-aware via CSS variables) ═══ */

.kpi-card {
  background: linear-gradient(145deg, rgba(45, 35, 85, 0.5) 0%, rgba(25, 20, 55, 0.65) 100%);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(120, 100, 200, 0.12);
  border-radius: 1.25rem;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 5px;
  height: 100%;
  border-radius: 0 1.25rem 1.25rem 0;
}
.kpi-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%);
  pointer-events: none;
  border-radius: inherit;
}
.kpi-card:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(120, 100, 200, 0.3);
  box-shadow: 0 12px 40px rgba(100, 80, 180, 0.15);
}
.kpi-card[data-accent="crimson"]::before { background: linear-gradient(180deg, #FF4D6A, #DC3545); }
.kpi-card[data-accent="teal"]::before { background: linear-gradient(180deg, #4ECDC4, #3DB1AC); }
.kpi-card[data-accent="purple"]::before { background: linear-gradient(180deg, #8B7FD4, #6459A7); }
.kpi-card[data-accent="gold"]::before { background: linear-gradient(180deg, #F0D060, #D4AF37); }
.kpi-card[data-accent="blue"]::before { background: linear-gradient(180deg, #5B9BD5, #3A7BD5); }
.kpi-card[data-accent="green"]::before { background: linear-gradient(180deg, #5CB85C, #3D9140); }

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(120, 100, 200, 0.3), transparent);
  margin: 3rem 0;
}


/* ═══ KPI Card Theme Awareness ═══ */
.kpi-card {
  background: var(--glass-bg, linear-gradient(145deg, rgba(45, 35, 85, 0.5) 0%, rgba(25, 20, 55, 0.65) 100%));
  border-color: var(--glass-border, rgba(120, 100, 200, 0.12));
}
.kpi-card:hover {
  border-color: var(--glass-hover-border, rgba(120, 100, 200, 0.3));
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2), 0 0 20px var(--glow-color, rgba(100, 80, 180, 0.15));
}

/* ═══ Section Divider Theme Awareness ═══ */
.section-divider {
  background: linear-gradient(90deg, transparent, var(--glass-border, rgba(120, 100, 200, 0.3)), transparent) !important;
}

/* ═══════════════════════════════════════════════════════════════════
   ATLAS DESIGN SYSTEM — Rebuilt without backdrop-filter blur
   Exact match to rasid-atlas-production-d44a.up.railway.app
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Atlas Dark Variables ─── */
.dark[data-design-style="atlas"] {
  --background: #0E0B24;
  --foreground: #E8E4F0;
  --card: rgba(30, 24, 60, 0.85);
  --card-foreground: #E8E4F0;
  --popover: #1A1440;
  --popover-foreground: #E8E4F0;
  --primary: #8B7FD4;
  --primary-foreground: #FFFFFF;
  --secondary: #4ECDC4;
  --secondary-foreground: #0E0B24;
  --accent: #6459A7;
  --accent-foreground: #FFFFFF;
  --muted: rgba(139, 127, 212, 0.12);
  --muted-foreground: rgba(232, 228, 240, 0.55);
  --destructive: #FF4D6A;
  --destructive-foreground: #FFFFFF;
  --border: rgba(120, 100, 200, 0.15);
  --input: rgba(30, 24, 60, 0.7);
  --ring: #8B7FD4;
  --chart-1: #8B7FD4;
  --chart-2: #4ECDC4;
  --chart-3: #F0D060;
  --chart-4: #FF4D6A;
  --chart-5: #5ECEC9;
  --sidebar: rgba(14, 11, 36, 0.98);
  --sidebar-foreground: #E8E4F0;
  --sidebar-primary: #8B7FD4;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: rgba(139, 127, 212, 0.1);
  --sidebar-accent-foreground: #E8E4F0;
  --sidebar-border: rgba(120, 100, 200, 0.1);
  --sidebar-ring: #8B7FD4;
  --glass-bg: rgba(30, 24, 60, 0.75);
  --glass-border: rgba(120, 100, 200, 0.12);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  --glass-hover-bg: rgba(35, 28, 70, 0.85);
  --glass-hover-border: rgba(139, 127, 212, 0.3);
  --glow-color: rgba(139, 127, 212, 0.3);
  --glow-strong: rgba(139, 127, 212, 0.6);
  --page-bg: #0E0B24;
  --sidebar-bg-custom: rgba(14, 11, 36, 0.98);
}

/* ─── Atlas Light Variables ─── */
.light[data-design-style="atlas"] {
  --background: #F8F7F4;
  --foreground: #1E1B4B;
  --card: #FFFFFF;
  --card-foreground: #1E1B4B;
  --popover: #FFFFFF;
  --popover-foreground: #1E1B4B;
  --primary: #6459A7;
  --primary-foreground: #FFFFFF;
  --secondary: #3DB1AC;
  --secondary-foreground: #FFFFFF;
  --accent: #8B7FD4;
  --accent-foreground: #FFFFFF;
  --muted: rgba(100, 89, 167, 0.08);
  --muted-foreground: #334155;
  --destructive: #DC3545;
  --destructive-foreground: #FFFFFF;
  --border: rgba(120, 100, 200, 0.2);
  --input: rgba(100, 89, 167, 0.06);
  --ring: #6459A7;
  --chart-1: #6459A7;
  --chart-2: #3DB1AC;
  --chart-3: #D4AF37;
  --chart-4: #DC3545;
  --chart-5: #2a8a86;
  --sidebar: #FFFFFF;
  --sidebar-foreground: #1E1B4B;
  --sidebar-primary: #6459A7;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: rgba(100, 89, 167, 0.06);
  --sidebar-accent-foreground: #1E1B4B;
  --sidebar-border: rgba(120, 100, 200, 0.08);
  --sidebar-ring: #6459A7;
  --glass-bg: #FFFFFF;
  --glass-border: rgba(120, 100, 200, 0.18);
  --glass-shadow: 0 2px 16px rgba(100, 80, 180, 0.1), 0 1px 3px rgba(0,0,0,0.06);
  --glass-hover-bg: #FFFFFF;
  --glass-hover-border: rgba(120, 100, 200, 0.3);
  --glow-color: rgba(100, 89, 167, 0.15);
  --glow-strong: rgba(100, 89, 167, 0.3);
  --page-bg: #F8F7F4;
  --sidebar-bg-custom: #FFFFFF;
}

/* ─── Atlas Cards — Dark (NO backdrop-filter!) ─── */
.dark[data-design-style="atlas"] .glass-card,
.dark[data-design-style="atlas"] [data-slot="card"] {
  background: linear-gradient(145deg, rgba(30, 24, 60, 0.75) 0%, rgba(20, 16, 48, 0.85) 50%, rgba(14, 11, 36, 0.9) 100%);
  border: 1px solid rgba(120, 100, 200, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  border-radius: 1.25rem;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
}
.dark[data-design-style="atlas"] .glass-card::before,
.dark[data-design-style="atlas"] [data-slot="card"]::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%);
  pointer-events: none;
  border-radius: inherit;
}
.dark[data-design-style="atlas"] .glass-card:hover,
.dark[data-design-style="atlas"] [data-slot="card"]:hover {
  border-color: rgba(139, 127, 212, 0.3);
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 16px 48px rgba(100, 80, 180, 0.15), 0 0 30px rgba(139, 127, 212, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* ─── Atlas Cards — Light ─── */
.light[data-design-style="atlas"] .glass-card,
.light[data-design-style="atlas"] [data-slot="card"] {
  background: linear-gradient(145deg, #ffffff 0%, #faf9f7 50%, #f5f4f0 100%);
  border: 1px solid rgba(120, 100, 200, 0.15);
  box-shadow: 0 2px 16px rgba(100, 80, 180, 0.08), 0 1px 3px rgba(0,0,0,0.04);
  border-radius: 1.25rem;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.light[data-design-style="atlas"] .glass-card::before,
.light[data-design-style="atlas"] [data-slot="card"]::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%);
  pointer-events: none;
  border-radius: inherit;
}
.light[data-design-style="atlas"] .glass-card:hover,
.light[data-design-style="atlas"] [data-slot="card"]:hover {
  border-color: rgba(120, 100, 200, 0.22);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(100, 80, 180, 0.08), 0 0 0 1px rgba(120, 100, 200, 0.06);
}

/* ─── Atlas KPI Cards ─── */
.dark[data-design-style="atlas"] .kpi-card {
  background: linear-gradient(145deg, rgba(30, 24, 60, 0.7) 0%, rgba(20, 16, 48, 0.8) 100%);
  border: 1px solid rgba(120, 100, 200, 0.12);
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
.dark[data-design-style="atlas"] .kpi-card:hover {
  border-color: rgba(139, 127, 212, 0.3);
  box-shadow: 0 12px 40px rgba(100, 80, 180, 0.15), 0 0 20px rgba(139, 127, 212, 0.08);
}
.light[data-design-style="atlas"] .kpi-card {
  background: linear-gradient(145deg, #ffffff 0%, #faf9f7 100%);
  border: 1px solid rgba(120, 100, 200, 0.15);
  box-shadow: 0 2px 12px rgba(100, 80, 180, 0.06), 0 1px 3px rgba(0,0,0,0.03);
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
.light[data-design-style="atlas"] .kpi-card:hover {
  box-shadow: 0 8px 28px rgba(100, 80, 180, 0.1);
}

/* ─── Atlas Sidebar ─── */
.dark[data-design-style="atlas"] .sidebar-nav-item::after {
  background: linear-gradient(180deg, #8B7FD4, #6459A7);
}
.dark[data-design-style="atlas"] .sidebar-nav-item:hover {
  background: rgba(139, 127, 212, 0.06); color: #E8E4F0;
}
.dark[data-design-style="atlas"] .sidebar-nav-item:hover .sidebar-nav-icon {
  filter: drop-shadow(0 0 6px rgba(139, 127, 212, 0.4)); color: #8B7FD4;
}
.dark[data-design-style="atlas"] .sidebar-nav-item-active {
  background: rgba(139, 127, 212, 0.12) !important; color: #8B7FD4 !important;
}
.dark[data-design-style="atlas"] .sidebar-nav-item-active::after {
  background: linear-gradient(180deg, #8B7FD4, #4ECDC4) !important;
}
.light[data-design-style="atlas"] .sidebar-nav-item::after {
  background: linear-gradient(180deg, #6459A7, #8B7FD4);
}
.light[data-design-style="atlas"] .sidebar-nav-item:hover {
  background: rgba(139, 127, 212, 0.05); color: #1E1B4B;
}
.light[data-design-style="atlas"] .sidebar-nav-item:hover .sidebar-nav-icon {
  filter: drop-shadow(0 0 6px rgba(100, 89, 167, 0.3)); color: #6459A7;
}
.light[data-design-style="atlas"] .sidebar-nav-item-active {
  background: rgba(139, 127, 212, 0.1) !important; color: #6459A7 !important;
}
.light[data-design-style="atlas"] .sidebar-nav-item-active::after {
  background: linear-gradient(180deg, #6459A7, #4ECDC4) !important;
}

/* ─── Atlas Tables ─── */
.dark[data-design-style="atlas"] table thead tr { background: rgba(18, 14, 45, 0.6); }
.dark[data-design-style="atlas"] table thead th { border-bottom: 1px solid rgba(120, 100, 200, 0.15); }
.dark[data-design-style="atlas"] table tbody tr:hover { background: rgba(139, 127, 212, 0.06); }
.dark[data-design-style="atlas"] table tbody td { border-bottom: 1px solid rgba(120, 100, 200, 0.06); }
.light[data-design-style="atlas"] table thead tr { background: rgba(248, 247, 244, 0.8); }
.light[data-design-style="atlas"] table thead th { border-bottom: 1px solid rgba(120, 100, 200, 0.12); color: #64748b; }
.light[data-design-style="atlas"] table tbody tr:hover { background: rgba(139, 127, 212, 0.04); }
.light[data-design-style="atlas"] table tbody td { border-bottom: 1px solid rgba(120, 100, 200, 0.06); }

/* ─── Atlas Scrollbar ─── */
.dark[data-design-style="atlas"] ::-webkit-scrollbar { width: 5px; height: 5px; }
.dark[data-design-style="atlas"] ::-webkit-scrollbar-track { background: rgba(18, 14, 45, 0.5); }
.dark[data-design-style="atlas"] ::-webkit-scrollbar-thumb { background: rgba(120, 100, 200, 0.3); border-radius: 3px; }
.dark[data-design-style="atlas"] ::-webkit-scrollbar-thumb:hover { background: rgba(120, 100, 200, 0.5); }
.light[data-design-style="atlas"] ::-webkit-scrollbar-track { background: rgba(248, 247, 244, 0.8); }
.light[data-design-style="atlas"] ::-webkit-scrollbar-thumb { background: rgba(120, 100, 200, 0.2); }
.light[data-design-style="atlas"] ::-webkit-scrollbar-thumb:hover { background: rgba(120, 100, 200, 0.35); }

/* ─── Atlas Glow Effects ─── */
.dark[data-design-style="atlas"] .glow-teal { box-shadow: 0 0 24px rgba(78, 205, 196, 0.18), 0 0 80px rgba(78, 205, 196, 0.06); }
.dark[data-design-style="atlas"] .glow-purple { box-shadow: 0 0 24px rgba(139, 127, 212, 0.18), 0 0 80px rgba(139, 127, 212, 0.06); }
.dark[data-design-style="atlas"] .glow-gold { box-shadow: 0 0 24px rgba(240, 208, 96, 0.18), 0 0 80px rgba(240, 208, 96, 0.06); }
.dark[data-design-style="atlas"] .glow-crimson { box-shadow: 0 0 24px rgba(255, 77, 106, 0.18), 0 0 80px rgba(255, 77, 106, 0.06); }
.light[data-design-style="atlas"] .glow-teal { box-shadow: 0 0 16px rgba(61, 177, 172, 0.1), 0 0 40px rgba(61, 177, 172, 0.04); }
.light[data-design-style="atlas"] .glow-purple { box-shadow: 0 0 16px rgba(100, 89, 167, 0.1), 0 0 40px rgba(100, 89, 167, 0.04); }
.light[data-design-style="atlas"] .glow-gold { box-shadow: 0 0 16px rgba(212, 175, 55, 0.1), 0 0 40px rgba(212, 175, 55, 0.04); }
.light[data-design-style="atlas"] .glow-crimson { box-shadow: 0 0 16px rgba(220, 53, 69, 0.1), 0 0 40px rgba(220, 53, 69, 0.04); }

/* ─── Atlas Sensitivity Badges ─── */
.dark[data-design-style="atlas"] .badge-high { background: rgba(255, 77, 106, 0.12); color: #FF6B7A; border: 1px solid rgba(255, 77, 106, 0.2); }
.dark[data-design-style="atlas"] .badge-medium { background: rgba(240, 208, 96, 0.12); color: #F0D060; border: 1px solid rgba(240, 208, 96, 0.2); }
.dark[data-design-style="atlas"] .badge-low { background: rgba(78, 205, 196, 0.12); color: #5ECEC9; border: 1px solid rgba(78, 205, 196, 0.2); }
.light[data-design-style="atlas"] .badge-high { background: rgba(220, 53, 69, 0.08); color: #DC3545; border: 1px solid rgba(220, 53, 69, 0.2); }
.light[data-design-style="atlas"] .badge-medium { background: rgba(212, 175, 55, 0.1); color: #b8960a; border: 1px solid rgba(212, 175, 55, 0.25); }
.light[data-design-style="atlas"] .badge-low { background: rgba(61, 177, 172, 0.08); color: #2a8a86; border: 1px solid rgba(61, 177, 172, 0.2); }

/* ─── Atlas Shimmer Text ─── */
.dark[data-design-style="atlas"] .shimmer-text {
  background: linear-gradient(90deg, #fff 0%, #8B7FD4 25%, #4ECDC4 50%, #8B7FD4 75%, #fff 100%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}
.light[data-design-style="atlas"] .shimmer-text {
  background: linear-gradient(90deg, #1E1B4B 0%, #6459A7 25%, #2a8a86 50%, #6459A7 75%, #1E1B4B 100%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

/* ─── Atlas Filter Buttons ─── */
.dark[data-design-style="atlas"] .filter-btn {
  border: 1px solid rgba(120, 100, 200, 0.15); color: rgba(148, 163, 184, 1); background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;
}
.dark[data-design-style="atlas"] .filter-btn:hover {
  border-color: rgba(120, 100, 200, 0.3); color: white; background: rgba(139, 127, 212, 0.08);
}
.dark[data-design-style="atlas"] .filter-btn.active {
  background: rgba(139, 127, 212, 0.15); border-color: rgba(139, 127, 212, 0.3); color: white;
}
.light[data-design-style="atlas"] .filter-btn {
  color: #64748b; background: rgba(255, 255, 255, 0.8); border-color: rgba(120, 100, 200, 0.12);
}
.light[data-design-style="atlas"] .filter-btn:hover {
  color: #1E1B4B; background: rgba(139, 127, 212, 0.06); border-color: rgba(120, 100, 200, 0.25);
}
.light[data-design-style="atlas"] .filter-btn.active {
  background: rgba(139, 127, 212, 0.1); border-color: rgba(139, 127, 212, 0.25); color: #1E1B4B;
}

/* ─── Atlas Inputs ─── */
.dark[data-design-style="atlas"] input:not([type="checkbox"]):not([type="radio"]),
.dark[data-design-style="atlas"] textarea,
.dark[data-design-style="atlas"] select {
  background: rgba(25, 20, 55, 0.7) !important; border-color: rgba(120, 100, 200, 0.15);
}
.dark[data-design-style="atlas"] input:focus,
.dark[data-design-style="atlas"] textarea:focus,
.dark[data-design-style="atlas"] select:focus {
  border-color: rgba(139, 127, 212, 0.4) !important;
  box-shadow: 0 0 0 2px rgba(139, 127, 212, 0.15), 0 0 20px rgba(139, 127, 212, 0.08) !important;
}

/* ─── Atlas Dialogs ─── */
.dark[data-design-style="atlas"] [data-slot="dialog-overlay"] { background: rgba(14, 11, 36, 0.7); backdrop-filter: blur(8px); }
.dark[data-design-style="atlas"] [data-slot="dialog-content"] {
  background: linear-gradient(180deg, rgba(20,16,48,0.95) 0%, rgba(12,10,35,0.98) 100%);
  backdrop-filter: blur(24px) saturate(1.6);
  border-color: rgba(120, 100, 200, 0.15);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
.light[data-design-style="atlas"] [data-slot="dialog-overlay"] { background: rgba(248, 247, 244, 0.5); backdrop-filter: blur(4px); }
.light[data-design-style="atlas"] [data-slot="dialog-content"] {
  background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,247,244,0.99) 100%);
  border-color: rgba(120, 100, 200, 0.12);
  box-shadow: 0 16px 48px rgba(100, 80, 180, 0.1), 0 4px 12px rgba(100, 80, 180, 0.05);
}

/* ─── Atlas Tabs ─── */
.dark[data-design-style="atlas"] [role="tablist"] { background: rgba(25, 20, 55, 0.5); border-color: rgba(120, 100, 200, 0.1); }
.dark[data-design-style="atlas"] [role="tab"][data-state="active"] { background: rgba(139, 127, 212, 0.15); box-shadow: 0 2px 8px rgba(139, 127, 212, 0.1); }
.light[data-design-style="atlas"] [role="tablist"] { background: rgba(248, 247, 244, 0.8); border-color: rgba(120, 100, 200, 0.1); }
.light[data-design-style="atlas"] [role="tab"][data-state="active"] { background: rgba(255, 255, 255, 0.9); box-shadow: 0 2px 8px rgba(100, 80, 180, 0.06); }

/* ─── Atlas Light Text Overrides ─── */
.light[data-design-style="atlas"] .text-white { color: #1E1B4B !important; }
.light[data-design-style="atlas"] .text-gray-200 { color: #334155 !important; }
.light[data-design-style="atlas"] .text-gray-300 { color: #475569 !important; }
.light[data-design-style="atlas"] .text-gray-400 { color: #64748b !important; }
.light[data-design-style="atlas"] .text-gray-500 { color: #64748b !important; }
.light[data-design-style="atlas"] .bg-white\/5 { background-color: rgba(120, 100, 200, 0.06) !important; }
.light[data-design-style="atlas"] .bg-white\/3 { background-color: rgba(120, 100, 200, 0.04) !important; }
.light[data-design-style="atlas"] .hover\:text-white:hover { color: #1E1B4B !important; }
.light[data-design-style="atlas"] .hover\:bg-white\/5:hover { background-color: rgba(120, 100, 200, 0.08) !important; }
.light[data-design-style="atlas"] .border-white\/5 { border-color: rgba(120, 100, 200, 0.1) !important; }
.light[data-design-style="atlas"] .border-white\/3 { border-color: rgba(120, 100, 200, 0.06) !important; }
.light[data-design-style="atlas"] .recharts-text { fill: #475569 !important; }
.light[data-design-style="atlas"] .recharts-cartesian-grid-horizontal line,
.light[data-design-style="atlas"] .recharts-cartesian-grid-vertical line { stroke: rgba(120, 100, 200, 0.08) !important; }
.light[data-design-style="atlas"] .text-\[\#8B7FD4\] { color: #6459A7 !important; }
.light[data-design-style="atlas"] .text-\[\#4ECDC4\] { color: #2a8a86 !important; }
.light[data-design-style="atlas"] .text-\[\#FF4D6A\] { color: #DC3545 !important; }
.light[data-design-style="atlas"] .text-\[\#F0D060\] { color: #b8960a !important; }

/* ─── Atlas Background ─── */
.dark[data-design-style="atlas"] {
  background-image:
    radial-gradient(900px 500px at 20% 10%, rgba(139, 127, 212, 0.04), transparent 60%),
    radial-gradient(800px 480px at 80% 0%, rgba(78, 205, 196, 0.03), transparent 55%);
}

/* ─── Atlas Cinematic Entrance ─── */
@keyframes cinematic-reveal {
  0% { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(8px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
.cinematic-enter { animation: cinematic-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

/* ─── Atlas Nebula Background ─── */
@keyframes nebula-drift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.nebula-bg { background-size: 200% 200%; animation: nebula-drift 30s ease infinite; }

/* ─── Atlas Mono Numbers ─── */
.mono-num {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  direction: ltr;
  display: inline-block;
  unicode-bidi: isolate;
}

/* ─── Atlas Pulse Critical ─── */
@keyframes atlas-pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(255, 77, 106, 0.2); }
  50% { box-shadow: 0 0 24px rgba(255, 77, 106, 0.4), 0 0 60px rgba(255, 77, 106, 0.1); }
}
.pulse-critical { animation: atlas-pulse-glow 2.5s ease-in-out infinite; }

/* ─── Scrollbar Hide ─── */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* ═══ Responsive ═══ */
@media (max-width: 768px) {
  .kpi-card { border-radius: 1rem; }
  .sidebar-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px); z-index: 40;
  }
}

button, a, [role="button"], select { min-height: 44px; }

@media (max-width: 640px) {
  h1 { font-size: 1.375rem; }
  h2 { font-size: 1.125rem; }
}

/* ═══ Shimmer Keyframe ═══ */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL LIGHT THEME TEXT OVERRIDES
   Ensures dark-mode text classes are readable in light mode
   ═══════════════════════════════════════════════════════════════════ */

/* ═══ Global Scrollbar Update ═══ */
.dark ::-webkit-scrollbar-track { background: rgba(18, 14, 45, 0.5) !important; }
.dark ::-webkit-scrollbar-thumb { background: rgba(120, 100, 200, 0.3) !important; }
.dark ::-webkit-scrollbar-thumb:hover { background: rgba(120, 100, 200, 0.5) !important; }

/* ═══ Force Tajawal Font on ALL Elements ═══ */
*, *::before, *::after {
  font-family: 'Tajawal', 'Cairo', system-ui, sans-serif !important;
}
input, button, select, textarea, optgroup {
  font-family: 'Tajawal', 'Cairo', system-ui, sans-serif !important;
}
[data-slot="button"], [role="button"], a {
  font-family: 'Tajawal', 'Cairo', system-ui, sans-serif !important;
}
.mono-num, code, pre, [class*="mono"] {
  font-family: 'JetBrains Mono', monospace !important;
}

/* ═══════════════════════════════════════════════════════════════════
   CHAT BOX FIX — Sticky Input & No Duplicate
   ═══════════════════════════════════════════════════════════════════ */
/* Ensure SmartRasid page fills the available height */
[data-scroll-container] > div:has(> [dir="rtl"]) {
  height: 100%;
}

/* Sticky chat input at bottom */
.sticky.bottom-0 {
  position: sticky !important;
  bottom: 0 !important;
  z-index: 20 !important;
}

/* Mobile chat input fix */
@media (max-width: 768px) {
  .sticky.bottom-0 {
    position: sticky !important;
    bottom: 0 !important;
    padding-bottom: env(safe-area-inset-bottom, 8px) !important;
  }
  
  /* Prevent double input on mobile */
  .fixed.bottom-6.left-6 {
    bottom: env(safe-area-inset-bottom, 24px) !important;
    left: env(safe-area-inset-left, 24px) !important;
  }
}


/* ═══════════════════════════════════════════════════════════════
   ATLAS MISSING STYLES — Ported from rasid-atlas for 1:1 match
   ═══════════════════════════════════════════════════════════════ */

/* === KPI ICON === */
.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.kpi-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 16px;
  background: inherit;
  opacity: 0.3;
  filter: blur(8px);
}
.kpi-icon[data-accent="crimson"] { background: linear-gradient(135deg, rgba(255,77,106,0.25), rgba(220,53,69,0.15)); }
.kpi-icon[data-accent="teal"] { background: linear-gradient(135deg, rgba(78,205,196,0.25), rgba(61,177,172,0.15)); }
.kpi-icon[data-accent="purple"] { background: linear-gradient(135deg, rgba(139,127,212,0.25), rgba(100,89,167,0.15)); }
.kpi-icon[data-accent="gold"] { background: linear-gradient(135deg, rgba(240,208,96,0.25), rgba(212,175,55,0.15)); }
.kpi-icon[data-accent="blue"] { background: linear-gradient(135deg, rgba(91,155,213,0.25), rgba(58,123,213,0.15)); }
.kpi-icon[data-accent="green"] { background: linear-gradient(135deg, rgba(92,184,92,0.25), rgba(61,145,64,0.15)); }

/* === TREEMAP TILE === */
.treemap-tile {
  border-radius: 0.625rem;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.treemap-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%);
  pointer-events: none;
}
.treemap-tile:hover {
  transform: scale(1.03);
  z-index: 10;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}

/* === NAV ARROW (Page Navigation) === */
.nav-arrow {
  position: fixed;
  z-index: 45;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(45, 35, 85, 0.7), rgba(25, 20, 55, 0.85));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(120, 100, 200, 0.2);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
}
.nav-arrow:hover {
  background: linear-gradient(145deg, rgba(60, 45, 110, 0.8), rgba(35, 28, 75, 0.9));
  border-color: rgba(120, 100, 200, 0.4);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 8px 32px rgba(100, 80, 180, 0.2);
}

/* === NAV ARROW BUTTON === */
.nav-arrow-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 35, 85, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(120, 100, 200, 0.15);
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  cursor: pointer;
}
.nav-arrow-btn:hover:not(:disabled) {
  background: rgba(60, 45, 110, 0.7);
  border-color: rgba(120, 100, 200, 0.35);
  color: white;
}
.nav-arrow-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.nav-arrow-btn.auto-active {
  background: rgba(139, 127, 212, 0.2);
  border-color: rgba(139, 127, 212, 0.4);
  color: #8B7FD4;
}

/* === NAV DOT === */
.nav-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(120, 100, 200, 0.25);
  border: 1px solid rgba(120, 100, 200, 0.4);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.nav-dot.active {
  background: #8B7FD4;
  box-shadow: 0 0 16px rgba(139, 127, 212, 0.5);
  transform: scale(1.4);
}

/* === AUTO SLIDER === */
.auto-slider {
  -webkit-appearance: none;
  appearance: none;
  background: rgba(120, 100, 200, 0.2);
  border-radius: 2px;
  outline: none;
}
.auto-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #8B7FD4;
  cursor: pointer;
}
.auto-active {
  background: rgba(139, 127, 212, 0.2);
  border-color: rgba(139, 127, 212, 0.4);
  color: #8B7FD4;
}

/* === AUTOPLAY RING === */
.autoplay-ring {
  stroke-dasharray: 126;
  stroke-dashoffset: 126;
  transition: stroke-dashoffset linear;
}
.autoplay-ring.active {
  stroke-dashoffset: 0;
}

/* === CONNECTOR LINE === */
.connector-line { position: relative; }
.connector-line::before {
  content: '';
  position: absolute;
  top: 50%;
  right: -1rem;
  width: 1rem;
  height: 2px;
  background: linear-gradient(90deg, rgba(120, 100, 200, 0.5), transparent);
}

/* === SIDEBAR OPEN STATE === */
body.sidebar-open {
  overflow: hidden;
  touch-action: none;
}

/* === RESPONSIVE KPI ICON === */
@media (max-width: 768px) {
  .kpi-icon {
    width: 28px !important;
    height: 28px !important;
    border-radius: 8px !important;
  }
}

/* ═══════════════════════════════════════════════════
   ATLAS LIGHT THEME — REMOVED duplicate .light rule
   that was overriding .light[data-design-style=atlas]
   with oklch values causing faded/washed-out appearance.
   The correct atlas light variables are defined in
   .light[data-design-style="atlas"] above.
   ═══════════════════════════════════════════════════ */
.light .glass-card {
  background: linear-gradient(145deg, #ffffff 0%, #faf9f7 50%, #f5f4f0 100%);
  border: 1px solid rgba(120, 100, 200, 0.18);
  box-shadow: 0 2px 16px rgba(100, 80, 180, 0.1), 0 1px 3px rgba(0,0,0,0.05);

  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
.light .glass-card::before {
  background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%);
}
.light .glass-card:hover {
  border-color: rgba(120, 100, 200, 0.25);
  box-shadow: 
    0 8px 32px rgba(100, 80, 180, 0.08),
    0 0 0 1px rgba(120, 100, 200, 0.06);
}
.light .kpi-card {
  background: linear-gradient(145deg, #ffffff 0%, #faf9f7 100%);
  border: 1px solid rgba(120, 100, 200, 0.18);
  box-shadow: 0 2px 12px rgba(100, 80, 180, 0.08), 0 1px 3px rgba(0,0,0,0.04);

  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
.light .kpi-card::after {
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
}
.light .kpi-card:hover {
  box-shadow: 0 8px 28px rgba(100, 80, 180, 0.1);
}
.light .badge-high {
  background: rgba(220, 53, 69, 0.08);
  color: #DC3545;
  border: 1px solid rgba(220, 53, 69, 0.2);
}
.light .badge-medium {
  background: rgba(212, 175, 55, 0.1);
  color: #b8960a;
  border: 1px solid rgba(212, 175, 55, 0.25);
}
.light .badge-low {
  background: rgba(61, 177, 172, 0.08);
  color: #2a8a86;
  border: 1px solid rgba(61, 177, 172, 0.2);
}
.light .treemap-tile:hover {
  box-shadow: 0 12px 36px rgba(100,80,180,0.12);
}
.light ::-webkit-scrollbar-track { background: rgba(248, 247, 244, 0.8); }
.light ::-webkit-scrollbar-thumb { background: rgba(120, 100, 200, 0.2); }
.light ::-webkit-scrollbar-thumb:hover { background: rgba(120, 100, 200, 0.35); }
.light .glow-teal { box-shadow: 0 0 16px rgba(61, 177, 172, 0.1), 0 0 40px rgba(61, 177, 172, 0.04); }
.light .glow-purple { box-shadow: 0 0 16px rgba(100, 89, 167, 0.1), 0 0 40px rgba(100, 89, 167, 0.04); }
.light .glow-gold { box-shadow: 0 0 16px rgba(212, 175, 55, 0.1), 0 0 40px rgba(212, 175, 55, 0.04); }
.light .glow-crimson { box-shadow: 0 0 16px rgba(220, 53, 69, 0.1), 0 0 40px rgba(220, 53, 69, 0.04); }
.light .section-divider {
  background: linear-gradient(90deg, transparent, rgba(120, 100, 200, 0.15), transparent);
}
.light .nav-arrow {
  background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(248,247,244,0.95));
  color: rgba(100, 80, 180, 0.7);
  border-color: rgba(120, 100, 200, 0.15);
}
.light .nav-arrow:hover {
  background: linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,247,244,1));
  color: #6459A7;
  box-shadow: 0 8px 24px rgba(100, 80, 180, 0.12);
}
.light .shimmer-text {
  background: linear-gradient(90deg, #1e1b4b 0%, #6459A7 25%, #2a8a86 50%, #6459A7 75%, #1e1b4b 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.light .filter-btn {
  color: #64748b;
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(120, 100, 200, 0.12);
}
.light .filter-btn:hover {
  color: #1e1b4b;
  background: rgba(139, 127, 212, 0.06);
  border-color: rgba(120, 100, 200, 0.25);
}
.light .filter-btn.active {
  background: rgba(139, 127, 212, 0.1);
  border-color: rgba(139, 127, 212, 0.25);
  color: #1e1b4b;
}
.light .nav-arrow-btn {
  background: rgba(255, 255, 255, 0.85);
  color: rgba(100, 80, 180, 0.6);
  border-color: rgba(120, 100, 200, 0.12);
}
.light .nav-arrow-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.95);
  color: #6459A7;
}
.light .text-white {
  color: #1e1b4b !important;
}
.light .text-gray-200 {
  color: #334155 !important;
}
.light .text-gray-300 {
  color: #475569 !important;
}
.light .text-gray-400 {
  color: #64748b !important;
}
.light .text-gray-500 {
  color: #64748b !important;
}
.light .text-gray-600 {
  color: #475569 !important;
}
.light .text-gray-700 {
  color: #334155 !important;
}
.light .bg-white\/5 {
  background-color: rgba(120, 100, 200, 0.06) !important;
}
.light .bg-white\/3 {
  background-color: rgba(120, 100, 200, 0.04) !important;
}
.light .hover\:text-white:hover {
  color: #1e1b4b !important;
}
.light .hover\:bg-white\/5:hover {
  background-color: rgba(120, 100, 200, 0.08) !important;
}
.light .hover\:bg-white\/3:hover {
  background-color: rgba(120, 100, 200, 0.06) !important;
}
.light .group:hover .group-hover\:text-white {
  color: #1e1b4b !important;
}
.light .border-white\/5 {
  border-color: rgba(120, 100, 200, 0.1) !important;
}
.light .border-white\/3 {
  border-color: rgba(120, 100, 200, 0.06) !important;
}
.light [style*="rgba(255,255,255,0.03)"] {
  background: rgba(120, 100, 200, 0.04) !important;
}
.light [style*="rgba(255,255,255,0.04)"] {
  background: rgba(120, 100, 200, 0.05) !important;
}
.light [style*="rgba(255,255,255,0.05)"] {
  background: rgba(120, 100, 200, 0.06) !important;
}
.light .recharts-text {
  fill: #475569 !important;
}
.light .recharts-cartesian-grid-vertical line {
  stroke: rgba(120, 100, 200, 0.08) !important;
}
.light [style*="linear-gradient(135deg, rgba(255,255,255,0.04)"] {
  background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,247,244,0.9) 100%) !important;
  border-color: rgba(120, 100, 200, 0.1) !important;
  box-shadow: 0 2px 8px rgba(100, 80, 180, 0.05) !important;
}
.light [style*="rgba(120,100,200,0.1)"] {
  border-color: rgba(120, 100, 200, 0.15) !important;
}
.light .text-\[\#8B7FD4\] { color: #6459A7 !important; }
.light .text-\[\#4ECDC4\] { color: #2a8a86 !important; }
.light .text-\[\#FF4D6A\] { color: #DC3545 !important; }
.light .text-\[\#F0D060\] { color: #b8960a !important; }

/* ═══════════════════════════════════════════════════════════════════
   FLOATING TOOLBAR — High Contrast Mode & Print Styles
   ═══════════════════════════════════════════════════════════════════ */

/* High Contrast Mode */
.high-contrast {
  filter: contrast(1.35) saturate(1.2);
}
.high-contrast * {
  border-color: currentColor !important;
}

/* Print Styles — hide non-essential UI when printing */
@media print {
  /* Hide floating toolbar, sidebar, header, overlays */
  .floating-toolbar-root,
  nav,
  header,
  aside,
  .no-print,
  [data-floating-toolbar],
  [data-rasid-character],
  [data-cinematic-button],
  [data-guide-overlay] {
    display: none !important;
  }

  /* Ensure main content fills the page */
  main {
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    max-height: none !important;
  }

  /* Ensure backgrounds print */
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Remove shadows and animations for clean print */
  * {
     box-shadow: none !important;
    animation: none !important;
    transition: none !important;
  }
}

/* ═══════════════════════════════════════════════════
   LIGHT THEME FIX — Remove ALL blur/opacity + Premium 3D Cards
   ═══════════════════════════════════════════════════ */

/* ─── GLOBAL: Remove ALL backdrop-filter blur in light mode ─── */
.light *,
.light *::before,
.light *::after {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* ─── GLOBAL: Remove filter blur from pseudo-elements in light mode ─── */
.light .sidebar-aurora-bg::after,
.light .sidebar-aurora-bg .sidebar-orb-2 {
  filter: none !important;
  opacity: 0.3 !important;
}

/* ─── Header — solid white background in light mode ─── */
.light header,
.light [class*="backdrop-blur"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* ─── Sidebar — solid white background in light mode ─── */
.light aside,
.light .glass-sidebar {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* ─── Dropdowns & Popups — solid backgrounds in light mode ─── */
.light [style*="backdropFilter"],
.light [style*="backdrop-filter"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* ─── Cards — Remove blur, keep solid backgrounds ─── */
.light .glass-card,
.light [data-slot="card"],
.light .kpi-card,
.light[data-design-style="atlas"] .glass-card,
.light[data-design-style="atlas"] [data-slot="card"],
.light[data-design-style="atlas"] .kpi-card {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* ─── Modals & Overlays — clean backgrounds in light mode ─── */
.light [class*="bg-black\/"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* ─── ParticleField — reduce opacity in light mode ─── */
.light canvas {
  opacity: 0.2 !important;
}

/* ─── Premium 3D Glass Cards — Light Theme ─── */
.light .glass-card,
.light [data-slot="card"],
.light[data-design-style="atlas"] .glass-card,
.light[data-design-style="atlas"] [data-slot="card"] {
  background: linear-gradient(145deg, #ffffff 0%, #faf9f7 50%, #f5f3ef 100%) !important;
  border: 1px solid rgba(120, 100, 200, 0.15) !important;
  box-shadow:
    0 1px 2px rgba(100, 80, 180, 0.04),
    0 4px 12px rgba(100, 80, 180, 0.06),
    0 8px 24px rgba(100, 80, 180, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(120, 100, 200, 0.04) !important;
  border-radius: 1.25rem;
}

.light .glass-card:hover,
.light [data-slot="card"]:hover,
.light[data-design-style="atlas"] .glass-card:hover,
.light[data-design-style="atlas"] [data-slot="card"]:hover {
  border-color: rgba(100, 89, 167, 0.3) !important;
  transform: translateY(-3px);
  box-shadow:
    0 2px 4px rgba(100, 80, 180, 0.06),
    0 8px 24px rgba(100, 80, 180, 0.1),
    0 16px 48px rgba(100, 80, 180, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(120, 100, 200, 0.06) !important;
}

/* ─── Premium 3D KPI Cards — Light Theme ─── */
.light .kpi-card,
.light[data-design-style="atlas"] .kpi-card {
  background: linear-gradient(145deg, #ffffff 0%, #faf9f7 100%) !important;
  border: 1px solid rgba(120, 100, 200, 0.18) !important;
  box-shadow:
    0 2px 4px rgba(100, 80, 180, 0.05),
    0 6px 16px rgba(100, 80, 180, 0.07),
    0 12px 32px rgba(100, 80, 180, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -2px 0 rgba(120, 100, 200, 0.03) !important;
  border-radius: 1.25rem;
  position: relative;
  overflow: hidden;
}

.light .kpi-card:hover,
.light[data-design-style="atlas"] .kpi-card:hover {
  border-color: rgba(100, 89, 167, 0.35) !important;
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    0 4px 8px rgba(100, 80, 180, 0.08),
    0 12px 32px rgba(100, 80, 180, 0.12),
    0 20px 56px rgba(100, 80, 180, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 1),
    inset 0 -2px 0 rgba(120, 100, 200, 0.05) !important;
}

/* ─── Ensure all text is fully opaque and readable ─── */
.light .glass-card *,
.light [data-slot="card"] *,
.light .kpi-card *,
.light[data-design-style="atlas"] .glass-card *,
.light[data-design-style="atlas"] [data-slot="card"] *,
.light[data-design-style="atlas"] .kpi-card * {
  opacity: 1 !important;
}

/* ─── Fix text colors — strong contrast ─── */
.light .text-foreground,
.light[data-design-style="atlas"] .text-foreground {
  color: #1E1B4B !important;
}

/* ─── Premium badge styles — Light ─── */
.light .badge-high,
.light[data-design-style="atlas"] .badge-high {
  background: linear-gradient(135deg, #fef2f2, #fee2e2) !important;
  color: #991b1b !important;
  border: 1px solid rgba(220, 53, 69, 0.2) !important;
  box-shadow: 0 1px 3px rgba(220, 53, 69, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
}

.light .badge-medium,
.light[data-design-style="atlas"] .badge-medium {
  background: linear-gradient(135deg, #fffbeb, #fef3c7) !important;
  color: #92400e !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
  box-shadow: 0 1px 3px rgba(212, 175, 55, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
}

.light .badge-low,
.light[data-design-style="atlas"] .badge-low {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7) !important;
  color: #166534 !important;
  border: 1px solid rgba(34, 197, 94, 0.2) !important;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
}

/* ─── Premium filter buttons — Light ─── */
.light .filter-btn,
.light[data-design-style="atlas"] .filter-btn {
  background: linear-gradient(145deg, #ffffff, #f8f7f4) !important;
  border: 1px solid rgba(120, 100, 200, 0.12) !important;
  color: #4a4578 !important;
  box-shadow: 0 1px 3px rgba(100, 80, 180, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
}

.light .filter-btn:hover,
.light[data-design-style="atlas"] .filter-btn:hover {
  background: linear-gradient(145deg, #ffffff, #f0eef8) !important;
  border-color: rgba(100, 89, 167, 0.25) !important;
  box-shadow: 0 2px 8px rgba(100, 80, 180, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
}

.light .filter-btn.active,
.light[data-design-style="atlas"] .filter-btn.active {
  background: linear-gradient(145deg, #6459A7, #7b70c0) !important;
  border-color: rgba(100, 89, 167, 0.4) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(100, 89, 167, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
}

/* ─── Premium glow effects — Light (subtle but visible) ─── */
.light .glow-teal,
.light[data-design-style="atlas"] .glow-teal {
  box-shadow: 0 0 20px rgba(61, 177, 172, 0.15), 0 4px 12px rgba(100, 80, 180, 0.06) !important;
}

.light .glow-purple,
.light[data-design-style="atlas"] .glow-purple {
  box-shadow: 0 0 20px rgba(100, 89, 167, 0.15), 0 4px 12px rgba(100, 80, 180, 0.06) !important;
}

.light .glow-gold,
.light[data-design-style="atlas"] .glow-gold {
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.15), 0 4px 12px rgba(100, 80, 180, 0.06) !important;
}

.light .glow-crimson,
.light[data-design-style="atlas"] .glow-crimson {
  box-shadow: 0 0 20px rgba(220, 53, 69, 0.15), 0 4px 12px rgba(100, 80, 180, 0.06) !important;
}

/* ─── Premium KPI icon glow — Light ─── */
.light .kpi-icon,
.light[data-design-style="atlas"] .kpi-icon {
  filter: drop-shadow(0 2px 8px rgba(100, 89, 167, 0.2)) !important;
}

/* ─── Fix inline style overrides for light — solid backgrounds ─── */
.light [style*="rgba(255,255,255,0.03)"],
.light[data-design-style="atlas"] [style*="rgba(255,255,255,0.03)"] {
  background: rgba(120, 100, 200, 0.05) !important;
  border: 1px solid rgba(120, 100, 200, 0.08) !important;
}

.light [style*="rgba(255,255,255,0.04)"],
.light[data-design-style="atlas"] [style*="rgba(255,255,255,0.04)"] {
  background: rgba(120, 100, 200, 0.06) !important;
  border: 1px solid rgba(120, 100, 200, 0.08) !important;
}

.light [style*="rgba(255,255,255,0.05)"],
.light[data-design-style="atlas"] [style*="rgba(255,255,255,0.05)"] {
  background: rgba(120, 100, 200, 0.07) !important;
  border: 1px solid rgba(120, 100, 200, 0.1) !important;
}

.light [style*="linear-gradient(135deg, rgba(255,255,255,0.04)"],
.light[data-design-style="atlas"] [style*="linear-gradient(135deg, rgba(255,255,255,0.04)"] {
  background: linear-gradient(145deg, #ffffff 0%, #faf9f7 100%) !important;
  border: 1px solid rgba(120, 100, 200, 0.12) !important;
  box-shadow: 0 2px 8px rgba(100, 80, 180, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
}

/* ─── Recharts light mode — strong text ─── */
.light .recharts-text,
.light[data-design-style="atlas"] .recharts-text {
  fill: #4a4578 !important;
  font-weight: 500 !important;
}

.light .recharts-cartesian-grid line,
.light[data-design-style="atlas"] .recharts-cartesian-grid line {
  stroke: rgba(120, 100, 200, 0.08) !important;
}

/* ─── Scrollbar — Light Premium ─── */
.light ::-webkit-scrollbar-track,
.light[data-design-style="atlas"] ::-webkit-scrollbar-track {
  background: rgba(120, 100, 200, 0.04) !important;
}

.light ::-webkit-scrollbar-thumb,
.light[data-design-style="atlas"] ::-webkit-scrollbar-thumb {
  background: rgba(120, 100, 200, 0.15) !important;
  border-radius: 4px !important;
}

.light ::-webkit-scrollbar-thumb:hover,
.light[data-design-style="atlas"] ::-webkit-scrollbar-thumb:hover {
  background: rgba(120, 100, 200, 0.25) !important;
}

/* ─── Treemap tile — Light Premium ─── */
.light .treemap-tile:hover,
.light[data-design-style="atlas"] .treemap-tile:hover {
  box-shadow: 0 8px 24px rgba(100, 80, 180, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
}

/* ─── Nav arrows — Light Premium ─── */
.light .nav-arrow,
.light[data-design-style="atlas"] .nav-arrow {
  background: linear-gradient(145deg, #ffffff, #f8f7f4) !important;
  color: rgba(100, 80, 180, 0.7) !important;
  border: 1px solid rgba(120, 100, 200, 0.15) !important;
  box-shadow: 0 2px 8px rgba(100, 80, 180, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
}

.light .nav-arrow:hover,
.light[data-design-style="atlas"] .nav-arrow:hover {
  background: linear-gradient(145deg, #ffffff, #f0eef8) !important;
  color: #6459A7 !important;
  box-shadow: 0 4px 16px rgba(100, 80, 180, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
}

.light .nav-arrow-btn,
.light[data-design-style="atlas"] .nav-arrow-btn {
  background: linear-gradient(145deg, #ffffff, #faf9f7) !important;
  color: rgba(100, 80, 180, 0.6) !important;
  border: 1px solid rgba(120, 100, 200, 0.12) !important;
  box-shadow: 0 1px 4px rgba(100, 80, 180, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
}

.light .nav-arrow-btn:hover:not(:disabled),
.light[data-design-style="atlas"] .nav-arrow-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #ffffff, #f0eef8) !important;
  color: #6459A7 !important;
  box-shadow: 0 2px 8px rgba(100, 80, 180, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
}

/* ─── Shimmer text — Light ─── */
.light .shimmer-text,
.light[data-design-style="atlas"] .shimmer-text {
  background: linear-gradient(90deg, #6459A7 0%, #8B7FD4 40%, #6459A7 60%, #3DB1AC 80%, #6459A7 100%) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

/* ─── Connector line — Light ─── */
.light .connector-line,
.light[data-design-style="atlas"] .connector-line {
  background: rgba(120, 100, 200, 0.12) !important;
}

/* ─── Section headers — Light ─── */
.light .section-divider,
.light[data-design-style="atlas"] .section-divider {
  background: linear-gradient(90deg, transparent, rgba(100, 89, 167, 0.15), transparent) !important;
}

/* ─── Auto slider / autoplay ring — Light ─── */
.light .auto-slider,
.light[data-design-style="atlas"] .auto-slider {
  background: rgba(120, 100, 200, 0.04) !important;
}

.light .autoplay-ring,
.light[data-design-style="atlas"] .autoplay-ring {
  stroke: rgba(100, 89, 167, 0.3) !important;
}


/* ═══════════════════════════════════════════════════════════════
   LIGHT MODE FIX V2 — Fix invisible Tailwind utility classes
   bg-white/5, border-white/5, text-slate-300/400, text-muted-foreground/60
   These are designed for dark backgrounds and invisible on white
   ═══════════════════════════════════════════════════════════════ */

/* ─── bg-white/5 & bg-white/10 → visible light purple tint ─── */
.light [class*="bg-white/5"],
.light[data-design-style="atlas"] [class*="bg-white/5"] {
  background-color: rgba(120, 100, 200, 0.06) !important;
}

.light [class*="bg-white/10"],
.light[data-design-style="atlas"] [class*="bg-white/10"] {
  background-color: rgba(120, 100, 200, 0.08) !important;
}

/* ─── border-white/5 & border-white/10 → visible borders ─── */
.light [class*="border-white/5"],
.light[data-design-style="atlas"] [class*="border-white/5"] {
  border-color: rgba(120, 100, 200, 0.12) !important;
}

.light [class*="border-white/10"],
.light[data-design-style="atlas"] [class*="border-white/10"] {
  border-color: rgba(120, 100, 200, 0.15) !important;
}

/* ─── text-muted-foreground/60 → readable dark gray ─── */
.light [class*="text-muted-foreground/6"],
.light[data-design-style="atlas"] [class*="text-muted-foreground/6"] {
  color: #64748b !important;
}

.light [class*="text-muted-foreground/5"],
.light[data-design-style="atlas"] [class*="text-muted-foreground/5"] {
  color: #64748b !important;
}

.light [class*="text-muted-foreground/4"],
.light[data-design-style="atlas"] [class*="text-muted-foreground/4"] {
  color: #78716c !important;
}

.light [class*="text-muted-foreground/3"],
.light[data-design-style="atlas"] [class*="text-muted-foreground/3"] {
  color: #94a3b8 !important;
}

.light [class*="text-muted-foreground/7"],
.light[data-design-style="atlas"] [class*="text-muted-foreground/7"] {
  color: #475569 !important;
}

/* ─── text-slate-300/400 → dark enough for light backgrounds ─── */
.light .text-slate-300,
.light[data-design-style="atlas"] .text-slate-300 {
  color: #475569 !important;
}

.light .text-slate-400,
.light[data-design-style="atlas"] .text-slate-400 {
  color: #475569 !important;
}

/* ─── text-primary/40 → readable on light ─── */
.light [class*="text-primary/4"],
.light[data-design-style="atlas"] [class*="text-primary/4"] {
  color: rgba(100, 89, 167, 0.6) !important;
}

/* ─── text-white → dark text in light mode (for elements designed for dark bg) ─── */
.light .glass-card .text-white,
.light [data-slot="card"] .text-white,
.light[data-design-style="atlas"] .glass-card .text-white,
.light[data-design-style="atlas"] [data-slot="card"] .text-white {
  color: #1e1b4b !important;
}

/* ─── Make muted-foreground darker in light mode globally ─── */
.light .text-muted-foreground,
.light[data-design-style="atlas"] .text-muted-foreground {
  color: #374151 !important;
}

/* ─── bg-primary/10 and bg-primary/15 → more visible on light ─── */
.light [class*="bg-primary/1"],
.light[data-design-style="atlas"] [class*="bg-primary/1"] {
  background-color: rgba(100, 89, 167, 0.12) !important;
}

/* ─── Progress bars bg-white/5 → visible track ─── */
.light .overflow-hidden[class*="bg-white/5"],
.light[data-design-style="atlas"] .overflow-hidden[class*="bg-white/5"] {
  background-color: rgba(120, 100, 200, 0.1) !important;
}

/* ─── Divider lines bg-white/10 → visible ─── */
.light .bg-white\/10,
.light[data-design-style="atlas"] .bg-white\/10 {
  background-color: rgba(120, 100, 200, 0.12) !important;
}

/* ─── Fix hover states in light mode ─── */
.light [class*="hover\:bg-white\/10"]:hover,
.light[data-design-style="atlas"] [class*="hover\:bg-white\/10"]:hover {
  background-color: rgba(120, 100, 200, 0.1) !important;
}

.light [class*="hover\:bg-white\/5"]:hover,
.light[data-design-style="atlas"] [class*="hover\:bg-white\/5"]:hover {
  background-color: rgba(120, 100, 200, 0.08) !important;
}

/* ─── hover:text-white → dark text in light mode ─── */
.light .glass-card [class*="hover\:text-white"]:hover,
.light [data-slot="card"] [class*="hover\:text-white"]:hover {
  color: #1e1b4b !important;
}

/* ─── Fix gradient overlays with opacity-50 on cards ─── */
.light .glass-card [class*="opacity-50"][class*="bg-gradient"],
.light [data-slot="card"] [class*="opacity-50"][class*="bg-gradient"],
.light .glass-card [class*="opacity-40"][class*="bg-gradient"],
.light [data-slot="card"] [class*="opacity-40"][class*="bg-gradient"] {
  opacity: 0.15 !important;
}

/* ─── Fix emerald/blue/amber/violet-400 text → darker in light ─── */
.light .text-emerald-400 { color: #059669 !important; }
.light .text-blue-400 { color: #2563eb !important; }
.light .text-amber-400 { color: #d97706 !important; }
.light .text-violet-400 { color: #7c3aed !important; }
.light .text-red-400 { color: #dc2626 !important; }
.light .text-sky-400 { color: #0284c7 !important; }
.light .text-cyan-400 { color: #0891b2 !important; }

/* ─── Fix -400 icon colors to be visible in light mode ─── */
.light .text-emerald-400 svg,
.light .text-blue-400 svg,
.light .text-amber-400 svg,
.light .text-violet-400 svg {
  filter: brightness(0.85) !important;
}

/* ─── Ensure all card content text is dark and readable ─── */
.light .glass-card p,
.light .glass-card span,
.light .glass-card h1,
.light .glass-card h2,
.light .glass-card h3,
.light .glass-card h4,
.light [data-slot="card"] p,
.light [data-slot="card"] span,
.light [data-slot="card"] h1,
.light [data-slot="card"] h2,
.light [data-slot="card"] h3,
.light [data-slot="card"] h4 {
  opacity: 1 !important;
}

```

---

## `client/src/main.tsx`

```tsx
import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Redirect to built-in login page
  window.location.href = "/login";
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        // Remove trpc-accept: application/jsonl header to disable streaming
        // Streaming breaks cookie setting during login (Cannot set headers after they are sent)
        const headers = new Headers(init?.headers);
        headers.delete("trpc-accept");
        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

```

---

## `client/src/privacy/pages/BatchScanning.tsx`

```tsx
/**
 * BatchScanning — الفحص المجمع
 * رفع ملف CSV أو إدخال نطاقات متعددة للفحص المجمع
 */
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Layers, Loader2, Upload, Plus, Play, CheckCircle,
  XCircle, Clock, Pause, Globe, FileText, Trash2,
  ChevronLeft, ChevronRight, BarChart3, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const jobStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "في الانتظار", color: "text-gray-400 bg-gray-500/10 border-gray-500/30", icon: Clock },
  running: { label: "قيد التنفيذ", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: Play },
  completed: { label: "مكتمل", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
  failed: { label: "فشل", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: XCircle },
  paused: { label: "متوقف مؤقتاً", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: Pause },
};

export default function BatchScanning() {
  const [domainsText, setDomainsText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("new");

  const { data, isLoading } = trpc.batchScan.jobs.useQuery({ page: 1, limit: 50 });

  const jobs = Array.isArray(data) ? data : (data?.jobs ?? []);
  const runningJobs = jobs.filter((j: any) => j.status === "running");
  const completedJobs = jobs.filter((j: any) => j.status === "completed");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      /* Read CSV and populate domains */
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) {
          const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
          setDomainsText(lines.join("\n"));
        }
      };
      reader.readAsText(file);
    }
  };

  const domainsList = domainsText
    .split("\n")
    .map(d => d.trim())
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل عمليات الفحص...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Layers className="w-7 h-7 text-primary" />
          الفحص المجمع
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          فحص عدة مواقع دفعة واحدة عبر رفع ملف أو إدخال النطاقات
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new" className="gap-1.5">
            <Plus className="w-4 h-4" />
            فحص جديد
          </TabsTrigger>
          <TabsTrigger value="running" className="gap-1.5">
            <Play className="w-4 h-4" />
            قيد التنفيذ ({runningJobs.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="w-4 h-4" />
            السجل
          </TabsTrigger>
        </TabsList>

        {/* New batch scan */}
        <TabsContent value="new">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domain input */}
            <Card className="bg-card backdrop-blur-xl border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-base flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  إدخال النطاقات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <textarea
                    placeholder={"أدخل نطاقاً واحداً في كل سطر:\nexample.com\nexample.org\nexample.sa"}
                    value={domainsText}
                    onChange={(e) => setDomainsText(e.target.value)}
                    className="w-full h-48 px-3 py-2 text-sm bg-secondary/50 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground font-mono"
                    dir="ltr"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {domainsList.length} نطاق
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => { setDomainsText(""); setUploadedFile(null); }}
                    >
                      مسح الكل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CSV upload + submit */}
            <div className="space-y-6">
              <Card className="bg-card backdrop-blur-xl border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    رفع ملف CSV
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-40" />
                    <p className="text-sm text-muted-foreground">
                      اسحب الملف هنا أو اضغط للاختيار
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSV أو TXT — نطاق واحد في كل سطر
                    </p>
                    {uploadedFile && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm text-primary">{uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit button */}
              <Card className="bg-card backdrop-blur-xl border-border">
                <CardContent className="p-4">
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    disabled={domainsList.length === 0}
                  >
                    <Play className="w-5 h-5" />
                    بدء الفحص المجمع ({domainsList.length} نطاق)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Running Jobs */}
        <TabsContent value="running">
          {runningJobs.length > 0 ? (
            <div className="space-y-4">
              {runningJobs.map((job: any, index: number) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-card backdrop-blur-xl border-border border-blue-500/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          <span className="font-medium text-foreground">{job.name || `فحص مجمع #${job.id}`}</span>
                        </div>
                        <Badge className="text-xs border text-blue-400 bg-blue-500/10 border-blue-500/30">
                          قيد التنفيذ
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{job.completedCount ?? 0} / {job.totalCount ?? 0} نطاق</span>
                          <span>{Math.round(((job.completedCount ?? 0) / Math.max(job.totalCount ?? 1, 1)) * 100)}%</span>
                        </div>
                        <Progress
                          value={((job.completedCount ?? 0) / Math.max(job.totalCount ?? 1, 1)) * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          بدأ: {new Date(job.startedAt).toLocaleTimeString("ar-SA")}
                        </span>
                        {job.estimatedEndAt && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            الانتهاء المتوقع: {new Date(job.estimatedEndAt).toLocaleTimeString("ar-SA")}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-card backdrop-blur-xl border-border">
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Play className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">لا توجد عمليات فحص قيد التنفيذ</p>
                  <p className="text-xs mt-1">ابدأ فحصاً مجمعاً جديداً من تبويب "فحص جديد"</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card className="bg-card backdrop-blur-xl border-border">
            <CardContent className="p-0">
              {jobs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المعرف</TableHead>
                      <TableHead className="text-right">عدد النطاقات</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">التقدم</TableHead>
                      <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right">المدة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job: any) => {
                      const sc = jobStatusConfig[job.status] ?? jobStatusConfig.pending;
                      const StatusIcon = sc.icon;
                      const progress = ((job.completedCount ?? 0) / Math.max(job.totalCount ?? 1, 1)) * 100;
                      return (
                        <TableRow key={job.id} className="hover:bg-secondary/30">
                          <TableCell className="font-mono text-xs text-foreground">
                            #{job.id}
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {job.totalCount ?? 0}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs border ${sc.color} gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {sc.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <Progress value={progress} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(job.createdAt).toLocaleDateString("ar-SA")}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {job.duration ? `${job.duration}ث` : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Layers className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">لا توجد عمليات فحص سابقة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

```

---

## `client/src/privacy/pages/ComplianceAlerts.tsx`

```tsx
/**
 * ComplianceAlerts — تنبيهات التغيير
 * مراقبة التغييرات في حالة امتثال المواقع
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bell, Loader2, AlertTriangle, Activity, CheckCircle,
  XCircle, ChevronLeft, ChevronRight, Globe, Clock,
  Eye, BellOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

const impactConfig: Record<string, { label: string; color: string }> = {
  high: { label: "مرتفع", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  medium: { label: "متوسط", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  low: { label: "منخفض", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
};

const PAGE_SIZE = 20;

export default function ComplianceAlerts() {
  const [impactFilter, setImpactFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.alerts.list.useQuery({
    page,
    limit: PAGE_SIZE,
  });

  const alerts = data?.alerts ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const kpis = useMemo(() => {
    if (!data?.stats) return null;
    const stats = data.stats as { totalThisMonth: number; critical: number; resolved: number };
    return [
      {
        label: "تنبيهات هذا الشهر",
        value: stats.totalThisMonth ?? 0,
        icon: Bell,
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
      },
      {
        label: "تغييرات حرجة",
        value: stats.critical ?? 0,
        icon: AlertTriangle,
        color: "text-red-400",
        borderColor: "border-red-500/20",
        bgColor: "bg-red-500/5",
      },
      {
        label: "تم الحل",
        value: stats.resolved ?? 0,
        icon: CheckCircle,
        color: "text-emerald-400",
        borderColor: "border-emerald-500/20",
        bgColor: "bg-emerald-500/5",
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل التنبيهات...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary" />
            تنبيهات التغيير
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مراقبة التغييرات في حالة امتثال المواقع والتنبيهات الفورية
          </p>
        </div>
        <Badge variant="outline" className="text-sm gap-1.5">
          <Activity className="w-4 h-4" />
          {totalCount} تنبيه
        </Badge>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border ${kpi.borderColor} ${kpi.bgColor} hover:scale-[1.02] transition-all duration-300 bg-card backdrop-blur-xl group relative overflow-hidden`}>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${kpi.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filter */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Select value={impactFilter} onValueChange={(v) => { setImpactFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px] bg-secondary/50 border-border">
                <SelectValue placeholder="التأثير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="high">مرتفع</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
              </SelectContent>
            </Select>
            {impactFilter !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setImpactFilter("all"); setPage(1); }}
                className="text-xs"
              >
                مسح الفلاتر
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-0">
          {alerts.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">النطاق</TableHead>
                    <TableHead className="text-right">التغيير</TableHead>
                    <TableHead className="text-right">التأثير</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert: any) => {
                    const impact = impactConfig[alert.impact] ?? impactConfig.medium;
                    return (
                      <TableRow key={alert.id} className="hover:bg-secondary/30 cursor-pointer">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-foreground">{alert.domain}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="text-sm text-foreground truncate">{alert.change}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${impact.color}`}>
                            {impact.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.createdAt).toLocaleDateString("ar-SA")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            <Eye className="w-3 h-3" />
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <BellOff className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد تنبيهات</p>
              <p className="text-xs mt-1">لم يتم رصد أي تغييرات في حالة الامتثال</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/ComplianceClauses.tsx`

```tsx
/**
 * ComplianceClauses — تفاصيل بنود نظام حماية البيانات الشخصية الثمانية
 * بطاقة لكل بند مع نسب الامتثال التفصيلية
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Loader2, CheckCircle, AlertTriangle, XCircle,
  Eye, FileText, Lock, Share2, Clock, Cookie, RefreshCw,
  Target, Users, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

/* ═══ The 8 PDPL Clauses ═══ */
interface ClauseInfo {
  id: number;
  nameAr: string;
  descriptionAr: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
}

const clauses: ClauseInfo[] = [
  {
    id: 1,
    nameAr: "الشفافية",
    descriptionAr: "يجب على الجهات الإفصاح بوضوح عن ممارسات جمع ومعالجة البيانات الشخصية",
    icon: Eye,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: 2,
    nameAr: "الغرض من الجمع",
    descriptionAr: "تحديد الأغراض المشروعة لجمع البيانات الشخصية والالتزام بها",
    icon: Target,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
  },
  {
    id: 3,
    nameAr: "مشاركة البيانات",
    descriptionAr: "ضوابط مشاركة البيانات الشخصية مع أطراف ثالثة والإفصاح عنها",
    icon: Share2,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    id: 4,
    nameAr: "أمن البيانات",
    descriptionAr: "تطبيق التدابير الأمنية والتقنية اللازمة لحماية البيانات الشخصية",
    icon: Lock,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    id: 5,
    nameAr: "حقوق صاحب البيانات",
    descriptionAr: "تمكين أصحاب البيانات من ممارسة حقوقهم في الوصول والتصحيح والحذف",
    icon: Users,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  {
    id: 6,
    nameAr: "فترة الاحتفاظ",
    descriptionAr: "تحديد فترات الاحتفاظ بالبيانات الشخصية وآليات الحذف بعد انتهاء الغرض",
    icon: Clock,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  {
    id: 7,
    nameAr: "ملفات تعريف الارتباط",
    descriptionAr: "الإفصاح عن استخدام ملفات تعريف الارتباط وتقنيات التتبع وإدارة الموافقة",
    icon: Cookie,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  {
    id: 8,
    nameAr: "تحديثات السياسة",
    descriptionAr: "آلية إشعار المستخدمين بالتغييرات على سياسة الخصوصية وتاريخ آخر تحديث",
    icon: RefreshCw,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
  },
];

/* ═══ Clause Card ═══ */
function ClauseCard({ clause, stats }: { clause: ClauseInfo; stats?: any }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = clause.icon;
  const compliantPct = stats?.compliantPct ?? 0;
  const partialPct = stats?.partialPct ?? 0;
  const nonCompliantPct = stats?.nonCompliantPct ?? 0;
  const totalSites = stats?.totalSites ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: clause.id * 0.05 }}
    >
      <Card className={`border ${clause.borderColor} ${clause.bgColor} bg-card backdrop-blur-xl hover:shadow-lg transition-all duration-300 group`}>
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${clause.bgColor} border ${clause.borderColor}`}>
                <Icon className={`w-5 h-5 ${clause.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span className={`text-xs font-mono ${clause.color}`}>#{clause.id}</span>
                  {clause.nameAr}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">{clause.descriptionAr}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {totalSites} موقع
            </Badge>
          </div>

          {/* Compliance percentages */}
          <div className="space-y-3">
            {/* Stacked bar */}
            <div className="flex h-4 rounded-full overflow-hidden bg-secondary/50">
              <motion.div
                className="bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${compliantPct}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <motion.div
                className="bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${partialPct}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
              <motion.div
                className="bg-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${nonCompliantPct}%` }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
            </div>

            {/* Labels */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">ممتثل</p>
                  <p className="text-sm font-bold text-emerald-400">{compliantPct}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">جزئي</p>
                  <p className="text-sm font-bold text-amber-400">{partialPct}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-lg p-2">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">غير ممتثل</p>
                  <p className="text-sm font-bold text-red-400">{nonCompliantPct}%</p>
                </div>
              </div>
            </div>

            {/* Common issues (expandable) */}
            {stats?.commonIssues && stats.commonIssues.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs w-full justify-between"
                  onClick={() => setExpanded(!expanded)}
                >
                  <span>أبرز المشكلات</span>
                  <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
                </Button>
                {expanded && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1 mt-2 px-2"
                  >
                    {stats.commonIssues.map((issue: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>
                        {issue}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ComplianceClauses() {
  const { data: clauseDetails, isLoading } = trpc.dashboard.clauseStats.useQuery();

  /* Map API data to clause stats */
  const clauseStatsMap = new Map<number, any>();
  if (clauseDetails && Array.isArray(clauseDetails)) {
    clauseDetails.forEach((d: any) => {
      clauseStatsMap.set(d.clauseId, d);
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل بيانات البنود...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          بنود نظام حماية البيانات الشخصية
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          تفاصيل الامتثال للبنود الثمانية الرئيسية لنظام حماية البيانات الشخصية (PDPL)
        </p>
      </div>

      {/* Overall summary */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-muted-foreground">ممتثل</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-muted-foreground">جزئي</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500" />
                <span className="text-muted-foreground">غير ممتثل</span>
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              <BarChart3 className="w-3 h-3 ml-1" />
              8 بنود رئيسية
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Clause Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clauses.map((clause) => (
          <ClauseCard
            key={clause.id}
            clause={clause}
            stats={clauseStatsMap.get(clause.id)}
          />
        ))}
      </div>
    </div>
  );
}

```

---

## `client/src/privacy/pages/ComplianceLetters.tsx`

```tsx
/**
 * ComplianceLetters — رسائل الامتثال
 * إدارة رسائل الامتثال المرسلة للمواقع غير الممتثلة
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Mail, Loader2, Send, FileText, Clock, CheckCircle,
  Plus, Eye, Search, ChevronLeft, ChevronRight,
  Building2, AlertTriangle, Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

const letterStatusConfig: Record<string, { label: string; color: string; icon: typeof Send }> = {
  sent: { label: "مُرسل", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: Send },
  read: { label: "مقروء", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: Eye },
  responded: { label: "تم الرد", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
  pending: { label: "معلّق", color: "text-gray-400 bg-gray-500/10 border-gray-500/30", icon: Clock },
};

const letterTypeConfig: Record<string, string> = {
  first_notice: "إشعار أول",
  reminder: "تذكير",
  warning: "تحذير",
  final_notice: "إشعار نهائي",
};

const PAGE_SIZE = 20;

export default function ComplianceLetters() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.letters.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const letters = data?.letters ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const kpis = useMemo(() => {
    if (!data?.stats) return null;
    const stats = data.stats as { total: number; responseRate: number; pending: number };
    return [
      {
        label: "إجمالي الرسائل",
        value: stats.total ?? 0,
        icon: Mail,
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
      },
      {
        label: "نسبة الاستجابة",
        value: `${stats.responseRate ?? 0}%`,
        icon: Send,
        color: "text-emerald-400",
        borderColor: "border-emerald-500/20",
        bgColor: "bg-emerald-500/5",
      },
      {
        label: "ردود معلّقة",
        value: stats.pending ?? 0,
        icon: FileText,
        color: "text-amber-400",
        borderColor: "border-amber-500/20",
        bgColor: "bg-amber-500/5",
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل رسائل الامتثال...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="w-7 h-7 text-primary" />
            رسائل الامتثال
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة رسائل الامتثال المرسلة للمواقع غير الممتثلة ومتابعة الردود
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إنشاء رسالة
        </Button>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border ${kpi.borderColor} ${kpi.bgColor} hover:scale-[1.02] transition-all duration-300 bg-card backdrop-blur-xl group relative overflow-hidden`}>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${kpi.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالمستلم أو النطاق..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="pr-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="sent">مُرسل</SelectItem>
                <SelectItem value="read">مقروء</SelectItem>
                <SelectItem value="responded">تم الرد</SelectItem>
                <SelectItem value="pending">معلّق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Letters Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-0">
          {letters.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المستلم</TableHead>
                    <TableHead className="text-right">النطاق</TableHead>
                    <TableHead className="text-right">نوع الرسالة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ الإرسال</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {letters.map((letter: any) => {
                    const sc = letterStatusConfig[letter.status] ?? letterStatusConfig.pending;
                    const StatusIcon = sc.icon;
                    return (
                      <TableRow key={letter.id} className="hover:bg-secondary/30 cursor-pointer">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-foreground">{letter.recipient}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{letter.domain}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {letterTypeConfig[letter.type] ?? letter.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${sc.color} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {letter.sentAt ? new Date(letter.sentAt).toLocaleDateString("ar-SA") : "—"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            <Eye className="w-3 h-3" />
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Inbox className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد رسائل امتثال</p>
              <p className="text-xs mt-1">أنشئ رسالة جديدة للبدء في مخاطبة المواقع غير الممتثلة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/ComplianceTrends.tsx`

```tsx
/**
 * ComplianceTrends — اتجاهات الامتثال عبر الزمن
 * رسوم بيانية لتطور نسب الامتثال شهرياً
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Loader2, BarChart3, Calendar, Shield,
  ArrowUp, ArrowDown, Minus, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const clauseLabels: Record<number, string> = {
  1: "الشفافية",
  2: "الغرض من الجمع",
  3: "مشاركة البيانات",
  4: "أمن البيانات",
  5: "حقوق صاحب البيانات",
  6: "فترة الاحتفاظ",
  7: "ملفات تعريف الارتباط",
  8: "تحديثات السياسة",
};

const clauseColors: string[] = [
  "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981",
  "#ef4444", "#06b6d4", "#f97316", "#ec4899",
];

/* SVG line chart */
function LineChart({
  series,
  labels,
  height = 200,
}: {
  series: { name: string; data: number[]; color: string }[];
  labels: string[];
  height?: number;
}) {
  if (!series.length || !series[0].data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-muted-foreground">لا توجد بيانات</p>
      </div>
    );
  }

  const allValues = series.flatMap(s => s.data);
  const max = Math.max(...allValues, 100);
  const min = Math.min(...allValues, 0);
  const range = max - min || 1;
  const w = 600;
  const padding = 40;
  const chartW = w - padding * 2;
  const chartH = height - 40;

  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => {
          const y = chartH - ((v - min) / range) * chartH + 20;
          return (
            <g key={v}>
              <line x1={padding} y1={y} x2={w - padding} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={padding - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize={10}>{v}%</text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {labels.map((label, i) => {
          const x = padding + (i / Math.max(labels.length - 1, 1)) * chartW;
          return (
            <text key={i} x={x} y={height - 5} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>{label}</text>
          );
        })}

        {/* Lines */}
        {series.map(s => {
          const points = s.data.map((v, i) => ({
            x: padding + (i / Math.max(s.data.length - 1, 1)) * chartW,
            y: chartH - ((v - min) / range) * chartH + 20,
          }));
          const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
          const areaD = `${pathD} L ${points[points.length - 1].x} ${chartH + 20} L ${points[0].x} ${chartH + 20} Z`;

          return (
            <g key={s.name}>
              <defs>
                <linearGradient id={`area-${s.color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d={areaD} fill={`url(#area-${s.color.replace("#", "")})`} />
              <path d={pathD} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3} fill={s.color} stroke="var(--background)" strokeWidth={1.5} />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ComplianceTrends() {
  const [period, setPeriod] = useState("6m");
  const [activeTab, setActiveTab] = useState("overall");

  const months = period === "3m" ? 3 : period === "6m" ? 6 : 12;
  const { data, isLoading } = trpc.analytics.monthlyTrends.useQuery({
    months,
  });

  const overallTrend = useMemo(() => {
    if (!data?.overall) return { labels: [] as string[], data: [] as number[] };
    return data.overall as { labels: string[]; data: number[] };
  }, [data]);

  const clauseTrends = useMemo(() => {
    if (!data?.byClauses) return [];
    return data.byClauses as Array<{ clauseId: number; labels: string[]; data: number[] }>;
  }, [data]);

  const summaryStats = useMemo(() => {
    if (!data?.summary) return null;
    return data.summary as {
      currentScore: number;
      previousScore: number;
      change: number;
      bestClause: number;
      worstClause: number;
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل بيانات الاتجاهات...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary" />
            اتجاهات الامتثال
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            تتبع تطور نسب الامتثال عبر الزمن
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 أشهر</SelectItem>
            <SelectItem value="6m">6 أشهر</SelectItem>
            <SelectItem value="1y">سنة</SelectItem>
            <SelectItem value="all">الكل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      {summaryStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">النتيجة الحالية</p>
                <p className={`text-2xl font-bold mt-1 ${summaryStats.currentScore >= 80 ? "text-emerald-400" : summaryStats.currentScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                  {summaryStats.currentScore}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">التغيير</p>
                <div className="flex items-center gap-1 mt-1">
                  {summaryStats.change > 0 ? (
                    <ArrowUp className="w-4 h-4 text-emerald-400" />
                  ) : summaryStats.change < 0 ? (
                    <ArrowDown className="w-4 h-4 text-red-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-2xl font-bold ${summaryStats.change > 0 ? "text-emerald-400" : summaryStats.change < 0 ? "text-red-400" : "text-gray-400"}`}>
                    {summaryStats.change > 0 ? "+" : ""}{summaryStats.change}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">أفضل بند</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">
                  {clauseLabels[summaryStats.bestClause] || `بند ${summaryStats.bestClause}`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">أضعف بند</p>
                <p className="text-sm font-bold text-red-400 mt-1">
                  {clauseLabels[summaryStats.worstClause] || `بند ${summaryStats.worstClause}`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overall" className="gap-1.5">
            <TrendingUp className="w-4 h-4" />
            الامتثال الكلي
          </TabsTrigger>
          <TabsTrigger value="clauses" className="gap-1.5">
            <Shield className="w-4 h-4" />
            حسب البند
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <Card className="bg-card backdrop-blur-xl border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                اتجاه الامتثال الكلي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                series={[
                  { name: "الامتثال", data: overallTrend.data, color: "#10b981" },
                ]}
                labels={overallTrend.labels}
                height={250}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clauses">
          <Card className="bg-card backdrop-blur-xl border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                اتجاه الامتثال حسب البند
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clauseTrends.length > 0 ? (
                <>
                  <LineChart
                    series={clauseTrends.map((ct, i) => ({
                      name: clauseLabels[ct.clauseId] || `بند ${ct.clauseId}`,
                      data: ct.data,
                      color: clauseColors[i % clauseColors.length],
                    }))}
                    labels={clauseTrends[0]?.labels ?? []}
                    height={300}
                  />
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    {clauseTrends.map((ct, i) => (
                      <span key={ct.clauseId} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-3 h-3 rounded" style={{ backgroundColor: clauseColors[i % clauseColors.length] }} />
                        {clauseLabels[ct.clauseId] || `بند ${ct.clauseId}`}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">لا توجد بيانات تفصيلية حسب البند</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

```

---

## `client/src/privacy/pages/ConsentManagement.tsx`

```tsx
/**
 * ConsentManagement — إدارة الموافقات
 * إدارة ومتابعة سجلات الموافقة على معالجة البيانات الشخصية
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare, Loader2, Shield, UserCheck, Plus,
  Eye, Search, ChevronLeft, ChevronRight,
  CheckCircle, AlertTriangle, XCircle, Globe, Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

const consentStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: "مفعّل", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
  partial: { label: "جزئي", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: AlertTriangle },
  inactive: { label: "غير مفعّل", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: XCircle },
  expired: { label: "منتهي", color: "text-gray-400 bg-gray-500/10 border-gray-500/30", icon: XCircle },
};

const consentTypeLabels: Record<string, string> = {
  cookies: "ملفات تعريف الارتباط",
  marketing: "تسويق",
  analytics: "تحليلات",
  third_party: "أطراف ثالثة",
  data_processing: "معالجة البيانات",
  profiling: "التنميط",
};

const PAGE_SIZE = 20;

export default function ConsentManagement() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.privacy.consent.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const records = data?.records ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const kpis = useMemo(() => {
    if (!data?.stats) return null;
    const stats = data.stats as { total: number; active: number; notImplemented: number };
    return [
      {
        label: "إجمالي السجلات",
        value: stats.total ?? 0,
        icon: CheckSquare,
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
      },
      {
        label: "موافقات فعّالة",
        value: stats.active ?? 0,
        icon: Shield,
        color: "text-emerald-400",
        borderColor: "border-emerald-500/20",
        bgColor: "bg-emerald-500/5",
      },
      {
        label: "غير مطبّقة",
        value: stats.notImplemented ?? 0,
        icon: UserCheck,
        color: "text-red-400",
        borderColor: "border-red-500/20",
        bgColor: "bg-red-500/5",
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل سجلات الموافقات...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-primary" />
            إدارة الموافقات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة ومتابعة سجلات الموافقة على معالجة البيانات الشخصية
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة سجل
        </Button>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border ${kpi.borderColor} ${kpi.bgColor} hover:scale-[1.02] transition-all duration-300 bg-card backdrop-blur-xl group relative overflow-hidden`}>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${kpi.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالموقع..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="pr-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">مفعّل</SelectItem>
                <SelectItem value="partial">جزئي</SelectItem>
                <SelectItem value="inactive">غير مفعّل</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Consent Records Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-0">
          {records.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموقع</TableHead>
                    <TableHead className="text-right">نوع الموافقة</TableHead>
                    <TableHead className="text-right">حالة التفعيل</TableHead>
                    <TableHead className="text-right">آخر تحديث</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record: any) => {
                    const sc = consentStatusConfig[record.status] ?? consentStatusConfig.inactive;
                    const StatusIcon = sc.icon;
                    return (
                      <TableRow key={record.id} className="hover:bg-secondary/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{record.domain}</p>
                              {record.siteName && (
                                <p className="text-xs text-muted-foreground">{record.siteName}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {consentTypeLabels[record.consentType] ?? record.consentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${sc.color} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.updatedAt
                            ? new Date(record.updatedAt).toLocaleDateString("ar-SA")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="gap-1 text-xs">
                              <Eye className="w-3 h-3" />
                              عرض
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1 text-xs">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CheckSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد سجلات موافقات</p>
              <p className="text-xs mt-1">أضف سجل موافقة جديد لبدء إدارة الموافقات</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/DSARRequests.tsx`

```tsx
/**
 * DSARRequests — طلبات DSAR
 * إدارة طلبات الوصول لبيانات أصحاب البيانات
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  UserCheck, Loader2, FileQuestion, Clock, Plus,
  Eye, Search, ChevronLeft, ChevronRight,
  CheckCircle, AlertTriangle, XCircle, Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

const requestStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "معلّق", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: Clock },
  in_progress: { label: "قيد المعالجة", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: FileQuestion },
  completed: { label: "مكتمل", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
  overdue: { label: "متأخر", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: AlertTriangle },
  rejected: { label: "مرفوض", color: "text-gray-400 bg-gray-500/10 border-gray-500/30", icon: XCircle },
};

const requestTypeLabels: Record<string, string> = {
  access: "طلب وصول",
  deletion: "طلب حذف",
  correction: "طلب تصحيح",
  portability: "طلب نقل",
  objection: "طلب اعتراض",
};

const PAGE_SIZE = 20;

export default function DSARRequests() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.privacy.dsar.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    requestType: typeFilter !== "all" ? typeFilter : undefined,
    search: searchQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const requests = data?.requests ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const kpis = useMemo(() => {
    if (!data?.stats) return null;
    const stats = data.stats as { total: number; pending: number; overdue: number; completed: number };
    return [
      {
        label: "إجمالي الطلبات",
        value: stats.total ?? 0,
        icon: UserCheck,
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
      },
      {
        label: "طلبات معلّقة",
        value: stats.pending ?? 0,
        icon: Clock,
        color: "text-amber-400",
        borderColor: "border-amber-500/20",
        bgColor: "bg-amber-500/5",
      },
      {
        label: "طلبات متأخرة",
        value: stats.overdue ?? 0,
        icon: AlertTriangle,
        color: "text-red-400",
        borderColor: "border-red-500/20",
        bgColor: "bg-red-500/5",
      },
      {
        label: "طلبات مكتملة",
        value: stats.completed ?? 0,
        icon: CheckCircle,
        color: "text-emerald-400",
        borderColor: "border-emerald-500/20",
        bgColor: "bg-emerald-500/5",
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل طلبات DSAR...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-primary" />
            طلبات DSAR
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة طلبات الوصول لبيانات أصحاب البيانات الشخصية ومتابعة حالتها
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          طلب جديد
        </Button>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border ${kpi.borderColor} ${kpi.bgColor} hover:scale-[1.02] transition-all duration-300 bg-card backdrop-blur-xl group relative overflow-hidden`}>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${kpi.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو رقم الطلب..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="pr-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلّق</SelectItem>
                <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="overdue">متأخر</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="نوع الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="access">طلب وصول</SelectItem>
                <SelectItem value="deletion">طلب حذف</SelectItem>
                <SelectItem value="correction">طلب تصحيح</SelectItem>
                <SelectItem value="portability">طلب نقل</SelectItem>
                <SelectItem value="objection">طلب اعتراض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-0">
          {requests.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">مقدم الطلب</TableHead>
                    <TableHead className="text-right">نوع الطلب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ الطلب</TableHead>
                    <TableHead className="text-right">الموعد النهائي</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req: any) => {
                    const sc = requestStatusConfig[req.status] ?? requestStatusConfig.pending;
                    const StatusIcon = sc.icon;
                    const isOverdue = req.deadline && new Date(req.deadline) < new Date() && req.status !== "completed";
                    return (
                      <TableRow key={req.id} className="hover:bg-secondary/30">
                        <TableCell className="font-mono text-xs text-foreground">#{req.requestNumber ?? req.id}</TableCell>
                        <TableCell className="font-medium text-foreground">{req.requesterName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {requestTypeLabels[req.type] ?? req.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${sc.color} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs ${isOverdue ? "text-red-400 font-medium" : "text-muted-foreground"}`}>
                            {req.deadline ? new Date(req.deadline).toLocaleDateString("ar-SA") : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            <Eye className="w-3 h-3" />
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Inbox className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد طلبات DSAR</p>
              <p className="text-xs mt-1">لم يتم تسجيل أي طلبات وصول لبيانات أصحاب البيانات</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/MobileAppsPrivacy.tsx`

```tsx
/**
 * MobileAppsPrivacy — فحص التطبيقات
 * تحليل خصوصية تطبيقات الهواتف المحمولة
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Smartphone, Loader2, Download, Shield, Plus,
  Eye, Search, ChevronLeft, ChevronRight,
  CheckCircle, AlertTriangle, XCircle, Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

const platformConfig: Record<string, { label: string; color: string }> = {
  ios: { label: "iOS", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  android: { label: "Android", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  both: { label: "iOS و Android", color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
};

const PAGE_SIZE = 20;

export default function MobileAppsPrivacy() {
  const [platformFilter, setPlatformFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.privacy.mobileApps.list.useQuery({
    platform: platformFilter !== "all" ? platformFilter : undefined,
    search: searchQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const apps = data?.apps ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const kpis = useMemo(() => {
    if (!data?.stats) return null;
    const stats = data.stats as { total: number; compliant: number; nonCompliant: number };
    return [
      {
        label: "إجمالي التطبيقات",
        value: stats.total ?? 0,
        icon: Smartphone,
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
      },
      {
        label: "تطبيقات ممتثلة",
        value: stats.compliant ?? 0,
        icon: Shield,
        color: "text-emerald-400",
        borderColor: "border-emerald-500/20",
        bgColor: "bg-emerald-500/5",
      },
      {
        label: "تطبيقات غير ممتثلة",
        value: stats.nonCompliant ?? 0,
        icon: AlertTriangle,
        color: "text-red-400",
        borderColor: "border-red-500/20",
        bgColor: "bg-red-500/5",
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل بيانات التطبيقات...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Smartphone className="w-7 h-7 text-primary" />
            فحص التطبيقات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            تحليل خصوصية تطبيقات الهواتف المحمولة ومراجعة الأذونات والامتثال
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة تطبيق
        </Button>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border ${kpi.borderColor} ${kpi.bgColor} hover:scale-[1.02] transition-all duration-300 bg-card backdrop-blur-xl group relative overflow-hidden`}>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${kpi.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث باسم التطبيق..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="pr-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Select value={platformFilter} onValueChange={(v) => { setPlatformFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="المنصة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المنصات</SelectItem>
                <SelectItem value="ios">iOS</SelectItem>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="both">الكل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Apps Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-0">
          {apps.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التطبيق</TableHead>
                    <TableHead className="text-right">المنصة</TableHead>
                    <TableHead className="text-right">الأذونات</TableHead>
                    <TableHead className="text-right">نسبة الامتثال</TableHead>
                    <TableHead className="text-right">آخر فحص</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.map((app: any) => {
                    const platform = platformConfig[app.platform] ?? platformConfig.android;
                    const complianceRate = app.complianceRate ?? 0;
                    return (
                      <TableRow key={app.id} className="hover:bg-secondary/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{app.name}</p>
                              {app.developer && (
                                <p className="text-xs text-muted-foreground">{app.developer}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${platform.color}`}>
                            {platform.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(app.permissions ?? []).slice(0, 3).map((perm: string) => (
                              <Badge key={perm} variant="outline" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                            {(app.permissions ?? []).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(app.permissions ?? []).length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={complianceRate} className="w-16 h-2" />
                            <span className={`text-xs font-bold ${complianceRate >= 80 ? "text-emerald-400" : complianceRate >= 50 ? "text-amber-400" : "text-red-400"}`}>
                              {complianceRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {app.lastScanAt
                            ? new Date(app.lastScanAt).toLocaleDateString("ar-SA")
                            : "لم يتم الفحص"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            <Eye className="w-3 h-3" />
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Smartphone className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد تطبيقات</p>
              <p className="text-xs mt-1">أضف تطبيقاً جديداً لبدء فحص الخصوصية والامتثال</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/PrivacyAssessment.tsx`

```tsx
/**
 * PrivacyAssessment — تقييم الامتثال
 * أداة تقييم الامتثال عبر أسئلة لكل بند من بنود PDPL
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck, Loader2, FileCheck, CheckSquare,
  ChevronLeft, ChevronRight, Clock, Eye, Plus,
  AlertTriangle, CheckCircle, XCircle, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

const clauseLabels: Record<number, string> = {
  1: "الشفافية",
  2: "الغرض من الجمع",
  3: "مشاركة البيانات",
  4: "أمن البيانات",
  5: "حقوق صاحب البيانات",
  6: "فترة الاحتفاظ",
  7: "ملفات تعريف الارتباط",
  8: "تحديثات السياسة",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: "مكتمل", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  in_progress: { label: "قيد التقييم", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  draft: { label: "مسودة", color: "text-gray-400 bg-gray-500/10 border-gray-500/30" },
};

const PAGE_SIZE = 20;

export default function PrivacyAssessment() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const { data, isLoading } = trpc.privacy.assessment.list.useQuery({
    page,
    limit: PAGE_SIZE,
  });

  const assessments = data?.assessments ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const kpis = useMemo(() => {
    if (!data?.stats) return null;
    const stats = data.stats as { total: number; completed: number; avgScore: number };
    return [
      {
        label: "إجمالي التقييمات",
        value: stats.total ?? 0,
        icon: ClipboardCheck,
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
      },
      {
        label: "تقييمات مكتملة",
        value: stats.completed ?? 0,
        icon: FileCheck,
        color: "text-emerald-400",
        borderColor: "border-emerald-500/20",
        bgColor: "bg-emerald-500/5",
      },
      {
        label: "متوسط النتيجة",
        value: `${stats.avgScore ?? 0}%`,
        icon: BarChart3,
        color: "text-amber-400",
        borderColor: "border-amber-500/20",
        bgColor: "bg-amber-500/5",
      },
    ];
  }, [data]);

  /* Simple score calculation from answers */
  const formScore = useMemo(() => {
    const total = Object.keys(answers).length;
    if (total === 0) return 0;
    const yesCount = Object.values(answers).filter(a => a === "yes").length;
    return Math.round((yesCount / 8) * 100);
  }, [answers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل التقييمات...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-primary" />
            تقييم الامتثال
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            أداة تقييم الامتثال لنظام حماية البيانات الشخصية عبر أسئلة مفصلة
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          تقييم جديد
        </Button>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border ${kpi.borderColor} ${kpi.bgColor} hover:scale-[1.02] transition-all duration-300 bg-card backdrop-blur-xl group relative overflow-hidden`}>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${kpi.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Assessment Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card backdrop-blur-xl border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckSquare className="w-5 h-5 text-primary" />
                نموذج تقييم الامتثال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(clauseLabels).map(([id, label]) => {
                const clauseId = parseInt(id);
                return (
                  <div key={clauseId} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-primary">#{clauseId}</span>
                      <span className="text-sm font-medium text-foreground">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {["yes", "partial", "no"].map((val) => (
                        <Button
                          key={val}
                          variant={answers[clauseId] === val ? "default" : "outline"}
                          size="sm"
                          className={`text-xs ${
                            answers[clauseId] === val
                              ? val === "yes" ? "bg-emerald-600 hover:bg-emerald-700" : val === "partial" ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"
                              : ""
                          }`}
                          onClick={() => setAnswers({ ...answers, [clauseId]: val })}
                        >
                          {val === "yes" ? "ممتثل" : val === "partial" ? "جزئي" : "غير ممتثل"}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Score */}
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">النتيجة المحسوبة</p>
                  <p className="text-xs text-muted-foreground mt-0.5">بناءً على إجاباتك</p>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={formScore} className="w-24 h-2" />
                  <span className={`text-xl font-bold ${formScore >= 80 ? "text-emerald-400" : formScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                    {formScore}%
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setShowForm(false); setAnswers({}); }}>إلغاء</Button>
                <Button className="gap-2" onClick={() => { setShowForm(false); setAnswers({}); }}>
                  <FileCheck className="w-4 h-4" />
                  حفظ التقييم
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Assessment History Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="w-5 h-5 text-primary" />
            سجل التقييمات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {assessments.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموقع / الجهة</TableHead>
                    <TableHead className="text-right">النتيجة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ التقييم</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment: any) => {
                    const sc = statusConfig[assessment.status] ?? statusConfig.draft;
                    return (
                      <TableRow key={assessment.id} className="hover:bg-secondary/30">
                        <TableCell className="font-medium text-foreground">{assessment.name ?? assessment.domain}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={assessment.score ?? 0} className="w-16 h-2" />
                            <span className={`text-xs font-bold ${(assessment.score ?? 0) >= 80 ? "text-emerald-400" : (assessment.score ?? 0) >= 50 ? "text-amber-400" : "text-red-400"}`}>
                              {assessment.score ?? 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${sc.color}`}>{sc.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(assessment.createdAt).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            <Eye className="w-3 h-3" />
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ClipboardCheck className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد تقييمات سابقة</p>
              <p className="text-xs mt-1">أنشئ تقييماً جديداً للبدء في تقييم الامتثال</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/PrivacyDashboard.tsx`

```tsx
/**
 * PrivacyDashboard — لوحة مؤشرات الامتثال للخصوصية
 * عرض شامل لحالة الامتثال مع بطاقات KPI ورسوم بيانية
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield, Globe, ScanSearch, CheckCircle, AlertTriangle,
  TrendingUp, TrendingDown, Loader2, BarChart3, Clock,
  Eye, FileCheck, XCircle, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

/* ═══ Clause labels (the 8 PDPL clauses) ═══ */
const clauseLabels: Record<number, string> = {
  1: "الشفافية",
  2: "الغرض من الجمع",
  3: "مشاركة البيانات",
  4: "أمن البيانات",
  5: "حقوق صاحب البيانات",
  6: "فترة الاحتفاظ",
  7: "ملفات تعريف الارتباط",
  8: "تحديثات السياسة",
};

const clauseColors: Record<number, string> = {
  1: "#3b82f6",
  2: "#8b5cf6",
  3: "#f59e0b",
  4: "#10b981",
  5: "#ef4444",
  6: "#06b6d4",
  7: "#f97316",
  8: "#ec4899",
};

/* ═══ Simple bar chart for clause compliance ═══ */
function ClauseBarChart({ data }: { data: { clauseId: number; compliantPct: number; partialPct: number; nonCompliantPct: number }[] }) {
  if (!data || data.length === 0) return <p className="text-center text-muted-foreground text-sm py-8">لا توجد بيانات</p>;

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.clauseId} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">{clauseLabels[item.clauseId] || `بند ${item.clauseId}`}</span>
            <span className="text-muted-foreground">{item.compliantPct}% ممتثل</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-secondary/50">
            <div
              className="bg-emerald-500 transition-all duration-700"
              style={{ width: `${item.compliantPct}%` }}
            />
            <div
              className="bg-amber-500 transition-all duration-700"
              style={{ width: `${item.partialPct}%` }}
            />
            <div
              className="bg-red-500 transition-all duration-700"
              style={{ width: `${item.nonCompliantPct}%` }}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> ممتثل</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500" /> جزئي</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> غير ممتثل</span>
      </div>
    </div>
  );
}

/* ═══ Simple trend sparkline ═══ */
function TrendSparkline({ data, color = "#3b82f6" }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 200;
  const h = 60;
  const points = data.map((v, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * w,
    y: h - ((v - min) / range) * (h - 8) - 4,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={`trend-grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#trend-grad-${color.replace("#", "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export default function PrivacyDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: clauseStats, isLoading: clauseLoading } = trpc.dashboard.clauseStats.useQuery();

  const kpis = useMemo(() => {
    if (!stats) return null;
    return [
      {
        label: "إجمالي المواقع المراقبة",
        value: stats.totalSites ?? 0,
        icon: Globe,
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
      },
      {
        label: "نسبة الامتثال",
        value: `${stats.compliantPercentage ?? 0}%`,
        icon: CheckCircle,
        color: "text-emerald-400",
        borderColor: "border-emerald-500/20",
        bgColor: "bg-emerald-500/5",
        trend: (stats.compliantPercentage ?? 0) >= 50 ? "up" : "down",
      },
      {
        label: "مواقع غير ممتثلة",
        value: stats.nonCompliantCount ?? 0,
        icon: AlertTriangle,
        color: "text-red-400",
        borderColor: "border-red-500/20",
        bgColor: "bg-red-500/5",
      },
      {
        label: "عمليات فحص معلقة",
        value: stats.pendingScans ?? 0,
        icon: ScanSearch,
        color: "text-amber-400",
        borderColor: "border-amber-500/20",
        bgColor: "bg-amber-500/5",
      },
    ];
  }, [stats]);

  /* Trend data */
  const trendData = useMemo(() => {
    if (!stats?.complianceTrend) return [];
    return stats.complianceTrend as number[];
  }, [stats]);

  /* Recent scans */
  const recentScans = useMemo(() => {
    if (!stats?.recentScans) return [];
    return stats.recentScans as Array<{
      id: string;
      domain: string;
      score: number;
      status: string;
      scannedAt: string;
    }>;
  }, [stats]);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل لوحة المؤشرات...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            لوحة مؤشرات الامتثال
          </h1>
          <p className="text-sm text-muted-foreground mt-1">نظرة شاملة على حالة امتثال المواقع لنظام حماية البيانات الشخصية</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث البيانات
        </Button>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border ${kpi.borderColor} ${kpi.bgColor} hover:scale-[1.02] transition-all duration-300 bg-card backdrop-blur-xl group relative overflow-hidden`}>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${kpi.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                    </div>
                    {kpi.trend && (
                      <div className="flex items-center gap-1 mt-2">
                        {kpi.trend === "up" ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className={`text-xs ${kpi.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                          {kpi.trend === "up" ? "تحسن" : "تراجع"}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance by Clause */}
        <Card className="bg-card backdrop-blur-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5 text-primary" />
              الامتثال حسب البند
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clauseLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <ClauseBarChart data={clauseStats ?? []} />
            )}
          </CardContent>
        </Card>

        {/* Compliance Trend */}
        <Card className="bg-card backdrop-blur-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              اتجاه الامتثال
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <div className="space-y-4">
                <TrendSparkline data={trendData} color="#10b981" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>قبل 6 أشهر</span>
                  <span>الآن</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <BarChart3 className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">لا توجد بيانات اتجاه متاحة بعد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="w-5 h-5 text-primary" />
            آخر عمليات الفحص
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">النطاق</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">النتيجة</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">الحالة</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">تاريخ الفحص</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.map((scan) => (
                    <tr key={scan.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{scan.domain}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={scan.score} className="w-20 h-2" />
                          <span className={`text-xs font-medium ${scan.score >= 80 ? "text-emerald-400" : scan.score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                            {scan.score}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={scan.status === "compliant" ? "default" : scan.status === "partial" ? "secondary" : "destructive"} className="text-xs">
                          {scan.status === "compliant" ? "ممتثل" : scan.status === "partial" ? "جزئي" : "غير ممتثل"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(scan.scannedAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          <Eye className="w-3 h-3" />
                          عرض
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ScanSearch className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">لا توجد عمليات فحص حديثة</p>
              <p className="text-xs mt-1">ابدأ بفحص موقع للحصول على نتائج الامتثال</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/PrivacyExecutiveDashboard.tsx`

```tsx
/**
 * PrivacyExecutiveDashboard — لوحة المؤشرات التنفيذية للخصوصية
 * تعرض: مؤشر الهدف الاستراتيجي، مقارنة القطاعات، أضعف البنود، مؤشرات الإنجاز الشهري
 */
import { Loader2, Gauge, Building, TrendingUp, Target, BarChart3, ShieldCheck, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";

const CLAUSE_NAMES = [
  "الشفافية",
  "الغرض من الجمع",
  "مشاركة البيانات",
  "أمن البيانات",
  "حقوق صاحب البيانات",
  "فترة الاحتفاظ",
  "ملفات تعريف الارتباط",
  "تحديثات السياسة",
];

const CLAUSE_COLORS = [
  "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981",
  "#ef4444", "#06b6d4", "#f97316", "#ec4899",
];

export default function PrivacyExecutiveDashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: clauseStats } = trpc.dashboard.clauseStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  const totalSites = stats?.totalSites ?? 0;
  const complianceRate = stats?.complianceRate ?? 0;
  const targetRate = 80;
  const progressPct = Math.min((complianceRate / targetRate) * 100, 100);

  // Clause stats for radar and bar charts
  const clauseData = (clauseStats ?? []).map((c: any, i: number) => ({
    clause: CLAUSE_NAMES[i] ?? `بند ${i + 1}`,
    compliant: c?.compliantPct ?? 0,
    partial: c?.partialPct ?? 0,
    nonCompliant: c?.nonCompliantPct ?? 0,
    color: CLAUSE_COLORS[i] ?? "#6b7280",
  }));

  // Sector comparison mock from stats
  const sectorData = [
    { sector: "حكومي", rate: stats?.publicComplianceRate ?? complianceRate + 5 },
    { sector: "خاص", rate: stats?.privateComplianceRate ?? complianceRate - 8 },
    { sector: "شبه حكومي", rate: stats?.semiGovComplianceRate ?? complianceRate },
  ];

  return (
    <div dir="rtl" className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Gauge className="w-7 h-7 text-emerald-500" />
          لوحة المؤشرات التنفيذية للخصوصية
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مؤشرات الأداء الاستراتيجي لامتثال المواقع السعودية لنظام حماية البيانات الشخصية (PDPL)
        </p>
      </div>

      {/* Strategic Target */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold">مؤشر الهدف الاستراتيجي</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">نسبة الامتثال الحالية</span>
              <span className="font-bold text-emerald-500">{complianceRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, #10b981, #06b6d4)`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
              <span>0%</span>
              <span>الهدف: {targetRate}%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="text-center px-6 border-r">
            <div className="text-3xl font-bold text-foreground">{totalSites.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">موقع تحت الرصد</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-muted-foreground">نسبة الامتثال</span>
          </div>
          <div className="text-2xl font-bold">{complianceRate.toFixed(1)}%</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-muted-foreground">غير ممتثل</span>
          </div>
          <div className="text-2xl font-bold">{stats?.nonCompliantCount ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-cyan-500" />
            <span className="text-sm text-muted-foreground">فحوصات هذا الشهر</span>
          </div>
          <div className="text-2xl font-bold">{stats?.monthlyScans ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">التحسن الشهري</span>
          </div>
          <div className="text-2xl font-bold text-emerald-500">+{stats?.monthlyImprovement ?? 0}%</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Comparison */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-bold">مقارنة القطاعات</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sectorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="sector" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              <Bar dataKey="rate" name="نسبة الامتثال" radius={[0, 4, 4, 0]}>
                <Cell fill="#10b981" />
                <Cell fill="#8b5cf6" />
                <Cell fill="#06b6d4" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart - 8 Clauses */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold">البنود الثمانية (PDPL)</h2>
          </div>
          {clauseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={clauseData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="clause" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="ممتثل" dataKey="compliant" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Radar name="جزئي" dataKey="partial" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              لا توجد بيانات بنود
            </div>
          )}
        </div>
      </div>

      {/* Weakest Clauses */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold">ترتيب البنود من الأضعف للأقوى</h2>
        </div>
        <div className="space-y-3">
          {[...clauseData].sort((a, b) => a.compliant - b.compliant).map((clause, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm w-40 text-muted-foreground">{clause.clause}</span>
              <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${clause.compliant}%`, backgroundColor: clause.color }}
                />
              </div>
              <span className="text-sm font-bold w-16 text-left">{clause.compliant.toFixed(0)}%</span>
            </div>
          ))}
          {clauseData.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">لا توجد بيانات بنود</div>
          )}
        </div>
      </div>
    </div>
  );
}

```

---

## `client/src/privacy/pages/PrivacyImpact.tsx`

```tsx
/**
 * PrivacyImpact — تقييم الأثر (DPIA)
 * إدارة تقييمات أثر حماية البيانات
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, Loader2, Target, FileSearch, Plus,
  Eye, Search, ChevronLeft, ChevronRight,
  CheckCircle, AlertTriangle, Clock, XCircle, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

const riskLevelConfig: Record<string, { label: string; color: string }> = {
  high: { label: "مرتفع", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  medium: { label: "متوسط", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  low: { label: "منخفض", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
};

const dpiaStatusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: "مكتمل", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  in_progress: { label: "قيد التقييم", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  pending: { label: "معلّق", color: "text-gray-400 bg-gray-500/10 border-gray-500/30" },
  needs_review: { label: "يحتاج مراجعة", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
};

const PAGE_SIZE = 20;

export default function PrivacyImpact() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.privacy.dpia.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    riskLevel: riskFilter !== "all" ? riskFilter : undefined,
    search: searchQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const assessments = data?.assessments ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const kpis = useMemo(() => {
    if (!data?.stats) return null;
    const stats = data.stats as { total: number; highRisk: number; critical: number };
    return [
      {
        label: "إجمالي التقييمات",
        value: stats.total ?? 0,
        icon: ShieldAlert,
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
      },
      {
        label: "مخاطر مرتفعة",
        value: stats.highRisk ?? 0,
        icon: Target,
        color: "text-red-400",
        borderColor: "border-red-500/20",
        bgColor: "bg-red-500/5",
      },
      {
        label: "مخاطر حرجة",
        value: stats.critical ?? 0,
        icon: FileSearch,
        color: "text-amber-400",
        borderColor: "border-amber-500/20",
        bgColor: "bg-amber-500/5",
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل تقييمات الأثر...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-primary" />
            تقييم الأثر (DPIA)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة تقييمات أثر حماية البيانات الشخصية وتحليل المخاطر
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          تقييم جديد
        </Button>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border ${kpi.borderColor} ${kpi.bgColor} hover:scale-[1.02] transition-all duration-300 bg-card backdrop-blur-xl group relative overflow-hidden`}>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${kpi.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالمشروع..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="pr-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="in_progress">قيد التقييم</SelectItem>
                <SelectItem value="pending">معلّق</SelectItem>
                <SelectItem value="needs_review">يحتاج مراجعة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={(v) => { setRiskFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="مستوى المخاطر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="high">مرتفع</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-0">
          {assessments.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المشروع</TableHead>
                    <TableHead className="text-right">مستوى المخاطر</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ التقييم</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment: any) => {
                    const risk = riskLevelConfig[assessment.riskLevel] ?? riskLevelConfig.medium;
                    const status = dpiaStatusConfig[assessment.status] ?? dpiaStatusConfig.pending;
                    return (
                      <TableRow key={assessment.id} className="hover:bg-secondary/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{assessment.projectName}</p>
                              {assessment.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[250px]">{assessment.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${risk.color}`}>{risk.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${status.color}`}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(assessment.createdAt).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            <Eye className="w-3 h-3" />
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShieldAlert className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد تقييمات أثر</p>
              <p className="text-xs mt-1">أنشئ تقييم أثر جديد لتحليل مخاطر حماية البيانات</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/PrivacyLiveScan.tsx`

```tsx
/**
 * PrivacyLiveScan — الفحص المباشر
 * فحص موقع واحد مباشرة مع عرض النتائج الفورية
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ScanSearch, Loader2, Globe, Play, CheckCircle,
  AlertTriangle, XCircle, Shield, RefreshCw, Eye,
  Lock, Share2, Clock, Cookie, Target, Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

/* ═══ The 8 PDPL clauses ═══ */
interface ClauseConfig {
  id: number;
  nameAr: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
}

const pdplClauses: ClauseConfig[] = [
  { id: 1, nameAr: "الشفافية", icon: Eye, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  { id: 2, nameAr: "الغرض من الجمع", icon: Target, color: "text-violet-400", bgColor: "bg-violet-500/10", borderColor: "border-violet-500/30" },
  { id: 3, nameAr: "مشاركة البيانات", icon: Share2, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30" },
  { id: 4, nameAr: "أمن البيانات", icon: Lock, color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30" },
  { id: 5, nameAr: "حقوق صاحب البيانات", icon: Users, color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" },
  { id: 6, nameAr: "فترة الاحتفاظ", icon: Clock, color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30" },
  { id: 7, nameAr: "ملفات تعريف الارتباط", icon: Cookie, color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
  { id: 8, nameAr: "تحديثات السياسة", icon: RefreshCw, color: "text-pink-400", bgColor: "bg-pink-500/10", borderColor: "border-pink-500/30" },
];

export default function PrivacyLiveScan() {
  const [domain, setDomain] = useState("");
  const [scanDomain, setScanDomain] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const scanMutation = trpc.deepScan.scanSingle.useMutation({
    onSuccess: () => setIsScanning(false),
    onError: () => setIsScanning(false),
  });

  const scanning = scanMutation.isPending || isScanning;
  const scanResult = scanMutation.data;
  const overallScore = scanResult?.overallScore ?? scanResult?.score ?? 0;
  const results = scanResult ?? null;
  const clauseResults = results ? pdplClauses.map(c => ({
    clauseId: c.id,
    score: (results as any)?.[`clause${c.id}Compliant`] ? 100 : 0,
    notes: (results as any)?.[`clause${c.id}Evidence`] ?? "",
  })) : [];

  const handleStartScan = () => {
    if (!domain.trim()) return;
    setIsScanning(true);
    setScanDomain(domain.trim());
    scanMutation.mutate({ domain: domain.trim() });
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScanSearch className="w-7 h-7 text-primary" />
          الفحص المباشر
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          فحص موقع واحد مباشرة والحصول على نتائج الامتثال الفورية حسب بنود PDPL الثمانية
        </p>
      </div>

      {/* Domain Input */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="أدخل رابط الموقع (مثال: example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartScan()}
                className="pr-10 bg-secondary/50 border-border text-base"
                dir="ltr"
              />
            </div>
            <Button
              className="gap-2 min-w-[140px]"
              size="lg"
              disabled={!domain.trim() || scanning}
              onClick={handleStartScan}
            >
              {scanning ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {scanning ? "جاري الفحص..." : "بدء الفحص"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scan Progress */}
      {scanning && (
        <Card className="bg-card backdrop-blur-xl border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">جاري فحص {scanDomain}...</p>
                <p className="text-xs text-muted-foreground mt-1">يتم تحليل سياسة الخصوصية وفقاً لبنود نظام حماية البيانات الشخصية</p>
                <div className="mt-3">
                  <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 8, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && !scanning && (
        <>
          {/* Overall Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`bg-card backdrop-blur-xl border ${overallScore >= 80 ? "border-emerald-500/20 bg-emerald-500/5" : overallScore >= 50 ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5"}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">النتيجة الإجمالية</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className={`text-4xl font-bold ${overallScore >= 80 ? "text-emerald-400" : overallScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                        {overallScore}%
                      </p>
                      <Badge className={`text-sm border ${overallScore >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : overallScore >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-red-400 bg-red-500/10 border-red-500/30"}`}>
                        {overallScore >= 80 ? "ممتثل" : overallScore >= 50 ? "جزئي" : "غير ممتثل"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{scanDomain}</p>
                  </div>
                  <div className="w-32">
                    <Progress value={overallScore} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Clause Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pdplClauses.map((clause, index) => {
              const result = clauseResults.find((r: any) => r.clauseId === clause.id);
              const score = result?.score ?? 0;
              const notes = result?.notes ?? "";
              const Icon = clause.icon;

              return (
                <motion.div
                  key={clause.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border ${clause.borderColor} ${clause.bgColor} bg-card backdrop-blur-xl hover:shadow-lg transition-all duration-300`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${clause.bgColor} border ${clause.borderColor}`}>
                            <Icon className={`w-4 h-4 ${clause.color}`} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">
                              <span className={`text-xs font-mono ${clause.color} ml-1`}>#{clause.id}</span>
                              {clause.nameAr}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {score >= 80 ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : score >= 50 ? (
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          <span className={`text-lg font-bold ${score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                            {score}%
                          </span>
                        </div>
                      </div>
                      <Progress value={score} className="h-2 mb-2" />
                      {notes && (
                        <p className="text-xs text-muted-foreground mt-2">{notes}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty state when no scan has been run */}
      {!results && !scanning && !scanDomain && (
        <Card className="bg-card backdrop-blur-xl border-border">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ScanSearch className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-sm font-medium">لم يتم إجراء فحص بعد</p>
              <p className="text-xs mt-1">أدخل رابط الموقع أعلاه واضغط "بدء الفحص" للحصول على نتائج الامتثال</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

```

---

## `client/src/privacy/pages/PrivacyScans.tsx`

```tsx
/**
 * PrivacyScans — نتائج عمليات الفحص
 * جدول نتائج الفحص مع تفاصيل البنود والتصفية
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch, Search, Loader2, CheckCircle, AlertTriangle,
  XCircle, Eye, X, Calendar, Filter, ChevronLeft, ChevronRight,
  Globe, FileText, Clock, BarChart3, Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";

const clauseLabels: Record<number, string> = {
  1: "الشفافية",
  2: "الغرض من الجمع",
  3: "مشاركة البيانات",
  4: "أمن البيانات",
  5: "حقوق صاحب البيانات",
  6: "فترة الاحتفاظ",
  7: "ملفات تعريف الارتباط",
  8: "تحديثات السياسة",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  compliant: { label: "ممتثل", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  partial: { label: "جزئي", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  "non-compliant": { label: "غير ممتثل", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  pending: { label: "قيد الفحص", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  failed: { label: "فشل", color: "text-gray-400 bg-gray-500/10 border-gray-500/30" },
};

const PAGE_SIZE = 20;

/* Scan detail modal */
function ScanDetailModal({ scan, open, onClose }: { scan: any; open: boolean; onClose: () => void }) {
  if (!scan) return null;

  const clauseResults = scan.clauseResults ?? [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ScanSearch className="w-5 h-5 text-primary" />
            تفاصيل الفحص
          </DialogTitle>
          <DialogDescription>
            فحص {scan.domain} بتاريخ {new Date(scan.scannedAt).toLocaleDateString("ar-SA")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4" dir="rtl">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">النطاق</p>
              <p className="text-sm font-medium text-foreground mt-1">{scan.domain}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">النتيجة الإجمالية</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={scan.overallScore ?? 0} className="w-16 h-2" />
                <span className={`text-sm font-bold ${(scan.overallScore ?? 0) >= 80 ? "text-emerald-400" : (scan.overallScore ?? 0) >= 50 ? "text-amber-400" : "text-red-400"}`}>
                  {scan.overallScore ?? 0}%
                </span>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">الحالة</p>
              <Badge className={`text-xs border mt-1 ${(statusConfig[scan.status] ?? statusConfig.pending).color}`}>
                {(statusConfig[scan.status] ?? statusConfig.pending).label}
              </Badge>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">مدة الفحص</p>
              <p className="text-sm font-medium text-foreground mt-1">{scan.duration ?? "—"} ثانية</p>
            </div>
          </div>

          {/* Clause-by-clause results */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              نتائج البنود
            </h4>
            <div className="space-y-3">
              {clauseResults.length > 0 ? clauseResults.map((clause: any) => (
                <div key={clause.clauseId} className="flex items-center gap-3 bg-secondary/20 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {clauseLabels[clause.clauseId] || `بند ${clause.clauseId}`}
                      </span>
                      <span className={`text-xs font-medium ${clause.score >= 80 ? "text-emerald-400" : clause.score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                        {clause.score}%
                      </span>
                    </div>
                    <Progress value={clause.score} className="h-2" />
                    {clause.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{clause.notes}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {clause.score >= 80 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : clause.score >= 50 ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات تفصيلية للبنود</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {scan.recommendations && scan.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                التوصيات
              </h4>
              <ul className="space-y-2">
                {scan.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PrivacyScans() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedScan, setSelectedScan] = useState<any>(null);

  const { data, isLoading } = trpc.scans.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const scans = data?.scans ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل نتائج الفحص...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ScanSearch className="w-7 h-7 text-primary" />
            نتائج عمليات الفحص
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            عرض تفصيلي لجميع عمليات فحص الامتثال
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          تصدير التقارير
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="compliant">ممتثل</SelectItem>
                <SelectItem value="partial">جزئي</SelectItem>
                <SelectItem value="non-compliant">غير ممتثل</SelectItem>
                <SelectItem value="failed">فشل</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">من:</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-[150px] bg-secondary/50 border-border text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">إلى:</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-[150px] bg-secondary/50 border-border text-sm"
              />
            </div>
            {(statusFilter !== "all" || dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStatusFilter("all"); setDateFrom(""); setDateTo(""); setPage(1); }}
                className="text-xs"
              >
                مسح الفلاتر
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scans Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-0">
          {scans.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">النطاق</TableHead>
                    <TableHead className="text-right">النتيجة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">البنود الممتثلة</TableHead>
                    <TableHead className="text-right">تاريخ الفحص</TableHead>
                    <TableHead className="text-right">المدة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scans.map((scan: any) => {
                    const sc = statusConfig[scan.status] ?? statusConfig.pending;
                    const compliantClauses = scan.clauseResults?.filter((c: any) => c.score >= 80).length ?? 0;
                    const totalClauses = scan.clauseResults?.length ?? 8;
                    return (
                      <TableRow
                        key={scan.id}
                        className="hover:bg-secondary/30 cursor-pointer"
                        onClick={() => setSelectedScan(scan)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-foreground">{scan.domain}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={scan.overallScore ?? 0} className="w-16 h-2" />
                            <span className={`text-xs font-bold ${(scan.overallScore ?? 0) >= 80 ? "text-emerald-400" : (scan.overallScore ?? 0) >= 50 ? "text-amber-400" : "text-red-400"}`}>
                              {scan.overallScore ?? 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${sc.color}`}>
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-foreground">{compliantClauses}/{totalClauses}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(scan.scannedAt).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {scan.duration ? `${scan.duration}ث` : "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={(e) => { e.stopPropagation(); setSelectedScan(scan); }}
                          >
                            <Eye className="w-3 h-3" />
                            التفاصيل
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ScanSearch className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد نتائج فحص</p>
              <p className="text-xs mt-1">لم يتم العثور على عمليات فحص مطابقة لمعايير البحث</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <ScanDetailModal
        scan={selectedScan}
        open={!!selectedScan}
        onClose={() => setSelectedScan(null)}
      />
    </div>
  );
}

```

---

## `client/src/privacy/pages/PrivacySites.tsx`

```tsx
/**
 * PrivacySites — سجل المواقع المراقبة
 * جدول شامل للمواقع مع فلاتر البحث والتصفية
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe, Search, Loader2, CheckCircle, AlertTriangle,
  XCircle, Filter, ChevronLeft, ChevronRight, Eye,
  Building2, RefreshCw, Plus, ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  compliant: { label: "ممتثل", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
  partial: { label: "جزئي", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: AlertTriangle },
  "non-compliant": { label: "غير ممتثل", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: XCircle },
  pending: { label: "قيد الفحص", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: RefreshCw },
};

const sectors = [
  { value: "all", label: "جميع القطاعات" },
  { value: "government", label: "حكومي" },
  { value: "banking", label: "مصرفي" },
  { value: "healthcare", label: "صحي" },
  { value: "education", label: "تعليمي" },
  { value: "telecom", label: "اتصالات" },
  { value: "retail", label: "تجزئة" },
  { value: "other", label: "أخرى" },
];

const categories = [
  { value: "all", label: "جميع الفئات" },
  { value: "ecommerce", label: "تجارة إلكترونية" },
  { value: "social", label: "تواصل اجتماعي" },
  { value: "services", label: "خدمات" },
  { value: "media", label: "إعلام" },
  { value: "fintech", label: "تقنية مالية" },
];

const PAGE_SIZE = 20;

export default function PrivacySites() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.sites.list.useQuery({
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sectorType: sectorFilter !== "all" ? sectorFilter : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const sites = data?.sites ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  /* Stats summary */
  const summaryStats = useMemo(() => {
    if (!data?.stats) return null;
    return data.stats as { compliant: number; partial: number; nonCompliant: number; pending: number };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل المواقع...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="w-7 h-7 text-primary" />
            سجل المواقع المراقبة
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة ومراقبة جميع المواقع المسجلة في نظام الامتثال
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة موقع
        </Button>
      </div>

      {/* Summary stats */}
      {summaryStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "ممتثل", value: summaryStats.compliant, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5", icon: CheckCircle },
            { label: "جزئي", value: summaryStats.partial, color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5", icon: AlertTriangle },
            { label: "غير ممتثل", value: summaryStats.nonCompliant, color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5", icon: XCircle },
            { label: "قيد الفحص", value: summaryStats.pending, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5", icon: RefreshCw },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`border ${stat.border} ${stat.bg} bg-card`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${stat.color} opacity-40`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالنطاق..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="pr-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="compliant">ممتثل</SelectItem>
                <SelectItem value="partial">جزئي</SelectItem>
                <SelectItem value="non-compliant">غير ممتثل</SelectItem>
                <SelectItem value="pending">قيد الفحص</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={(v) => { setSectorFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                <SelectValue placeholder="القطاع" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sites Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-0">
          {sites.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">النطاق</TableHead>
                    <TableHead className="text-right">القطاع</TableHead>
                    <TableHead className="text-right">نسبة الامتثال</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">آخر فحص</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site: any) => {
                    const sc = statusConfig[site.status] ?? statusConfig.pending;
                    const StatusIcon = sc.icon;
                    return (
                      <TableRow key={site.id} className="hover:bg-secondary/30 cursor-pointer">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{site.domain}</p>
                              {site.name && <p className="text-xs text-muted-foreground">{site.name}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs gap-1">
                            <Building2 className="w-3 h-3" />
                            {site.sectorAr || site.sector || "غير محدد"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={site.complianceScore ?? 0} className="w-16 h-2" />
                            <span className={`text-xs font-medium ${(site.complianceScore ?? 0) >= 80 ? "text-emerald-400" : (site.complianceScore ?? 0) >= 50 ? "text-amber-400" : "text-red-400"}`}>
                              {site.complianceScore ?? 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${sc.color} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {site.lastScanDate
                            ? new Date(site.lastScanDate).toLocaleDateString("ar-SA")
                            : "لم يتم الفحص"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="gap-1 text-xs">
                              <Eye className="w-3 h-3" />
                              عرض
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1 text-xs">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Globe className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد مواقع مطابقة</p>
              <p className="text-xs mt-1">جرّب تعديل معايير البحث أو إضافة موقع جديد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/ProcessingRecords.tsx`

```tsx
/**
 * ProcessingRecords — سجلات المعالجة
 * إدارة سجلات أنشطة معالجة البيانات الشخصية
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Database, Loader2, FileText, List, Plus,
  Eye, Search, ChevronLeft, ChevronRight,
  Edit, CheckCircle, Clock, AlertTriangle, Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

const recordStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "نشط", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  under_review: { label: "قيد المراجعة", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  archived: { label: "مؤرشف", color: "text-gray-400 bg-gray-500/10 border-gray-500/30" },
  needs_update: { label: "يحتاج تحديث", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
};

const legalBasisLabels: Record<string, string> = {
  consent: "الموافقة",
  contract: "تنفيذ عقد",
  legal_obligation: "التزام قانوني",
  vital_interest: "مصلحة حيوية",
  public_interest: "مصلحة عامة",
  legitimate_interest: "مصلحة مشروعة",
};

const dataCategoryLabels: Record<string, string> = {
  personal: "بيانات شخصية",
  sensitive: "بيانات حساسة",
  financial: "بيانات مالية",
  health: "بيانات صحية",
  biometric: "بيانات بيومترية",
  location: "بيانات موقع",
};

const PAGE_SIZE = 20;

export default function ProcessingRecords() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.privacy.processing.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const records = data?.records ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const kpis = useMemo(() => {
    if (!data?.stats) return null;
    const stats = data.stats as { total: number; active: number; needsUpdate: number };
    return [
      {
        label: "إجمالي السجلات",
        value: stats.total ?? 0,
        icon: Database,
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
      },
      {
        label: "سجلات نشطة",
        value: stats.active ?? 0,
        icon: CheckCircle,
        color: "text-emerald-400",
        borderColor: "border-emerald-500/20",
        bgColor: "bg-emerald-500/5",
      },
      {
        label: "تحتاج تحديث",
        value: stats.needsUpdate ?? 0,
        icon: AlertTriangle,
        color: "text-amber-400",
        borderColor: "border-amber-500/20",
        bgColor: "bg-amber-500/5",
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل سجلات المعالجة...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="w-7 h-7 text-primary" />
            سجلات المعالجة
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة سجلات أنشطة معالجة البيانات الشخصية والأساس القانوني
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة سجل
        </Button>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border ${kpi.borderColor} ${kpi.bgColor} hover:scale-[1.02] transition-all duration-300 bg-card backdrop-blur-xl group relative overflow-hidden`}>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${kpi.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بنشاط المعالجة..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="pr-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="under_review">قيد المراجعة</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
                <SelectItem value="needs_update">يحتاج تحديث</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Processing Records Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-0">
          {records.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">نشاط المعالجة</TableHead>
                    <TableHead className="text-right">الغرض</TableHead>
                    <TableHead className="text-right">فئات البيانات</TableHead>
                    <TableHead className="text-right">الأساس القانوني</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record: any) => {
                    const sc = recordStatusConfig[record.status] ?? recordStatusConfig.active;
                    return (
                      <TableRow key={record.id} className="hover:bg-secondary/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-foreground">{record.activityName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm text-foreground truncate">{record.purpose}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(record.dataCategories ?? []).slice(0, 2).map((cat: string) => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {dataCategoryLabels[cat] ?? cat}
                              </Badge>
                            ))}
                            {(record.dataCategories ?? []).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(record.dataCategories ?? []).length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {legalBasisLabels[record.legalBasis] ?? record.legalBasis}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${sc.color}`}>{sc.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="gap-1 text-xs">
                              <Eye className="w-3 h-3" />
                              عرض
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1 text-xs">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Database className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد سجلات معالجة</p>
              <p className="text-xs mt-1">أضف سجل معالجة جديد لتوثيق أنشطة معالجة البيانات</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/SectorComparison.tsx`

```tsx
/**
 * SectorComparison — مقارنة القطاعات
 * مقارنة الامتثال بين القطاع العام والخاص
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2, Loader2, BarChart3, Factory, Landmark,
  TrendingUp, CheckCircle, AlertTriangle, XCircle, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const clauseLabels: Record<number, string> = {
  1: "الشفافية",
  2: "الغرض من الجمع",
  3: "مشاركة البيانات",
  4: "أمن البيانات",
  5: "حقوق صاحب البيانات",
  6: "فترة الاحتفاظ",
  7: "ملفات تعريف الارتباط",
  8: "تحديثات السياسة",
};

/* Side-by-side bar for comparison */
function ComparisonBar({ label, publicPct, privatePct }: { label: string; publicPct: number; privatePct: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">{label}</span>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-emerald-400">عام: {publicPct}%</span>
          <span className="text-blue-400">خاص: {privatePct}%</span>
        </div>
      </div>
      <div className="flex gap-1 h-4">
        <div className="flex-1 bg-secondary/30 rounded-r-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${publicPct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <div className="flex-1 bg-secondary/30 rounded-l-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-l-full"
            initial={{ width: 0 }}
            animate={{ width: `${privatePct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SectorComparison() {
  const { data, isLoading } = trpc.sectorComparison.detailed.useQuery();

  const publicSector = useMemo(() => data?.publicSector ?? null, [data]);
  const privateSector = useMemo(() => data?.privateSector ?? null, [data]);
  const clauseComparison = useMemo(() => data?.clauseComparison ?? [], [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل بيانات المقارنة...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary" />
          مقارنة القطاعات
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مقارنة مستوى الامتثال بين القطاع العام والخاص
        </p>
      </div>

      {/* Sector summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Public sector */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-card backdrop-blur-xl border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Building2 className="w-5 h-5 text-emerald-400" />
                القطاع العام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">إجمالي المواقع</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{publicSector?.totalSites ?? 0}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">متوسط الامتثال</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{publicSector?.avgCompliance ?? 0}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الامتثال الكلي</span>
                  <span className="text-emerald-400 font-medium">{publicSector?.avgCompliance ?? 0}%</span>
                </div>
                <Progress value={publicSector?.avgCompliance ?? 0} className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">ممتثل</p>
                  <p className="text-sm font-bold text-emerald-400">{publicSector?.compliant ?? 0}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">جزئي</p>
                  <p className="text-sm font-bold text-amber-400">{publicSector?.partial ?? 0}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">غير ممتثل</p>
                  <p className="text-sm font-bold text-red-400">{publicSector?.nonCompliant ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Private sector */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-card backdrop-blur-xl border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Factory className="w-5 h-5 text-blue-400" />
                القطاع الخاص
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">إجمالي المواقع</p>
                  <p className="text-xl font-bold text-blue-400 mt-1">{privateSector?.totalSites ?? 0}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">متوسط الامتثال</p>
                  <p className="text-xl font-bold text-blue-400 mt-1">{privateSector?.avgCompliance ?? 0}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الامتثال الكلي</span>
                  <span className="text-blue-400 font-medium">{privateSector?.avgCompliance ?? 0}%</span>
                </div>
                <Progress value={privateSector?.avgCompliance ?? 0} className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">ممتثل</p>
                  <p className="text-sm font-bold text-emerald-400">{privateSector?.compliant ?? 0}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">جزئي</p>
                  <p className="text-sm font-bold text-amber-400">{privateSector?.partial ?? 0}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">غير ممتثل</p>
                  <p className="text-sm font-bold text-red-400">{privateSector?.nonCompliant ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Clause-by-clause comparison */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            مقارنة الامتثال حسب البند
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-muted-foreground">القطاع العام</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-muted-foreground">القطاع الخاص</span>
            </span>
          </div>

          {clauseComparison.length > 0 ? (
            <div className="space-y-5">
              {clauseComparison.map((item: any) => (
                <ComparisonBar
                  key={item.clauseId}
                  label={clauseLabels[item.clauseId] || `بند ${item.clauseId}`}
                  publicPct={item.publicPct ?? 0}
                  privatePct={item.privatePct ?? 0}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">لا توجد بيانات مقارنة متاحة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/privacy/pages/SiteWatchers.tsx`

```tsx
/**
 * SiteWatchers — مراقبة المواقع
 * إدارة قائمة المواقع المراقبة مع تكرار المراقبة
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, Loader2, Plus, Trash2, Globe, Clock, Settings,
  CheckCircle, AlertTriangle, RefreshCw, Search, Shield,
  ChevronLeft, ChevronRight, Radio, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";

const frequencyLabels: Record<string, string> = {
  hourly: "كل ساعة",
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
};

const PAGE_SIZE = 20;

export default function SiteWatchers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  /* New watcher form */
  const [newDomain, setNewDomain] = useState("");
  const [newFrequency, setNewFrequency] = useState("daily");

  const { data, isLoading } = trpc.watchers.myWatched.useQuery();

  const allWatchers = Array.isArray(data) ? data : [];
  const watchers = searchQuery
    ? allWatchers.filter((w: any) => (w.domain || '').includes(searchQuery) || (w.siteName || '').includes(searchQuery))
    : allWatchers;
  const totalCount = watchers.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">جاري تحميل المراقبين...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radio className="w-7 h-7 text-primary" />
            مراقبة المواقع
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة قائمة المواقع المراقبة وتكرار الفحص
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          إضافة مراقب
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي المراقبين", value: totalCount, icon: Eye, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5" },
          { label: "نشط", value: watchers.filter((w: any) => w.active).length, icon: CheckCircle, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
          { label: "متوقف", value: watchers.filter((w: any) => !w.active).length, icon: AlertTriangle, color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" },
          { label: "قيد الفحص الآن", value: watchers.filter((w: any) => w.scanning).length, icon: RefreshCw, color: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/5" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`border ${stat.border} ${stat.bg} bg-card`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color} opacity-40`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالنطاق..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pr-10 bg-secondary/50 border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Watchers Table */}
      <Card className="bg-card backdrop-blur-xl border-border">
        <CardContent className="p-0">
          {watchers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">النطاق</TableHead>
                    <TableHead className="text-right">تكرار المراقبة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">آخر فحص</TableHead>
                    <TableHead className="text-right">آخر نتيجة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchers.map((watcher: any) => (
                    <TableRow key={watcher.id} className="hover:bg-secondary/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground">{watcher.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs gap-1">
                          <Clock className="w-3 h-3" />
                          {frequencyLabels[watcher.frequency] || watcher.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {watcher.active ? (
                          <Badge className="text-xs border text-emerald-400 bg-emerald-500/10 border-emerald-500/30 gap-1">
                            <Zap className="w-3 h-3" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge className="text-xs border text-gray-400 bg-gray-500/10 border-gray-500/30">
                            متوقف
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {watcher.lastScanAt ? new Date(watcher.lastScanAt).toLocaleDateString("ar-SA") : "لم يتم الفحص"}
                      </TableCell>
                      <TableCell>
                        {watcher.lastScore != null ? (
                          <span className={`text-xs font-bold ${watcher.lastScore >= 80 ? "text-emerald-400" : watcher.lastScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                            {watcher.lastScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="text-xs gap-1">
                            <Settings className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => setConfirmDelete(watcher.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} من {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Eye className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد مراقبين</p>
              <p className="text-xs mt-1">أضف موقعاً للبدء في المراقبة التلقائية</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Watcher Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              إضافة مراقب جديد
            </DialogTitle>
            <DialogDescription>أضف موقعاً للمراقبة التلقائية</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4" dir="rtl">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">النطاق</label>
              <Input
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="bg-secondary/50 border-border"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">تكرار المراقبة</label>
              <Select value={newFrequency} onValueChange={setNewFrequency}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">كل ساعة</SelectItem>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>إلغاء</Button>
            <Button
              className="gap-2"
              disabled={!newDomain}
              onClick={() => {
                setAddDialogOpen(false);
                setNewDomain("");
                setNewFrequency("daily");
              }}
            >
              <Plus className="w-4 h-4" />
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-400">تأكيد الحذف</DialogTitle>
            <DialogDescription>هل أنت متأكد من حذف هذا المراقب؟ لا يمكن التراجع عن هذا الإجراء.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>إلغاء</Button>
            <Button
              variant="destructive"
              onClick={() => {
                /* Would call delete mutation */
                setConfirmDelete(null);
              }}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

---

## `client/src/types/modules.d.ts`

```typescript
declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, any>;
    jsPDF?: { unit?: string; format?: string; orientation?: string };
    pagebreak?: { mode?: string[] };
  }
  interface Html2PdfInstance {
    set(opt: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement | string): Html2PdfInstance;
    save(): Promise<void>;
    toPdf(): Html2PdfInstance;
    output(type: string): Promise<any>;
  }
  function html2pdf(): Html2PdfInstance;
  export default html2pdf;
}

declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    backgroundColor?: string | null;
    logging?: boolean;
  }
  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
  export default html2canvas;
}

```

---

