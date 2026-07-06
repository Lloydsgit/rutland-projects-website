import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/lib/ThemeContext";
import AccessGate from "./components/auth/AccessGate";

import BootSequence from "./components/hud/BootSequence";
import HudLayout from "./components/hud/HudLayout";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Goals from "./pages/Goals";
import Watchlist from "./pages/Watchlist";
import Decisions from "./pages/Decisions";
import Tools from "./pages/Tools";
import Settings from "./pages/Settings";
import Memory from "./pages/Memory";
import Workflows from "./pages/Workflows";
import MemoryGraph from "./pages/MemoryGraph";
import Dossier from "./pages/Dossier";
import WorldMap from "./pages/WorldMap";
import Commander from "./pages/Commander";
import IntelFeed from "./pages/IntelFeed";
import ReportGenerator from "./pages/ReportGenerator";
import HardwareControls from "./pages/HardwareControls";
import ConnectionGraph from "./pages/ConnectionGraph";
import MusicWidget from "./pages/MusicWidget";
import MindOfJarvis from "./pages/MindOfJarvis";
import InvestigativeWorkspace from "./pages/InvestigativeWorkspace";
import CameraWidget from "./pages/CameraWidget";
import MapWidget from "./pages/MapWidget";
import OsintFindings from "./pages/OsintFindings";
import CouncilRoom from "./pages/CouncilRoom";
import IrisGlobal from "./pages/IrisGlobal";
import VoiceSettings from "./pages/VoiceSettings";
import BulkImport from "./pages/BulkImport";
import AutomationHub from "./pages/AutomationHub";
import IrisCommand from "./pages/IrisCommand";
import IntelAssets from "./pages/IntelAssets";
import OsintTimeline from "./pages/OsintTimeline";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();
  const [booted, setBooted] = useState(() => sessionStorage.getItem("jarvis-booted") === "1");

  const handleBooted = () => {
    sessionStorage.setItem("jarvis-booted", "1");
    setBooted(true);
  };

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    } else if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <>
      <AccessGate userEmail={user?.email}>
      <AnimatePresence>
        {!booted && <BootSequence onComplete={handleBooted} />}
      </AnimatePresence>

      {booted && (
        <Routes>
          <Route element={<HudLayout />}>
            <Route path="/" element={<Chat />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/decisions" element={<Decisions />} />
            <Route path="/memory" element={<Memory />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/memory-graph" element={<MemoryGraph />} />
            <Route path="/dossier" element={<Dossier />} />
            <Route path="/world-map" element={<WorldMap />} />
            <Route path="/commander" element={<Commander />} />
            <Route path="/intel" element={<IntelFeed />} />
            <Route path="/reports" element={<ReportGenerator />} />
            <Route path="/music" element={<MusicWidget />} />
            <Route path="/camera" element={<CameraWidget />} />
            <Route path="/map" element={<MapWidget />} />
            <Route path="/hardware" element={<HardwareControls />} />
            <Route path="/graph" element={<ConnectionGraph />} />
            <Route path="/mind" element={<MindOfJarvis />} />
            <Route path="/workspace" element={<InvestigativeWorkspace />} />
            <Route path="/findings" element={<OsintFindings />} />
            <Route path="/council" element={<CouncilRoom />} />
            <Route path="/iris-global" element={<IrisGlobal />} />
            <Route path="/voice-settings" element={<VoiceSettings />} />
            <Route path="/bulk-import" element={<BulkImport />} />
            <Route path="/automation" element={<AutomationHub />} />
            <Route path="/iris-command" element={<IrisCommand />} />
            <Route path="/intel-assets" element={<IntelAssets />} />
            <Route path="/osint-timeline" element={<OsintTimeline />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      )}
      </AccessGate>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;