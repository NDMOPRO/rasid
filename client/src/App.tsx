import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FilterProvider } from "./contexts/FilterContext";
import { PlatformSettingsProvider } from "./contexts/PlatformSettingsContext";
import DashboardLayout from "./components/DashboardLayout";
import TopProgressBar from "./components/TopProgressBar";
import { PageSkeleton } from "./components/Skeletons";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Sites = lazy(() => import("./pages/Sites"));
const SiteDetail = lazy(() => import("./pages/SiteDetail"));
const Clauses = lazy(() => import("./pages/Clauses"));
const ClauseDetail = lazy(() => import("./pages/ClauseDetail"));
const Scan = lazy(() => import("./pages/Scan"));
const Reports = lazy(() => import("./pages/Reports"));
const Letters = lazy(() => import("./pages/Letters"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Members = lazy(() => import("./pages/Members"));
const Login = lazy(() => import("./pages/Login"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const ActivityLogs = lazy(() => import("./pages/ActivityLogs"));
const LeadershipDashboard = lazy(() => import("./pages/LeadershipDashboard"));
const ScanLibrary = lazy(() => import("./pages/ScanLibrary"));
const MobileApps = lazy(() => import("./pages/MobileApps"));
const BatchScan = lazy(() => import("./pages/BatchScan"));
const Cases = lazy(() => import("./pages/Cases"));
const MessageTemplates = lazy(() => import("./pages/MessageTemplates"));
const ScanSchedules = lazy(() => import("./pages/ScanSchedules"));
const RoleDashboard = lazy(() => import("./pages/RoleDashboard"));
const EscalationRules = lazy(() => import("./pages/EscalationRules"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const ChangeDetection = lazy(() => import("./pages/ChangeDetection"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const ScheduledReports = lazy(() => import("./pages/ScheduledReports"));
const ComplianceComparison = lazy(() => import("./pages/ComplianceComparison"));
const CustomReports = lazy(() => import("./pages/CustomReports"));
const KpiDashboard = lazy(() => import("./pages/KpiDashboard"));
const SmartAlerts = lazy(() => import("./pages/SmartAlerts"));
const AdvancedSearch = lazy(() => import("./pages/AdvancedSearch"));
const Profile = lazy(() => import("./pages/Profile"));
const TimeComparison = lazy(() => import("./pages/TimeComparison"));
const MyCustomDashboard = lazy(() => import("./pages/MyDashboard"));
const VisualAlerts = lazy(() => import("./pages/VisualAlerts"));
const SectorComparison = lazy(() => import("./pages/SectorComparison"));
const EmailNotifications = lazy(() => import("./pages/EmailNotifications"));
const PdfReports = lazy(() => import("./pages/PdfReports"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const ComplianceHeatmap = lazy(() => import("./pages/ComplianceHeatmap"));
const RealTimeDashboard = lazy(() => import("./pages/RealTimeDashboard"));
const ExecutiveReport = lazy(() => import("./pages/ExecutiveReport"));
const AdvancedScan = lazy(() => import("./pages/AdvancedScan"));
const ScanExecution = lazy(() => import("./pages/ScanExecution"));
const ScanHistory = lazy(() => import("./pages/ScanHistory"));
const ExportData = lazy(() => import("./pages/ExportData"));
const ImprovementTracker = lazy(() => import("./pages/ImprovementTracker"));
const InteractiveComparison = lazy(() => import("./pages/InteractiveComparison"));
const EmailManagement = lazy(() => import("./pages/EmailManagement"));
const VerifyDocument = lazy(() => import("./pages/VerifyDocument"));
const PublicVerify = lazy(() => import("./pages/PublicVerify"));
const DocumentsRegistry = lazy(() => import("./pages/DocumentsRegistry"));
const DocumentStats = lazy(() => import("./pages/DocumentStats"));
const PresentationMode = lazy(() => import("./pages/PresentationMode"));
const PresentationBuilder = lazy(() => import("./pages/PresentationBuilder"));
const SmartRasid = lazy(() => import("./pages/SmartRasid"));
const ScenarioManagement = lazy(() => import("./pages/ScenarioManagement"));
const TrainingCenter = lazy(() => import("./pages/TrainingCenter"));
const AiManagement = lazy(() => import("./pages/AiManagement"));
const BulkAnalysis = lazy(() => import("./pages/BulkAnalysis"));
const DeepScan = lazy(() => import("./pages/DeepScan"));
const UsageAnalytics = lazy(() => import("./pages/UsageAnalytics"));
const SuperAdminPanel = lazy(() => import("./pages/SuperAdminPanel"));
const StrategyCoverage = lazy(() => import("./pages/StrategyCoverage"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
const LeakAnatomy = lazy(() => import("./pages/LeakAnatomy"));
const SectorAnalysis = lazy(() => import("./pages/SectorAnalysis"));
const LeakTimeline = lazy(() => import("./pages/LeakTimeline"));
const ThreatActorsAnalysis = lazy(() => import("./pages/ThreatActorsAnalysis"));
const ImpactAssessment = lazy(() => import("./pages/ImpactAssessment"));
const SourceIntelligence = lazy(() => import("./pages/SourceIntelligence"));
const GeoAnalysis = lazy(() => import("./pages/GeoAnalysis"));
const IncidentCompare = lazy(() => import("./pages/IncidentCompare"));
const PdplCompliance = lazy(() => import("./pages/PdplCompliance"));
const CampaignTracker = lazy(() => import("./pages/CampaignTracker"));
const RecommendationsHub = lazy(() => import("./pages/RecommendationsHub"));
const ExecutiveBrief = lazy(() => import("./pages/ExecutiveBrief"));
const IncidentsRegistry = lazy(() => import("./pages/IncidentsRegistry"));
const PlatformLogin = lazy(() => import("./pages/PlatformLogin"));

function Router() {
  return (
    <DashboardLayout>
      <Suspense fallback={<PageSkeleton />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/leadership" component={LeadershipDashboard} />
          <Route path="/scan-library" component={ScanLibrary} />
          <Route path="/sites" component={Sites} />
          <Route path="/sites/:id" component={SiteDetail} />
          <Route path="/clauses" component={Clauses} />
          <Route path="/clauses/:num" component={ClauseDetail} />
          <Route path="/scan" component={Scan} />
          <Route path="/reports" component={Reports} />
          <Route path="/letters" component={Letters} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/members" component={Members} />
          <Route path="/change-password" component={ChangePassword} />
          <Route path="/activity-logs" component={ActivityLogs} />
          <Route path="/mobile-apps" component={MobileApps} />
          <Route path="/batch-scan" component={BatchScan} />
          <Route path="/cases" component={Cases} />
          <Route path="/message-templates" component={MessageTemplates} />
          <Route path="/scan-schedules" component={ScanSchedules} />
          <Route path="/my-dashboard" component={RoleDashboard} />
          <Route path="/escalation" component={EscalationRules} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/change-detection" component={ChangeDetection} />
          <Route path="/advanced-analytics" component={AdvancedAnalytics} />
          <Route path="/api-keys" component={ApiKeys} />
          <Route path="/system-health" component={SystemHealth} />
          <Route path="/scheduled-reports" component={ScheduledReports} />
          <Route path="/compliance-comparison" component={ComplianceComparison} />
          <Route path="/custom-reports" component={CustomReports} />
          <Route path="/kpi-dashboard" component={KpiDashboard} />
          <Route path="/smart-alerts" component={SmartAlerts} />
          <Route path="/advanced-search" component={AdvancedSearch} />
          <Route path="/profile" component={Profile} />
          <Route path="/time-comparison" component={TimeComparison} />
          <Route path="/my-custom-dashboard" component={MyCustomDashboard} />
          <Route path="/visual-alerts" component={VisualAlerts} />
          <Route path="/sector-comparison" component={SectorComparison} />
          <Route path="/email-notifications" component={EmailNotifications} />
          <Route path="/pdf-reports" component={PdfReports} />
          <Route path="/admin-panel" component={AdminPanel} />
          <Route path="/compliance-heatmap" component={ComplianceHeatmap} />
          <Route path="/real-time" component={RealTimeDashboard} />
          <Route path="/executive-report" component={ExecutiveReport} />
          <Route path="/advanced-scan" component={AdvancedScan} />
          <Route path="/scan-history" component={ScanHistory} />
          <Route path="/export-data" component={ExportData} />
          <Route path="/improvement-tracker" component={ImprovementTracker} />
          <Route path="/interactive-comparison" component={InteractiveComparison} />
          <Route path="/email-management" component={EmailManagement} />
          <Route path="/verify/:code?" component={VerifyDocument} />
          <Route path="/documents-registry" component={DocumentsRegistry} />
          <Route path="/document-stats" component={DocumentStats} />
          <Route path="/presentation" component={PresentationMode} />
          <Route path="/presentation-builder" component={PresentationBuilder} />
          <Route path="/presentation-builder/:id" component={PresentationBuilder} />
          <Route path="/smart-rasid" component={SmartRasid} />
          <Route path="/scenario-management" component={ScenarioManagement} />
          <Route path="/training-center" component={TrainingCenter} />
          <Route path="/ai-management" component={AiManagement} />
          <Route path="/bulk-analysis" component={BulkAnalysis} />
          <Route path="/deep-scan" component={DeepScan} />
          <Route path="/usage-analytics" component={UsageAnalytics} />
          <Route path="/super-admin" component={SuperAdminPanel} />
          <Route path="/strategy-coverage" component={StrategyCoverage} />
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
          <Route path="/national-overview" component={NationalOverview} />
          <Route path="/leak-anatomy" component={LeakAnatomy} />
          <Route path="/sector-analysis" component={SectorAnalysis} />
          <Route path="/leak-timeline" component={LeakTimeline} />
          <Route path="/threat-actors-analysis" component={ThreatActorsAnalysis} />
          <Route path="/impact-assessment" component={ImpactAssessment} />
          <Route path="/source-intelligence" component={SourceIntelligence} />
          <Route path="/geo-analysis" component={GeoAnalysis} />
          <Route path="/incident-compare" component={IncidentCompare} />
          <Route path="/pdpl-compliance" component={PdplCompliance} />
          <Route path="/campaign-tracker" component={CampaignTracker} />
          <Route path="/recommendations" component={RecommendationsHub} />
          <Route path="/executive-brief" component={ExecutiveBrief} />
          <Route path="/incidents-registry" component={IncidentsRegistry} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <FilterProvider>
        <PlatformSettingsProvider>
        <TooltipProvider>
          <TopProgressBar />
          <Toaster />
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
            <Route path="/scan-execution/:jobId">
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
                <ScanExecution />
              </Suspense>
            </Route>
            <Route path="/public-verify">
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
                <PublicVerify />
              </Suspense>
            </Route>
            <Route>
              <Router />
            </Route>
          </Switch>
        </TooltipProvider>
        </PlatformSettingsProvider>
        </FilterProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
