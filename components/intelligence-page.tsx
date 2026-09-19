"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Search } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { TerminalTooltip } from "@/components/charts";
import { useApi } from "@/hooks/use-api";
import type { Incident } from "@/lib/types";
import { Button, Panel, PanelHeader, ProvenanceBadge, SourceFooter } from "@/components/ui/primitives";
import { downloadData, shortAddress, toCsv } from "@/lib/utils";

interface IncidentResponse { data: Incident[] }
function countBy<T>(rows: T[], key: (row: T) => string) { return Array.from(rows.reduce((map, row) => map.set(key(row), (map.get(key(row)) ?? 0) + 1), new Map<string, number>())).map(([name, count]) => ({ name, count })); }

export function IntelligencePage() {
  const result = useApi<IncidentResponse>("/api/intelligence");
  const [search, setSearch] = useState("");
  const [chain, setChain] = useState("ALL CHAINS");
  const incidents = result.data?.data ?? [];
  const filtered = incidents.filter((incident) => `${incident.project} ${incident.functionSignature} ${incident.logicAddress}`.toLowerCase().includes(search.toLowerCase()) && (chain === "ALL CHAINS" || incident.platform === chain));
  const byYear = useMemo(() => countBy(incidents, (row) => row.time.split("/")[0]), [incidents]);
  const byChain = useMemo(() => countBy(incidents, (row) => row.platform).sort((a, b) => b.count - a.count), [incidents]);
  const byFunction = useMemo(() => countBy(incidents, (row) => row.functionSignature).sort((a, b) => b.count - a.count).slice(0, 8), [incidents]);
  const exportData = () => downloadData("defitainter-incidents.csv", toCsv(filtered as unknown as Record<string, unknown>[]), "text/csv");
  return <PageFrame eyebrow="Exploit corpus / 12" title="Exploit Intelligence" description="Searchable price-manipulation incident records from the supplied DeFiTainter research dataset." type="HISTORICAL" actions={<Button size="sm" onClick={exportData}><Download className="h-3 w-3" />Export incidents</Button>}>
    <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-5"><MetricBox label="Indexed incidents" value={incidents.length} /><MetricBox label="Ethereum" value={incidents.filter((row) => row.platform === "ETH").length} /><MetricBox label="BSC" value={incidents.filter((row) => row.platform === "BSC").length} /><MetricBox label="Polygon" value={incidents.filter((row) => row.platform === "Polygon").length} /><MetricBox label="Fantom" value={incidents.filter((row) => row.platform === "Fantom").length} /></div>
    <div className="mt-3 grid gap-3 lg:grid-cols-3"><IncidentChart title="Incidents by year" data={byYear} color="#b6ff4a" /><IncidentChart title="Incidents by chain" data={byChain} color="#d5c28b" /><IncidentChart title="Function signatures" data={byFunction} color="#a68fc5" /></div>
    <Panel className="mt-3"><div className="flex flex-wrap gap-2 border-b border-line p-2"><label className="flex h-8 min-w-64 flex-1 items-center border border-line bg-[#090b0a] px-2"><Search className="mr-2 h-3 w-3 text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search protocol, address, signature…" className="flex-1 bg-transparent font-mono text-[10px] outline-none" /></label><select value={chain} onChange={(event) => setChain(event.target.value)} className="terminal-input"><option>ALL CHAINS</option><option>ETH</option><option>BSC</option><option>Polygon</option><option>Fantom</option></select></div><div className="overflow-x-auto"><table className="data-table min-w-[1350px]"><thead><tr><th>Date</th><th>Protocol</th><th>Chain</th><th>Logic address</th><th>Storage address</th><th>Function signature</th><th>Block number</th><th>Attack type</th><th>Dataset source</th></tr></thead><tbody>{filtered.map((incident, index) => <tr key={`${incident.blockNumber}-${index}`}><td>{incident.time}</td><td className="font-sans font-semibold text-bone">{incident.project}</td><td>{incident.platform}</td><td title={incident.logicAddress}>{shortAddress(incident.logicAddress, 8)}</td><td title={incident.storageAddress}>{shortAddress(incident.storageAddress, 8)}</td><td>{incident.functionSignature}</td><td>{incident.blockNumber.toLocaleString()}</td><td>Price manipulation</td><td><span className="mr-2">DeFiTainter</span><ProvenanceBadge type="HISTORICAL" /></td></tr>)}</tbody></table></div><SourceFooter source="DeFiTainter research repository" type="HISTORICAL" updated="Dataset range: 2020–2023" /></Panel>
  </PageFrame>;
}

function MetricBox({ label, value }: { label: string; value: number }) { return <div className="panel p-3"><div className="flex justify-between"><div className="eyebrow">{label}</div><ProvenanceBadge type="HISTORICAL" /></div><div className="mt-3 font-mono text-2xl">{String(value).padStart(2, "0")}</div></div>; }
function IncidentChart({ title, data, color }: { title: string; data: { name: string; count: number }[]; color: string }) { return <Panel><PanelHeader title={title} /><div className="h-52 p-3"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid stroke="#202420" vertical={false} /><XAxis dataKey="name" stroke="#555b55" fontSize={8} tickLine={false} axisLine={false} interval={0} /><YAxis allowDecimals={false} stroke="#555b55" fontSize={8} tickLine={false} axisLine={false} /><Tooltip content={<TerminalTooltip />} /><Bar dataKey="count" name="Incidents" fill={color} /></BarChart></ResponsiveContainer></div><SourceFooter source="DeFiTainter" type="HISTORICAL" /></Panel>; }
