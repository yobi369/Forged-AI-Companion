
import React from 'react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-white">System Design: Forge Engine</h3>
        <p className="text-gray-400 max-w-3xl leading-relaxed">
          Forge is architected as a "Forever Context" engine. Unlike standard RAG systems, Forge maintains a 
          <strong> hierarchical, semantic, and temporal model</strong> of your code. It doesn't just search for text; 
          it understands your project's soul.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" /></svg>
          </div>
          <h4 className="text-lg font-bold text-white">Hierarchical Ingestion</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            Uses <strong>Tree-sitter</strong> for semantic parsing of ASTs. Every function, class, and variable is 
            indexed with its scope and call-graph relationships. It tracks "Semantic Drift" across git history 
            to understand how architecture evolves over time.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h4 className="text-lg font-bold text-white">Multi-Layer Retrieval</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            Combines <strong>Dense Vector Search</strong> (BGE-M3) for semantic similarity with <strong>Graph Traversal</strong> 
            for structural context. A "Project Atlas" summarization layer caches high-level architectural decisions 
            to reduce LLM token overhead.
          </p>
        </div>
      </div>

      <section className="space-y-6">
        <h4 className="text-xl font-bold text-white border-l-4 border-orange-500 pl-4">The Local Inference Pipeline</h4>
        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden font-mono text-xs">
          <div className="p-4 bg-white/5 border-b border-white/10 flex gap-4 text-gray-500">
            <span>PIPELINE_DEFINITION.yml</span>
            <span>INFERENCE_CONFIG.json</span>
          </div>
          <pre className="p-6 text-orange-200/80 leading-6">
{`# Forge Inference Spec 2025
inference_stack:
  - engine: llama.cpp (NVIDIA/AMD/CPU)
  - engine: MLX (Apple Silicon Unified Memory)
  - technique: Speculative Decoding (Qwen-0.5B draft -> DeepSeek-V3 671B target)

model_routing:
  fast_path: 
    model: Qwen-2.5-Coder-7B (Q8_0)
    trigger: autocomplete, small edits, docstrings
  deep_path:
    model: DeepSeek-Coder-V3 (Q4_K_M)
    trigger: architectural changes, complex debugging, refactors

optimizations:
  - Flash Attention 2
  - Sliding Window Context (128k supported)
  - KV Cache Quantization (4-bit)`}
          </pre>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-widest block mb-2">Privacy</span>
          <p className="text-sm text-gray-300">0% Cloud. All telemetry and weights live on local disk. Encrypted at rest.</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <span className="text-blue-500 text-xs font-bold uppercase tracking-widest block mb-2">Git Aware</span>
          <p className="text-sm text-gray-300">Semantic diffing understands intent behind commits, not just line changes.</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <span className="text-purple-500 text-xs font-bold uppercase tracking-widest block mb-2">Learned Style</span>
          <p className="text-sm text-gray-300">Self-refining LoRA weights adapt to your variable naming and testing patterns.</p>
        </div>
      </div>
    </div>
  );
};
