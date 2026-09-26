import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';

interface NodeItem {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'depot' | 'stop';
  demand?: number;
}

interface EdgeItem {
  from: string;
  to: string;
  weight: string;
  congestion: number; // 0..100
  routeColor?: string;
  isVehicleRoute?: boolean;
}

export const NetworkGraphView: React.FC = () => {
  const { isOptimizing, activeHazards } = useAppStore();
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [photonOffset, setPhotonOffset] = useState(0);

  // Layout positions in percentage (0 to 100 viewBox coordinate space: 800 x 500)
  const nodes: NodeItem[] = [
    { id: 'D', label: 'D', x: 260, y: 180, type: 'depot', demand: 0 },
    { id: 'N1', label: 'N1', x: 410, y: 130, type: 'stop', demand: 2 },
    { id: 'E1', label: 'E1', x: 550, y: 150, type: 'stop', demand: 3 },
    { id: 'W1', label: 'W1', x: 220, y: 310, type: 'stop', demand: 2 },
    { id: 'C', label: 'C', x: 350, y: 290, type: 'stop', demand: 4 },
    { id: 'T', label: 'T', x: 490, y: 260, type: 'stop', demand: 1 },
    { id: 'H', label: 'H', x: 600, y: 320, type: 'stop', demand: 2 },
    { id: 'TR', label: 'TR', x: 420, y: 440, type: 'stop', demand: 3 },
    { id: 'S1', label: 'S1', x: 270, y: 450, type: 'stop', demand: 2 },
  ];

  // Edges connecting nodes with minute weights & active vehicle route colors
  const edges: EdgeItem[] = [
    // Vehicle 1 Route (Cyan): D -> N1 -> C -> TR
    { from: 'D', to: 'N1', weight: '8m', congestion: 22, routeColor: '#00f0ff', isVehicleRoute: true },
    { from: 'N1', to: 'C', weight: '7m', congestion: 35, routeColor: '#00f0ff', isVehicleRoute: true },
    { from: 'C', to: 'TR', weight: '12m', congestion: 28, routeColor: '#00f0ff', isVehicleRoute: true },

    // Vehicle 3 Route (Amber): D -> C -> T -> H
    { from: 'D', to: 'C', weight: '10m', congestion: 45, routeColor: '#ffb700', isVehicleRoute: true },
    { from: 'C', to: 'T', weight: '11m', congestion: 54, routeColor: '#ffb700', isVehicleRoute: true },
    { from: 'T', to: 'H', weight: '7m', congestion: 68, routeColor: '#ffb700', isVehicleRoute: true },

    // Vehicle 4 Route (Purple): D -> W1 -> S1
    { from: 'D', to: 'W1', weight: '9m', congestion: 18, routeColor: '#bf5af2', isVehicleRoute: true },
    { from: 'W1', to: 'S1', weight: '14m', congestion: 41, routeColor: '#bf5af2', isVehicleRoute: true },

    // Background Network Edges
    { from: 'N1', to: 'E1', weight: '12m', congestion: 15 },
    { from: 'E1', to: 'H', weight: '9m', congestion: 25 },
    { from: 'N1', to: 'T', weight: '15m', congestion: 83 },
    { from: 'W1', to: 'C', weight: '14m', congestion: 30 },
    { from: 'T', to: 'TR', weight: '13m', congestion: 40 },
    { from: 'H', to: 'TR', weight: '10m', congestion: 19 },
    { from: 'S1', to: 'TR', weight: '16m', congestion: 33 },
  ];

  // Animate photon particles continuously
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setPhotonOffset((prev) => (prev + 0.008) % 1);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const getNode = (id: string) => nodes.find((n) => n.id === id);

  return (
    <div className="relative w-full h-full bg-[#040711] overflow-hidden select-none">
      {/* Corner HUD Reticles */}
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />

      {/* SVG Canvas */}
      <svg
        viewBox="150 70 520 420"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Glowing Filters */}
          <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-mint" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-amber" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-purple" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Base Inactive Network Edges */}
        {edges
          .filter((e) => !e.isVehicleRoute)
          .map((edge, idx) => {
            const fromNode = getNode(edge.from);
            const toNode = getNode(edge.to);
            if (!fromNode || !toNode) return null;

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            return (
              <g key={`bg-edge-${idx}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#121e33"
                  strokeWidth="1.5"
                />
                <text
                  x={midX}
                  y={midY - 4}
                  fill="#3d5070"
                  fontSize="9"
                  fontFamily="Share Tech Mono, monospace"
                  textAnchor="middle"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

        {/* 2. Active Vehicle Optimal Route Edges */}
        {edges
          .filter((e) => e.isVehicleRoute)
          .map((edge, idx) => {
            const fromNode = getNode(edge.from);
            const toNode = getNode(edge.to);
            if (!fromNode || !toNode) return null;

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            const strokeColor = edge.routeColor || '#00f0ff';

            // Photon particle position along this edge
            const curX = fromNode.x + (toNode.x - fromNode.x) * photonOffset;
            const curY = fromNode.y + (toNode.y - fromNode.y) * photonOffset;

            return (
              <g key={`route-edge-${idx}`}>
                {/* Glow underlay */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={strokeColor}
                  strokeWidth="4"
                  strokeOpacity="0.25"
                />
                {/* Dashed Vehicle Line */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={strokeColor}
                  strokeWidth="2.2"
                  strokeDasharray="6 4"
                  className="animate-flow-dash"
                />

                {/* Animated Photon Quantum Particle */}
                <circle
                  cx={curX}
                  cy={curY}
                  r="3.5"
                  fill="#ffffff"
                  filter={strokeColor === '#00f0ff' ? 'url(#glow-cyan)' : strokeColor === '#ffb700' ? 'url(#glow-amber)' : 'url(#glow-purple)'}
                />

                {/* Minute weight text */}
                <rect
                  x={midX - 10}
                  y={midY - 9}
                  width="20"
                  height="11"
                  fill="#040711"
                  opacity="0.8"
                />
                <text
                  x={midX}
                  y={midY}
                  fill={strokeColor}
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="Share Tech Mono, monospace"
                  textAnchor="middle"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

        {/* 3. Render Nodes */}
        {nodes.map((node) => {
          const isDepot = node.type === 'depot';
          const isSelected = selectedNode?.id === node.id;

          if (isDepot) {
            // Central Depot D with Glowing Cyan Diamond/Circle Halo
            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                {/* Outer pulsing ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="26"
                  fill="#00f0ff"
                  fillOpacity="0.08"
                  className="animate-ping"
                  style={{ animationDuration: '3s' }}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill="#00f0ff"
                  fillOpacity="0.15"
                />
                {/* Diamond backdrop */}
                <polygon
                  points={`${node.x},${node.y - 18} ${node.x + 18},${node.y} ${node.x},${node.y + 18} ${node.x - 18},${node.y}`}
                  fill="#00f0ff"
                  fillOpacity="0.25"
                  stroke="#00f0ff"
                  strokeWidth="1.5"
                />
                {/* Core node */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="13"
                  fill="#00f0ff"
                  filter="url(#glow-cyan)"
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  fill="#040711"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="Share Tech Mono, monospace"
                  textAnchor="middle"
                >
                  D
                </text>
                <text
                  x={node.x}
                  y={node.y - 22}
                  fill="#00f0ff"
                  fontSize="10"
                  fontFamily="Share Tech Mono, monospace"
                  textAnchor="middle"
                >
                  DEPOT
                </text>
              </g>
            );
          }

          // Delivery Nodes (Green Halo Rings with letter code)
          return (
            <g
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="cursor-pointer group"
            >
              {/* Outer soft glow ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r="16"
                fill="#00ff9d"
                fillOpacity="0.08"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r="11"
                fill="#060a16"
                stroke="#00ff9d"
                strokeWidth="2"
                filter="url(#glow-mint)"
              />
              <text
                x={node.x}
                y={node.y + 3.5}
                fill="#00ff9d"
                fontSize="9"
                fontWeight="bold"
                fontFamily="Share Tech Mono, monospace"
                textAnchor="middle"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Node Details Card on Click */}
      {selectedNode && (
        <div className="absolute top-3 right-3 bg-[#060a16]/95 border border-[#1a2f52] p-3 rounded text-xs font-mono shadow-2xl z-20 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#00f0ff] font-bold">Node [{selectedNode.id}]</span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            Type: <span className="text-white uppercase">{selectedNode.type}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Demand: <span className="text-[#00ff9d]">{selectedNode.demand || 0} kg</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraphView;
