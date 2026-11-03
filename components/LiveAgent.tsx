import React from "react";

export const LiveAgent: React.FC = () => (
  <div className="fixed bottom-6 right-6 z-40 max-w-xs rounded-2xl border border-white/10 bg-[#111]/95 p-4 shadow-2xl backdrop-blur">
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-gray-500" />
      <p className="text-xs font-bold uppercase tracking-widest text-gray-300">Voice assistant</p>
      <span className="ml-auto rounded bg-white/5 px-2 py-1 text-[9px] uppercase text-gray-500">Planned</span>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-gray-500">
      Voice is not enabled yet. It will require short-lived server-issued session credentials and explicit microphone controls.
    </p>
  </div>
);
