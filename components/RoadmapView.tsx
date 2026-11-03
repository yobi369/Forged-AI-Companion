
import React from 'react';

const Milestone: React.FC<{ 
  title: string; 
  date: string; 
  description: string; 
  items: string[]; 
  completed?: boolean 
}> = ({ title, date, description, items, completed }) => (
  <div className="relative pl-8 pb-12">
    <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-2 ${completed ? 'bg-orange-500 border-orange-500' : 'bg-[#0a0a0a] border-white/20'}`}></div>
    <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-white/10"></div>
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h4 className="text-lg font-bold text-white">{title}</h4>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{date}</span>
      </div>
      <p className="text-sm text-gray-400 max-w-2xl">{description}</p>
      <ul className="grid grid-cols-2 gap-2 mt-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
            <svg className={`w-3 h-3 ${completed ? 'text-orange-500' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export const RoadmapView: React.FC = () => {
  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h3 className="text-2xl font-bold text-white mb-8">Development Roadmap: Forge Core</h3>
      
      <div className="mt-8">
        <Milestone 
          title="Phase 1: Foundations" 
          date="Month 1-2" 
          description="Build the base local inference engine and the initial semantic indexer."
          items={[
            "Llama.cpp integration",
            "Tree-sitter AST parser",
            "Semantic memory v1",
            "IDE plugin (VS Code)"
          ]}
          completed
        />
        <Milestone 
          title="Phase 2: Deep Context" 
          date="Month 3-4" 
          description="Implementing hierarchical summarization and git-aware temporal retrieval."
          items={[
            "Git history semantic diffing",
            "Project-wide summarization",
            "Multi-hop graph retrieval",
            "Speculative decoding"
          ]}
        />
        <Milestone 
          title="Phase 3: Autonomous Refactoring" 
          date="Month 5-6" 
          description="Enabling complex, multi-file changes and deep debugging capabilities."
          items={[
            "Agentic feature delegation",
            "Self-healing CI integration",
            "Advanced LoRA fine-tuning",
            "Forge Desktop CLI/GUI"
          ]}
        />
      </div>

      <div className="mt-12 p-8 rounded-2xl bg-orange-500/10 border border-orange-500/20">
        <h4 className="text-lg font-bold text-orange-400 mb-4">Critical Risks & Mitigations</h4>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <p className="font-bold text-white">1. VRAM Constraints</p>
            <p className="text-gray-400 text-xs">Mitigation: Intelligent model offloading and 4-bit KV cache quantization.</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-white">2. Semantic Drift</p>
            <p className="text-gray-400 text-xs">Mitigation: Incremental graph updates on every git commit to maintain index freshness.</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-white">3. Cold Start Performance</p>
            <p className="text-gray-400 text-xs">Mitigation: Background indexing and optimized binary formats for the memory graph.</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-white">4. Token Consumption</p>
            <p className="text-gray-400 text-xs">Mitigation: Context compression via LLM-summarized "skeletons" of the codebase.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
