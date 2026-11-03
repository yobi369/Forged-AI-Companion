import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

type Node = { id: string; group: number; size: number; details: string };

export const MemoryGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const width = Math.max(svgRef.current.clientWidth, 320);
    const height = 520;
    const nodes: Node[] = [
      { id: "Workspace", group: 1, size: 24, details: "The user-facing Forge workspace. This is a conceptual product component." },
      { id: "Conversations", group: 2, size: 16, details: "Conversation history currently persists in browser local storage." },
      { id: "Provider API", group: 2, size: 16, details: "A server-side Gemini request adapter with bounded input validation." },
      { id: "Memory store", group: 3, size: 12, details: "Planned: an inspectable, editable, exportable, and deletable memory store." },
      { id: "Local models", group: 3, size: 12, details: "Planned: optional local model runtime adapters and health checks." },
      { id: "Project context", group: 3, size: 12, details: "Planned: permissioned repository indexing with source provenance." },
    ];
    const links = [
      { source: "Workspace", target: "Conversations" },
      { source: "Workspace", target: "Provider API" },
      { source: "Workspace", target: "Memory store" },
      { source: "Provider API", target: "Local models" },
      { source: "Conversations", target: "Project context" },
    ];

    const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]).attr("width", width).attr("height", height);
    svg.selectAll("*").remove();
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(125))
      .force("charge", d3.forceManyBody().strength(-420))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.08))
      .force("y", d3.forceY(height / 2).strength(0.08));

    const link = svg.append("g").attr("stroke", "#333").selectAll("line").data(links).join("line").attr("stroke-width", 1.5);
    const node = svg.append("g").selectAll("circle").data(nodes).join("circle")
      .attr("r", (d) => d.size)
      .attr("fill", (d) => d.group === 1 ? "#f97316" : d.group === 2 ? "#3b82f6" : "#737373")
      .attr("stroke", "#0a0a0a").attr("stroke-width", 2).attr("cursor", "pointer")
      .on("click", (_event, d) => setSelectedNode(d))
      .call(d3.drag<SVGCircleElement, Node>()
        .on("start", (event) => { if (!event.active) simulation.alphaTarget(0.25).restart(); event.subject.fx = event.subject.x; event.subject.fy = event.subject.y; })
        .on("drag", (event) => { event.subject.fx = event.x; event.subject.fy = event.y; })
        .on("end", (event) => { if (!event.active) simulation.alphaTarget(0); event.subject.fx = null; event.subject.fy = null; }));
    const labels = svg.append("g").selectAll("text").data(nodes).join("text")
      .text((d) => d.id).attr("font-size", "11px").attr("dx", 18).attr("dy", 4).attr("fill", "#aaa").attr("pointer-events", "none");

    simulation.on("tick", () => {
      link.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      labels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    });
    return () => simulation.stop();
  }, []);

  return (
    <section className="flex h-full min-h-[520px] flex-col">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Conceptual architecture</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Forge knowledge map</h2>
        <p className="mt-2 text-sm text-gray-500">Illustrative product components—not a live AST, indexed repository, or persistent memory graph.</p>
      </div>
      <div className="relative min-h-[520px] flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
        <svg ref={svgRef} className="h-full min-h-[520px] w-full" />
        {selectedNode && (
          <div className="absolute right-4 top-4 w-64 rounded-2xl border border-white/10 bg-[#111]/95 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white">{selectedNode.id}</h3>
              <button onClick={() => setSelectedNode(null)} aria-label="Close details" className="text-gray-400 hover:text-white">×</button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-400">{selectedNode.details}</p>
          </div>
        )}
        <p className="absolute bottom-4 left-4 rounded-lg bg-black/70 px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500">Select a node to inspect · Drag to rearrange</p>
      </div>
    </section>
  );
};
