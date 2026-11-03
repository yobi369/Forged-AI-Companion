
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export const MemoryGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 600;

    const data = {
      nodes: [
        { id: 'Forge Core', group: 1, size: 24, details: 'Main entry point and orchestrator.' },
        { id: 'Auth', group: 2, size: 14, details: 'JWT and Local storage management.' },
        { id: 'Inference', group: 2, size: 16, details: 'LLM bridge and quantization logic.' },
        { id: 'UI', group: 2, size: 14, details: 'React + Tailwind component library.' },
        { id: 'llama.cpp', group: 3, size: 8, details: 'The backbone for local weights.' },
        { id: 'BGE-M3', group: 3, size: 8, details: 'Embedding engine for project memory.' },
        { id: 'D3 Visuals', group: 3, size: 7, details: 'Graph rendering and interaction.' },
        { id: 'Gemini Bridge', group: 4, size: 10, details: 'High-level architectural reasoning.' },
      ],
      links: [
        { source: 'Forge Core', target: 'Auth' },
        { source: 'Forge Core', target: 'Inference' },
        { source: 'Forge Core', target: 'UI' },
        { source: 'Inference', target: 'llama.cpp' },
        { source: 'Inference', target: 'BGE-M3' },
        { source: 'UI', target: 'D3 Visuals' },
        { source: 'Forge Core', target: 'Gemini Bridge' },
      ]
    };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    const link = svg.append('g')
      .attr('stroke', '#222')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke-width', 2);

    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', (d: any) => d.size)
      .attr('fill', (d: any) => {
        if (d.group === 1) return '#ff5f00';
        if (d.group === 2) return '#3b82f6';
        if (d.group === 3) return '#8b5cf6';
        return '#10b981';
      })
      .attr('cursor', 'pointer')
      .on('click', (event, d) => setSelectedNode(d))
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    const labels = svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text((d: any) => d.id)
      .attr('font-size', '11px')
      .attr('dx', 18)
      .attr('dy', 4)
      .attr('fill', '#666')
      .attr('class', 'pointer-events-none font-medium');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, []);

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Project Memory Map</h3>
          <p className="text-sm text-gray-500">Live AST visualization of "forge-core"</p>
        </div>
      </div>
      
      <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl overflow-hidden relative shadow-inner">
        <svg ref={svgRef} className="w-full h-full"></svg>
        
        {selectedNode && (
          <div className="absolute top-6 right-6 w-72 p-6 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-white">{selectedNode.id}</h4>
              <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">&times;</button>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">{selectedNode.details}</p>
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Complexity Score</span>
                <span className="text-orange-500 font-mono">0.42</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Git Stability</span>
                <span className="text-green-500">High</span>
              </div>
              <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors">
                View Source AST
              </button>
            </div>
          </div>
        )}

        {!selectedNode && (
          <div className="absolute bottom-8 left-8 p-4 bg-white/5 backdrop-blur rounded-xl border border-white/10 text-[10px] text-gray-500 uppercase tracking-widest flex gap-4">
            <span>Scroll to Zoom</span>
            <span>Click nodes to explore</span>
          </div>
        )}
      </div>
    </div>
  );
};
