import React from "react";

const Stage: React.FC<{ title: string; status: "In progress" | "Planned"; description: string; items: string[] }> = ({ title, status, description, items }) => (
  <section className="relative border-l border-white/10 pb-10 pl-7 last:pb-0">
    <span className={`absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 ${status === "In progress" ? "border-orange-500 bg-orange-500" : "border-gray-600 bg-[#0a0a0a]"}`} />
    <div className="flex flex-wrap items-center gap-3">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${status === "In progress" ? "bg-orange-500/10 text-orange-300" : "bg-white/5 text-gray-500"}`}>{status}</span>
    </div>
    <p className="mt-2 max-w-2xl text-sm text-gray-400">{description}</p>
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {items.map((item) => <li key={item} className="flex items-start gap-2 text-xs text-gray-300"><span className="mt-0.5 text-orange-400">•</span>{item}</li>)}
    </ul>
  </section>
);

export const RoadmapView: React.FC = () => (
  <div className="max-w-4xl pb-12">
    <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Delivery plan</p>
    <h2 className="mt-2 text-2xl font-bold text-white">From foundation to dependable companion</h2>
    <p className="mb-8 mt-3 text-sm leading-relaxed text-gray-400">Statuses reflect the repository implementation, not aspirational milestones. Dates will be added when delivery commitments are agreed.</p>
    <Stage title="Foundation and secure chat" status="In progress" description="Establish the server-side provider boundary and honest product status." items={["Server-side Gemini chat route", "Bounded request validation", "Browser-local conversation history", "Baseline tests and CI", "Remove fabricated runtime and benchmark claims"]} />
    <Stage title="Personal workspace and memory" status="Planned" description="Make Forge useful across multiple projects and sessions, with user control over retained context." items={["Conversation list and management", "IndexedDB workspace persistence", "Explicit memory capture and review", "Memory search with provenance", "Export, import, and deletion controls"]} />
    <Stage title="Providers and project context" status="Planned" description="Connect real local runtimes and selected project sources through explicit permissions." items={["Provider adapter interface", "Ollama and llama.cpp integrations", "Repository indexing and citations", "Project-scoped context retrieval", "Provider diagnostics and usage controls"]} />
    <Stage title="Private beta and production" status="Planned" description="Add the controls required to safely operate a multi-user service." items={["Authentication and authorization", "Shared rate limits and per-user quotas", "Encrypted sync and backup/restore", "Privacy-safe monitoring and incident response", "Security review and accessibility testing"]} />
  </div>
);
