"use client";

import { useCallback, useState } from "react";
import { Background, Controls, Edge, Handle, MiniMap, Node, NodeProps, Position, ReactFlow } from "@xyflow/react";
import { Network, Route } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { Button, Panel, PanelHeader, ProvenanceBadge, SourceFooter, StatusBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type ComponentData = { label: string; kind: string; status: "healthy" | "warning" | "critical"; source: string; protocol: string; address: string; [key: string]: unknown };

const baseNodes: Node<ComponentData>[] = [
  { id: "chainlink", position: { x: 0, y: 120 }, data: { label: "CHAINLINK", kind: "External provider", status: "healthy", source: "SIMULATION", protocol: "Chainlink", address: "—" }, type: "component" },
  { id: "oracle", position: { x: 230, y: 120 }, data: { label: "ORACLE", kind: "Price feed", status: "warning", source: "SIMULATION", protocol: "Aave market model", address: "—" }, type: "component" },
  { id: "market", position: { x: 460, y: 120 }, data: { label: "AAVE MARKET", kind: "Lending market", status: "healthy", source: "SIMULATION", protocol: "Aave", address: "—" }, type: "component" },
  { id: "collateral", position: { x: 690, y: 40 }, data: { label: "COLLATERAL", kind: "Risk component", status: "healthy", source: "SIMULATION", protocol: "Aave", address: "—" }, type: "component" },
  { id: "borrow", position: { x: 690, y: 200 }, data: { label: "BORROWING", kind: "Position layer", status: "healthy", source: "SIMULATION", protocol: "Aave", address: "—" }, type: "component" },
  { id: "liquidity", position: { x: 920, y: 120 }, data: { label: "USDC LIQUIDITY", kind: "Asset liquidity", status: "healthy", source: "SIMULATION", protocol: "Aave", address: "—" }, type: "component" },
  { id: "liquidation", position: { x: 920, y: 280 }, data: { label: "LIQUIDATION", kind: "Safety mechanism", status: "healthy", source: "SIMULATION", protocol: "Aave", address: "—" }, type: "component" },
];
const baseEdges: Edge[] = [
  { id: "e1", source: "chainlink", target: "oracle", animated: true }, { id: "e2", source: "oracle", target: "market", animated: true },
  { id: "e3", source: "market", target: "collateral" }, { id: "e4", source: "market", target: "borrow" }, { id: "e5", source: "collateral", target: "liquidity" },
  { id: "e6", source: "borrow", target: "liquidity" }, { id: "e7", source: "borrow", target: "liquidation" }, { id: "e8", source: "oracle", target: "liquidation" },
];

function ComponentNode({ data, selected }: NodeProps<Node<ComponentData>>) {
  return <div className={cn("min-w-[150px] border bg-[#0c0f0d] shadow-xl transition-colors", data.status === "critical" ? "border-danger" : data.status === "warning" ? "border-amber" : selected ? "border-signal" : "border-[#3a403a]")}>
    <Handle type="target" position={Position.Left} className="!h-1.5 !w-1.5 !border-0 !bg-[#777d77]" /><div className="border-b border-line px-3 py-2 font-mono text-[8px] uppercase tracking-wider text-muted">{data.kind}</div><div className="flex items-center gap-2 px-3 py-3"><span className={cn("h-1.5 w-1.5 rounded-full", data.status === "critical" ? "animate-pulse bg-danger" : data.status === "warning" ? "bg-amber" : "bg-signal")} /><b className="font-mono text-[10px]">{data.label}</b></div><Handle type="source" position={Position.Right} className="!h-1.5 !w-1.5 !border-0 !bg-[#777d77]" />
  </div>;
}
const nodeTypes = { component: ComponentNode };

export function DependenciesPage() {
  const [tracing, setTracing] = useState(false);
  const [selected, setSelected] = useState<Node<ComponentData>>(baseNodes[1]);
  const nodes = baseNodes.map((node) => ({ ...node, data: { ...node.data, status: tracing ? node.id === "oracle" ? "critical" as const : ["market", "liquidation"].includes(node.id) ? "warning" as const : node.id === "chainlink" ? "healthy" as const : "healthy" as const : node.data.status } }));
  const edges = baseEdges.map((edge) => ({ ...edge, animated: tracing || edge.animated, style: tracing && (edge.source === "oracle" || edge.target === "oracle") ? { stroke: "#e6a940", strokeWidth: 1.5 } : { stroke: "#4c534c" } }));
  const selectNode = useCallback((_: React.MouseEvent, node: Node<ComponentData>) => setSelected(node), []);
  return <PageFrame eyebrow="Topology intelligence / 09" title="Dependency Graph" description="Interactive modeled dependencies and blast-radius tracing. Every relationship in this workspace is simulation, not evidence of current compromise." type="SIMULATION" actions={<Button variant={tracing ? "danger" : "primary"} onClick={() => setTracing(!tracing)}><Route className="h-3 w-3" />{tracing ? "Clear trace" : "Trace impact"}</Button>}>
    {tracing && <div className="mb-3 border border-amber/40 bg-amber/5 p-3 font-mono text-[10px] text-amber">DEPENDENCY EXPOSURE, NOT CONFIRMED COMPROMISE. Source anomaly is red; direct dependencies are amber; modeled downstream paths remain under review.</div>}
    <div className="grid min-h-[680px] gap-3 xl:grid-cols-[1fr_290px]">
      <Panel className="overflow-hidden"><PanelHeader title="Protocol topology" meta="AAVE MARKET MODEL" action={<ProvenanceBadge type="SIMULATION" />} /><div className="h-[630px] bg-[#090b0a] terminal-grid"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={selectNode} fitView minZoom={0.35} maxZoom={1.6} proOptions={{ hideAttribution: true }}><Background color="#272c27" gap={28} size={.6} /><Controls position="bottom-right" className="!rounded-none !border !border-line !bg-[#0c0f0d] !shadow-none [&_button]:!rounded-none [&_button]:!border-line [&_button]:!bg-[#0c0f0d] [&_button]:!fill-[#aaa]" /><MiniMap position="bottom-left" nodeColor={(node) => node.data?.status === "critical" ? "#ee5b4f" : node.data?.status === "warning" ? "#e6a940" : "#697469"} maskColor="rgba(8,10,9,.8)" className="!rounded-none !border !border-line !bg-[#0c0f0d]" /></ReactFlow></div><SourceFooter source="Safe Sphere dependency model" type="SIMULATION" /></Panel>
      <div className="space-y-3"><Panel><PanelHeader title="Selected component" /><div className="p-4"><StatusBadge status={selected.data.status} /><h2 className="mt-5 font-mono text-lg">{selected.data.label}</h2><div className="mt-5 space-y-4 font-mono text-[10px]">{[["Component", selected.data.kind], ["Contract address", selected.data.address], ["Protocol", selected.data.protocol], ["Dependencies", String(baseEdges.filter((edge) => edge.source === selected.id || edge.target === selected.id).length)], ["Current status", selected.data.status.toUpperCase()], ["Alerts", tracing && selected.id === "oracle" ? "SIMULATED SOURCE ANOMALY" : "—"], ["Data source", selected.data.source]].map(([label, value]) => <div key={label}><div className="eyebrow">{label}</div><div className="mt-1 break-all text-[#c6cac4]">{value}</div></div>)}</div></div><SourceFooter source="Safe Sphere" type="SIMULATION" /></Panel><Panel><PanelHeader title="Trace legend" /><div className="space-y-3 p-3 font-mono text-[9px]"><div className="flex items-center gap-2"><span className="h-2 w-2 bg-danger" />Source anomaly</div><div className="flex items-center gap-2"><span className="h-2 w-2 bg-amber" />Direct dependency</div><div className="flex items-center gap-2"><span className="h-2 w-2 bg-[#d8c66e]" />Secondary exposure</div><div className="flex items-center gap-2"><span className="h-2 w-2 bg-[#697469]" />Untraced component</div></div></Panel></div>
    </div>
  </PageFrame>;
}
