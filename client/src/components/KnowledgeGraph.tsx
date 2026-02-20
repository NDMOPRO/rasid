/**
 * KnowledgeGraph — Interactive knowledge graph visualization.
 * Renders nodes and edges using SVG with force-directed layout simulation.
 */
import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GraphNode {
  id: string;
  label: string;
  type?: string;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  weight?: number;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  className?: string;
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
}

const TYPE_COLORS: Record<string, string> = {
  entity: "#06b6d4",
  concept: "#8b5cf6",
  action: "#10b981",
  category: "#f59e0b",
  alert: "#ef4444",
  default: "#6366f1",
};

function simpleForceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  iterations = 50
): GraphNode[] {
  const positioned = nodes.map((n, i) => ({
    ...n,
    x: n.x ?? width / 2 + (Math.cos((2 * Math.PI * i) / nodes.length) * width * 0.35),
    y: n.y ?? height / 2 + (Math.sin((2 * Math.PI * i) / nodes.length) * height * 0.35),
    vx: 0,
    vy: 0,
  }));

  const nodeMap = new Map(positioned.map((n) => [n.id, n]));

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;

    // Repulsion between all nodes
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const a = positioned[i];
        const b = positioned[j];
        const dx = b.x! - a.x!;
        const dy = b.y! - a.y!;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (300 * alpha) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x! - a.x!;
      const dy = b.y! - a.y!;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist - 120) * 0.01 * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Center gravity
    for (const node of positioned) {
      node.vx += (width / 2 - node.x!) * 0.001 * alpha;
      node.vy += (height / 2 - node.y!) * 0.001 * alpha;
    }

    // Apply velocities with damping
    for (const node of positioned) {
      node.x! += node.vx * 0.8;
      node.y! += node.vy * 0.8;
      node.vx *= 0.5;
      node.vy *= 0.5;
      // Keep within bounds
      node.x = Math.max(40, Math.min(width - 40, node.x!));
      node.y = Math.max(40, Math.min(height - 40, node.y!));
    }
  }

  return positioned;
}

export function KnowledgeGraph({
  nodes,
  edges,
  className,
  width = 800,
  height = 500,
  onNodeClick,
}: KnowledgeGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const positionedNodes = useMemo(
    () => simpleForceLayout(nodes, edges, width, height),
    [nodes, edges, width, height]
  );

  const nodeMap = useMemo(
    () => new Map(positionedNodes.map((n) => [n.id, n])),
    [positionedNodes]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      setSelectedNode(node.id === selectedNode ? null : node.id);
      onNodeClick?.(node);
    },
    [selectedNode, onNodeClick]
  );

  return (
    <div className={cn("relative rounded-xl bg-slate-900/50 border border-white/10 overflow-hidden", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ minHeight: 300 }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Edges */}
        {edges.map((edge, i) => {
          const source = nodeMap.get(edge.source);
          const target = nodeMap.get(edge.target);
          if (!source || !target) return null;
          const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
          return (
            <g key={`edge-${i}`}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? "rgba(6,182,212,0.6)" : "rgba(255,255,255,0.1)"}
                strokeWidth={isHighlighted ? 2 : 1}
                className="transition-all duration-300"
              />
              {edge.label && (
                <text
                  x={(source.x! + target.x!) / 2}
                  y={(source.y! + target.y!) / 2 - 5}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {positionedNodes.map((node) => {
          const nodeSize = node.size || 20;
          const color = node.color || TYPE_COLORS[node.type || "default"] || TYPE_COLORS.default;
          const isHovered = hoveredNode === node.id;
          const isSelected = selectedNode === node.id;

          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(node)}
            >
              {/* Glow ring */}
              {(isHovered || isSelected) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize + 8}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  opacity="0.4"
                  filter="url(#glow)"
                />
              )}
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeSize}
                fill={`${color}33`}
                stroke={color}
                strokeWidth={isSelected ? 3 : 1.5}
                className="transition-all duration-200"
              />
              {/* Node label */}
              <text
                x={node.x}
                y={node.y! + nodeSize + 16}
                fill="rgba(255,255,255,0.8)"
                fontSize="11"
                textAnchor="middle"
                fontFamily="Tajawal, sans-serif"
              >
                {node.label}
              </text>
              {/* Type badge */}
              {node.type && (
                <text
                  x={node.x}
                  y={node.y! + 4}
                  fill="rgba(255,255,255,0.9)"
                  fontSize="9"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {node.type.charAt(0).toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default KnowledgeGraph;
