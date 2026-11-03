import React from "react";

export const Terminal: React.FC = () => (
  <section className="flex h-32 shrink-0 flex-col border-t border-white/10 bg-[#050505] font-mono text-[10px]" aria-label="Runtime status">
    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2">
      <span className="font-bold uppercase tracking-widest text-gray-400">Runtime status</span>
      <span className="rounded bg-yellow-500/10 px-2 py-1 text-yellow-300">Telemetry not connected</span>
    </div>
    <div className="flex flex-1 items-center px-4 text-gray-500">
      No device metrics or background jobs are being reported. Live telemetry will appear here when a runtime agent is connected.
    </div>
  </section>
);
