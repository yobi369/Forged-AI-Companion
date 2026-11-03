
import React from 'react';

const ModelCard: React.FC<{
  name: string;
  role: string;
  status: 'active' | 'standby';
  specs: string;
  usage: number;
  color: string;
}> = ({ name, role, status, specs, usage, color }) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between hover:bg-white/[0.07] transition-all">
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'}`}>
          {status}
        </span>
      </div>
      <h4 className="text-lg font-bold text-white mb-1">{name}</h4>
      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">{role}</p>
      <div className="text-sm text-gray-400 font-mono bg-black/30 p-2 rounded border border-white/5">
        {specs}
      </div>
    </div>
    <div className="mt-6 space-y-2">
      <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
        <span>Active Load</span>
        <span>{usage}%</span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000`} style={{ width: `${usage}%`, backgroundColor: color.split(' ')[1]?.replace('bg-', '') || '#f97316' }}></div>
      </div>
    </div>
  </div>
);

export const ModelStatus: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Local Model Stack</h3>
        <button className="text-xs font-bold text-orange-500 hover:underline">Manage Weights</button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <ModelCard 
          name="DeepSeek-Coder-V3" 
          role="Reasoning & Architecture" 
          status="active" 
          specs="671B MoE • Q4_K_M • MLX" 
          usage={84} 
          color="bg-blue-600"
        />
        <ModelCard 
          name="Qwen-2.5-Coder-32B" 
          role="Refactoring & Feature Work" 
          status="active" 
          specs="32B • Q8_0 • Llama.cpp" 
          usage={12} 
          color="bg-purple-600"
        />
        <ModelCard 
          name="BGE-M3" 
          role="Vector Indexing" 
          status="active" 
          specs="Embedding Model • FP16" 
          usage={4} 
          color="bg-green-600"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h4 className="text-lg font-bold text-white mb-6">Performance Benchmarks (Local Device)</h4>
        <div className="space-y-6">
          <div className="flex items-center gap-8">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                <span>Tokens Per Second (Deep Reasoning)</span>
                <span>8.2 t/s</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[30%] h-full bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                <span>Tokens Per Second (Fast Autocomplete)</span>
                <span>92.4 t/s</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[90%] h-full bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-xs text-orange-200/70 leading-relaxed">
            <strong>Note on Latency:</strong> Autocomplete performance is optimized via Speculative Decoding using a 0.5B draft model. This allows near-instantaneous feedback while maintaining the intelligence of the 32B parent model.
          </div>
        </div>
      </div>
    </div>
  );
};
