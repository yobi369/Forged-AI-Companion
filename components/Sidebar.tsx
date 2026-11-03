
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, toggleSidebar }) => {
  const tabs = [
    { id: 'architecture', label: 'Architecture', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'memory', label: 'Memory Graph', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'models', label: 'Model Stack', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
    { id: 'roadmap', label: 'Roadmap', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  return (
    <div className={`transition-all duration-300 border-r border-white/10 bg-[#0d0d0d] flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">F</div>
        {isOpen && <span className="font-bold text-lg tracking-tight">FORGE <span className="text-xs text-orange-500 font-mono">v1.0</span></span>}
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-orange-500/10 text-orange-500 shadow-sm' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {isOpen && <span className="font-medium text-sm">{tab.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 text-xs text-gray-500 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Local Node: rtx-4090-dev</span>
        </div>
      </div>
    </div>
  );
};
