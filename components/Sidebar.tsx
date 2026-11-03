import React from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, toggleSidebar }) => {
  const tabs = [
    { id: "architecture", label: "Overview", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
    { id: "memory", label: "Memory", icon: "M12 3v18m9-9H3m15.36-6.36-12.72 12.72m0-12.72 12.72 12.72" },
    { id: "models", label: "AI Providers", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "roadmap", label: "Roadmap", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" },
  ];

  return (
    <aside className={`flex shrink-0 flex-col border-r border-white/10 bg-[#0d0d0d] transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}>
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20">F</div>
        {isOpen && <span className="text-lg font-bold tracking-tight text-white">FORGE <span className="font-mono text-xs text-orange-500">0.1</span></span>}
      </div>
      <nav className="mt-4 flex-1 space-y-2 px-3" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? "page" : undefined} title={!isOpen ? tab.label : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${activeTab === tab.id ? "bg-orange-500/10 text-orange-400" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
            <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
            {isOpen && <span className="text-sm font-medium">{tab.label}</span>}
          </button>
        ))}
      </nav>
      <div className="border-t border-white/5 p-4">
        <button type="button" onClick={toggleSidebar} className="w-full rounded-xl bg-white/5 p-3 text-left text-xs text-gray-500 hover:text-white" aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}>
          {isOpen ? "Collapse navigation" : "Expand"}
        </button>
      </div>
    </aside>
  );
};
