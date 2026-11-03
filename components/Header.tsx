
import React from 'react';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  return (
    <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold capitalize text-white tracking-tight">{activeTab.replace('-', ' ')}</h2>
        <div className="h-4 w-px bg-white/10 mx-2"></div>
        <div className="text-xs font-mono text-gray-500 flex items-center gap-2">
          <span className="text-blue-400">~/projects/forge-core</span>
          <span className="text-gray-700">•</span>
          <span className="text-green-400">main</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex flex-col items-end">
            <span className="text-gray-500">GPU VRAM</span>
            <span className="text-white">18.4 / 24.0 GB</span>
          </div>
          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="w-[76%] h-full bg-orange-500 rounded-full"></div>
          </div>
        </div>
        
        <button className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-orange-500 hover:text-white transition-all shadow-sm">
          Run Re-Index
        </button>
      </div>
    </header>
  );
};
