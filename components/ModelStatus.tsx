import React from "react";

export const ModelStatus: React.FC = () => (
  <section className="space-y-6">
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Provider configuration</p>
      <h2 className="mt-2 text-2xl font-bold text-white">AI model connection</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
        Forge currently routes chat requests through a server-side Gemini adapter. Provider credentials stay on the server and are never sent to the browser.
      </p>
    </div>
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">Google Gemini</h3>
          <p className="mt-1 text-xs text-gray-500">Model: gemini-2.5-flash · configured on the server</p>
        </div>
        <span className="rounded-lg bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">Verified on first request</span>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-gray-400">
        Add <code className="rounded bg-black/30 px-1.5 py-1 text-orange-300">GEMINI_API_KEY</code> to the deployment's server environment. The status shown here is configuration guidance, not a live provider health check.
      </p>
    </div>
    <div className="rounded-2xl border border-dashed border-white/10 p-6">
      <h3 className="font-semibold text-white">Local model runtimes</h3>
      <p className="mt-2 text-sm text-gray-500">Ollama and llama.cpp adapters are planned. No local model is currently detected or benchmarked by this application.</p>
    </div>
  </section>
);
