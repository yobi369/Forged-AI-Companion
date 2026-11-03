import React from "react";

const Capability: React.FC<{ title: string; status: "Implemented" | "Planned"; description: string }> = ({ title, status, description }) => (
  <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="font-semibold text-white">{title}</h3>
      <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${status === "Implemented" ? "bg-green-500/10 text-green-300" : "bg-white/5 text-gray-500"}`}>{status}</span>
    </div>
    <p className="text-sm leading-relaxed text-gray-400">{description}</p>
  </article>
);

export const ArchitectureView: React.FC = () => (
  <div className="space-y-8 pb-12">
    <section>
      <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Product architecture</p>
      <h2 className="mt-2 text-2xl font-bold text-white">A clear boundary between your workspace and AI providers</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400">
        Forge is being built as a local-first companion. The current implementation keeps provider credentials on the server and stores conversation history in the browser. Memory indexing, local inference, and project integrations are not connected yet.
      </p>
    </section>

    <section className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6">
      <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-gray-300">Implemented request path</h3>
      <div className="grid gap-3 md:grid-cols-4">
        {["React workspace", "Validated /api/chat", "Server-side Gemini adapter", "Provider response + sources"].map((step, index) => (
          <div key={step} className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
            <p className="text-[10px] font-mono text-orange-400">0{index + 1}</p>
            <p className="mt-2 text-sm font-medium text-gray-200">{step}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500">The request path is implemented in this branch. Provider availability is verified only when a request is made.</p>
    </section>

    <section className="grid gap-4 md:grid-cols-2">
      <Capability title="Server-side provider access" status="Implemented" description="Gemini requests are made through a server API route. The browser never receives the provider API key." />
      <Capability title="Bounded conversation context" status="Implemented" description="The API rejects unsupported roles, empty messages, oversized turns, and excessive conversation context." />
      <Capability title="Browser-local conversation history" status="Implemented" description="The current conversation is saved in this browser profile. It is not encrypted, synced, or backed up." />
      <Capability title="Persistent searchable memory" status="Planned" description="A user-controlled memory store with explicit capture, provenance, editing, retrieval, export, and deletion." />
      <Capability title="Local model runtimes" status="Planned" description="Optional Ollama and llama.cpp adapters with real health checks and capability discovery." />
      <Capability title="Project and Git context" status="Planned" description="Permissioned repository indexing with source citations, incremental updates, and explicit scope controls." />
    </section>

    <aside className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
      <h3 className="text-sm font-semibold text-yellow-200">Deployment safety</h3>
      <p className="mt-2 text-xs leading-relaxed text-gray-400">
        The chat endpoint is not ready for unrestricted public traffic. Authentication, shared rate limiting, per-user quotas, and production observability must be added before a public launch.
      </p>
    </aside>
  </div>
);
