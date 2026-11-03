import React from "react";

interface HeaderProps {
  activeTab: string;
}

const labels: Record<string, string> = {
  architecture: "Overview",
  memory: "Memory map",
  models: "AI providers",
  roadmap: "Product roadmap",
};

export const Header: React.FC<HeaderProps> = ({ activeTab }) => (
  <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-[#0a0a0a]/90 px-6 backdrop-blur-md">
    <div className="flex min-w-0 items-center gap-3">
      <h2 className="truncate text-lg font-semibold text-white">{labels[activeTab] || activeTab}</h2>
      <span className="hidden rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-gray-500 sm:inline">Forge workspace</span>
    </div>
    <div className="flex items-center gap-2 text-[10px] text-gray-500">
      <span className="h-2 w-2 rounded-full bg-yellow-500" />
      Provider status checked on request
    </div>
  </header>
);
