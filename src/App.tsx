import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { RoadmapProvider } from './context/RoadmapContext';
import { Header } from './components/Header/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { InfiniteCanvas } from './components/Canvas/InfiniteCanvas';
import { ExportModal } from './components/Modals/ExportModal';
import { MCPGuideModal } from './components/Modals/MCPGuideModal';
import { NewStageModal } from './components/Modals/NewStageModal';
import { NewRoadmapModal } from './components/Modals/NewRoadmapModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { AuthModal } from './components/Modals/AuthModal';

export const AppContent: React.FC = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMCPOpen, setIsMCPOpen] = useState(false);
  const [isNewStageOpen, setIsNewStageOpen] = useState(false);
  const [isNewRoadmapOpen, setIsNewRoadmapOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c0e17] text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        onOpenExport={() => setIsExportOpen(true)}
        onOpenMCPModal={() => setIsMCPOpen(true)}
      />

      {/* Main App Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          onOpenNewRoadmap={() => setIsNewRoadmapOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
        />

        {/* Infinite Canvas */}
        <InfiniteCanvas
          onOpenNewStage={() => setIsNewStageOpen(true)}
          onOpenNewRoadmap={() => setIsNewRoadmapOpen(true)}
        />
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
      <MCPGuideModal
        isOpen={isMCPOpen}
        onClose={() => setIsMCPOpen(false)}
      />
      <NewStageModal
        isOpen={isNewStageOpen}
        onClose={() => setIsNewStageOpen(false)}
      />
      <NewRoadmapModal
        isOpen={isNewRoadmapOpen}
        onClose={() => setIsNewRoadmapOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RoadmapProvider>
        <AppContent />
      </RoadmapProvider>
    </AuthProvider>
  );
}
