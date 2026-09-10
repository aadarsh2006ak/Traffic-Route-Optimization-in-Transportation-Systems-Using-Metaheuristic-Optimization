import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { api } from '../api/client';
import { Network, Activity, Info, BarChart2 } from 'lucide-react';

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
      <div className="glass-panel p-8 text-center rounded-xl">
        <Network className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <p className="text-gray-400 font-roboto text-xs">
          Please add at least 2 stops in the Route Optimizer sidebar to build the NetworkX graph.
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
        <div className="glass-panel p-3 rounded-xl">
          <span className="text-[10px] text-gray-400 uppercase font-mono">Vertices (|V|)</span>
          <div className="font-orbitron text-xl font-bold text-cyber-cyan">{analytics.num_nodes}</div>
        </div>
        <div className="glass-panel p-3 rounded-xl">
          <span className="text-[10px] text-gray-400 uppercase font-mono">Directed Arcs (|E|)</span>
          <div className="font-orbitron text-xl font-bold text-cyber-orange">{analytics.num_edges}</div>
        </div>
        <div className="glass-panel p-3 rounded-xl">
          <span className="text-[10px] text-gray-400 uppercase font-mono">Graph Density</span>
          <div className="font-orbitron text-xl font-bold text-cyber-neonPurple">{analytics.graph_density}</div>
        </div>
        <div className="glass-panel p-3 rounded-xl">
          <span className="text-[10px] text-gray-400 uppercase font-mono">Clustering Coeff</span>
          <div className="font-orbitron text-xl font-bold text-cyber-green">{analytics.avg_clustering_coeff}</div>
        </div>
      </div>

      {/* 2. Interactive SVG Graph Canvas */}
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron text-xs text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Network className="w-4 h-4 text-cyan-400" /> NetworkX Directed Topology G=(V,E,W)
          </h3>
          <span className="text-[10px] text-gray-400 font-mono">Edges weighted by d_ij + θ(t)·t_ij</span>
        </div>

        <div className="w-full h-80 bg-[#050711] border border-cyan-500/20 rounded-lg relative overflow-hidden flex items-center justify-center p-4">
          <svg className="w-full h-full" viewBox="0 0 600 300">
            {/* Draw Directed Edges */}
            {allNodes.map((_, i) => {
              const total = allNodes.length;
              const angleI = (i / total) * 2 * Math.PI;
              const x1 = 300 + 200 * Math.cos(angleI);
              const y1 = 150 + 100 * Math.sin(angleI);

              return allNodes.map((_, j) => {
                if (i >= j) return null;
                const angleJ = (j / total) * 2 * Math.PI;
                const x2 = 300 + 200 * Math.cos(angleJ);
                const y2 = 150 + 100 * Math.sin(angleJ);

                return (
                  <line
                    key={`${i}-${j}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#1f2937"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.6"
                  />
                );
              });
            })}

            {/* Draw Highlighted Routes if optimized */}
            {optimizedResult &&
              optimizedResult.routes.markers.map((m, idx, arr) => {
                if (idx === arr.length - 1) return null;
                const total = allNodes.length;
                const nextM = arr[idx + 1];
                const i = m.stop_idx;
                const j = nextM.stop_idx;

                const angleI = (i / total) * 2 * Math.PI;
                const x1 = 300 + 200 * Math.cos(angleI);
                const y1 = 150 + 100 * Math.sin(angleI);

                const angleJ = (j / total) * 2 * Math.PI;
                const x2 = 300 + 200 * Math.cos(angleJ);
                const y2 = 150 + 100 * Math.sin(angleJ);

                return (
                  <line
                    key={`route-${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#00f3ff"
                    strokeWidth="2.5"
                    opacity="0.9"
                  />
                );
              })}

            {/* Draw Nodes */}
            {allNodes.map((node, i) => {
              const total = allNodes.length;
              const angle = (i / total) * 2 * Math.PI;
              const x = 300 + 200 * Math.cos(angle);
              const y = 150 + 100 * Math.sin(angle);
              const isHub = i === 0;

              return (
                <g key={i} className="cursor-pointer group">
                  <circle
                    cx={x}
                    cy={y}
                    r={isHub ? 14 : 10}
                    fill={isHub ? '#064e3b' : '#111827'}
                    stroke={isHub ? '#00e676' : '#00f3ff'}
                    strokeWidth={isHub ? 2.5 : 1.5}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    fill="white"
                    fontSize={isHub ? '10' : '8'}
                    fontFamily="Orbitron"
                    textAnchor="middle"
                  >
                    {isHub ? 'HUB' : i}
                  </text>
                  <text
                    x={x}
                    y={y + 22}
                    fill="#9ca3af"
                    fontSize="8"
                    fontFamily="Roboto"
                    textAnchor="middle"
                  >
                    {node.name.split(',')[0].slice(0, 14)}
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
