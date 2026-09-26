import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { api } from '../api/client';
import { Network, Activity, Info, BarChart2, Sparkles, Layers } from 'lucide-react';

export const GraphView: React.FC = () => {
  const { startLocation, stops, trafficHour, optimizedResult } = useAppStore();
  const [graphData, setGraphData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const allNodes = startLocation ? [startLocation, ...stops] : stops;

  useEffect(() => {
    if (allNodes.length >= 2) {
      setIsLoading(true);
      api
        .buildGraph(allNodes, trafficHour)
        .then((data) => setGraphData(data))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [stops.length, startLocation, trafficHour]);

  if (allNodes.length < 2) {
    return (
      <div className="glass-surface p-12 text-center rounded-2xl border border-white/[0.08] space-y-2">
        <Network className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-slate-400 text-xs font-mono">
          Please add at least 2 locations to render the NetworkX topological graph.
        </p>
      </div>
    );
  }

  const analytics = graphData?.analytics || {
    num_nodes: allNodes.length,
    num_edges: allNodes.length * (allNodes.length - 1),
    graph_density: 1.0,
    avg_clustering_coeff: 0.85,
  };

  return (
    <div className="space-y-4">
      {/* 1. Topology KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-surface p-3.5 rounded-xl border border-white/[0.08]">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Vertices (|V|)</span>
          <div className="font-syne text-xl font-bold text-emerald-400">{analytics.num_nodes}</div>
        </div>
        <div className="glass-surface p-3.5 rounded-xl border border-white/[0.08]">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Edges (|E|)</span>
          <div className="font-syne text-xl font-bold text-indigo-400">{analytics.num_edges}</div>
        </div>
        <div className="glass-surface p-3.5 rounded-xl border border-white/[0.08]">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Density (D)</span>
          <div className="font-syne text-xl font-bold text-solar-400">
            {Number(analytics.graph_density).toFixed(2)}
          </div>
        </div>
        <div className="glass-surface p-3.5 rounded-xl border border-white/[0.08]">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Clustering (C)</span>
          <div className="font-syne text-xl font-bold text-emerald-300">
            {Number(analytics.avg_clustering_coeff).toFixed(3)}
          </div>
        </div>
      </div>

      {/* 2. SVG Circular Network Layout Visualizer */}
      <div className="glass-surface p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 className="font-syne font-bold text-xs text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Network className="w-4 h-4 text-emerald-400" /> NetworkX Topology Visualizer
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {allNodes.length} Nodes • Complete Directed Arcs
          </span>
        </div>

        <div className="flex justify-center my-4 overflow-x-auto">
          <svg className="w-[600px] h-[320px] max-w-full">
            {/* Draw Base Graph Edges */}
            {allNodes.map((_, i) => {
              const total = allNodes.length;
              const angleI = (i / total) * 2 * Math.PI;
              const x1 = 300 + 200 * Math.cos(angleI);
              const y1 = 160 + 100 * Math.sin(angleI);

              return allNodes.map((_, j) => {
                if (i >= j) return null;
                const angleJ = (j / total) * 2 * Math.PI;
                const x2 = 300 + 200 * Math.cos(angleJ);
                const y2 = 160 + 100 * Math.sin(angleJ);

                return (
                  <line
                    key={`${i}-${j}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                );
              });
            })}

            {/* Draw Highlighted Routes if optimized */}
            {optimizedResult &&
              (optimizedResult.routes?.markers || optimizedResult.markers || []).map((m: any, idx: number, arr: any[]) => {
                if (idx === arr.length - 1) return null;
                const total = allNodes.length || 1;
                const nextM = arr[idx + 1];
                const i = m.stop_idx ?? m.seq ?? idx;
                const j = nextM ? (nextM.stop_idx ?? nextM.seq ?? (idx + 1)) : i;

                const angleI = (i / total) * 2 * Math.PI;
                const x1 = 300 + 200 * Math.cos(angleI);
                const y1 = 160 + 100 * Math.sin(angleI);

                const angleJ = (j / total) * 2 * Math.PI;
                const x2 = 300 + 200 * Math.cos(angleJ);
                const y2 = 160 + 100 * Math.sin(angleJ);

                return (
                  <line
                    key={`route-${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeOpacity="0.9"
                  />
                );
              })}

            {/* Draw Nodes */}
            {allNodes.map((node, i) => {
              const total = allNodes.length;
              const angle = (i / total) * 2 * Math.PI;
              const x = 300 + 200 * Math.cos(angle);
              const y = 160 + 100 * Math.sin(angle);
              const isDepot = i === 0;

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isDepot ? 14 : 11}
                    fill={isDepot ? '#10b981' : '#6366f1'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y + 3.5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9px"
                    fontFamily="Syne"
                    fontWeight="bold"
                  >
                    {isDepot ? '★' : i}
                  </text>
                  <text
                    x={x}
                    y={y + 24}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9px"
                    fontFamily="JetBrains Mono"
                  >
                    {node.name.length > 12 ? `${node.name.slice(0, 10)}..` : node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default GraphView;
