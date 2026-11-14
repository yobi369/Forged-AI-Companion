import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { ArchitectureView } from "./components/ArchitectureView";
import { MemoryGraph } from "./components/MemoryGraph";
import { ModelStatus } from "./components/ModelStatus";
import { ChatInterface } from "./components/ChatInterface";
import { RoadmapView } from "./components/RoadmapView";
import { Terminal } from "./components/Terminal";
import { LiveAgent } from "./components/LiveAgent";
import { downloadWorkspaceBackup, importWorkspaceBackup } from "./services/workspaceBackup";

type Tab = "architecture" | "memory" | "models" | "roadmap";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("architecture");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [backupStatus, setBackupStatus] = useState("");

  const handleExport = async () => {
    try {
      await downloadWorkspaceBackup();
      setBackupStatus("Workspace backup exported. Keep the JSON file somewhere private.");
    } catch {
      setBackupStatus("Forge could not export the workspace. Check browser storage and try again.");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setBackupStatus("Backup file is too large. The maximum supported size is 5 MB.");
      return;
    }
    if (!window.confirm("Import this backup into the current workspace? Existing records will be kept; imported records will be added.")) return;
    try {
      const result = await importWorkspaceBackup(await file.text());
      setBackupStatus(`Imported ${result.conversations} conversations and ${result.memories} memories. Reload the workspace views to see the restored records.`);
    } catch (error) {
      setBackupStatus(error instanceof Error ? error.message : "Forge could not import this backup.");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a] text-[#e5e5e5]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex h-full min-w-0 flex-1 flex-col">
        <Header activeTab={activeTab} />

        <div className="relative flex-1 overflow-auto p-6">
          <div className="mx-auto flex h-full max-w-7xl flex-col">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Local workspace controls</p>
                {backupStatus && <p className="mt-1 max-w-2xl text-xs text-gray-400" role="status">{backupStatus}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void handleExport()}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 hover:border-orange-500/40 hover:text-white">
                  Export backup
                </button>
                <label htmlFor="forge-backup-import"
                  className="cursor-pointer rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-500">
                  Import backup
                </label>
                <input id="forge-backup-import" type="file" accept="application/json,.json" className="sr-only"
                  onChange={(event) => void handleImport(event)} />
              </div>
            </div>

            {activeTab === "architecture" && <ArchitectureView />}
            {activeTab === "memory" && <MemoryGraph />}
            {activeTab === "models" && <ModelStatus />}
            {activeTab === "roadmap" && <RoadmapView />}
          </div>
        </div>

        <Terminal />
      </main>

      <div className="hidden w-[400px] flex-col border-l border-white/10 bg-[#0d0d0d] lg:flex">
        <ChatInterface />
      </div>

      <LiveAgent />
    </div>
  );
};

export default App;
