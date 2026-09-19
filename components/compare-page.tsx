"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TerminalTooltip } from "@/components/charts";
import { PageFrame } from "@/components/page-frame";
import { Button, Panel, PanelHeader, ProvenanceBadge, SourceFooter } from "@/components/ui/primitives";
import { useProtocols } from "@/hooks/use-protocols";
import { formatMoney, formatPercent } from "@/lib/utils";

export function ComparePage() {
  const { protocols, live, provenance } = useProtocols();
  const [selected, setSelected] = useState(["aave", "compound-finance", "morpho", "spark"]);
  const rows = useMemo(() => protocols.filter((protocol) => selected.includes(protocol.slug)), [protocols, selected]);
  const toggle = (slug: string) => setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < 4 ? [...current, slug] : [...current.slice(1), slug]);
  const chart = rows.map((protocol) => ({ name: protocol.name, tvl: protocol.tvl ? protocol.tvl / 1e6 : 0, fees: protocol.fees7d ? protocol.fees7d / 1e6 : 0, revenue: protocol.revenue7d ? protocol.revenue7d / 1e6 : 0 }));
  const metrics = [
    ["TVL", (slug: string) => formatMoney(rows.find((row) => row.slug === slug)?.tvl)], ["TVL change 7D", (slug: string) => formatPercent(rows.find((row) => row.slug === slug)?.change7d)], ["Fees 7D", (slug: string) => formatMoney(rows.find((row) => row.slug === slug)?.fees7d)], ["Revenue 7D", (slug: string) => formatMoney(rows.find((row) => row.slug === slug)?.revenue7d)], ["Transactions", () => "—"], ["Users", () => "—"], ["Active alerts", () => "—"], ["Oracle health", () => "—"], ["Liquidity risk", () => "—"], ["Admin risk", () => "—"], ["Dependency count", () => "—"],
  ] as const;
  return <PageFrame eyebrow="Cross-protocol research / 04" title="Compare Protocols" description="Compare only source-backed financial fields. Security categories remain unassessed until protocol-specific monitoring is connected." type={live ? "LIVE" : undefined}>
    <Panel><PanelHeader title="Protocol selection" meta={`${selected.length} / 4 SELECTED`} /><div className="flex flex-wrap gap-1 p-2">{protocols.map((protocol) => <Button key={protocol.slug} size="sm" variant={selected.includes(protocol.slug) ? "primary" : "ghost"} onClick={() => toggle(protocol.slug)}>{protocol.name}</Button>)}</div></Panel>
    <div className="mt-3 grid gap-3 xl:grid-cols-[.85fr_1.15fr]">
      <Panel><PanelHeader title="Comparative metrics" action={live ? <ProvenanceBadge type="LIVE" /> : undefined} /><div className="overflow-x-auto"><table className="data-table min-w-[650px]"><thead><tr><th>Metric</th>{rows.map((row) => <th key={row.slug}>{row.name}</th>)}</tr></thead><tbody>{metrics.map(([metric, value]) => <tr key={metric}><td className="text-muted">{metric}</td>{rows.map((row) => <td key={row.slug} className="text-bone">{value(row.slug)}</td>)}</tr>)}</tbody></table></div><SourceFooter source={live ? "DeFiLlama" : "Unavailable"} type={live ? "LIVE" : "DERIVED"} updated={provenance?.updatedAt} /></Panel>
      <Panel><PanelHeader title="Scale comparison" meta="USD MILLIONS" /><div className="h-[420px] p-3"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid stroke="#202420" vertical={false} /><XAxis dataKey="name" stroke="#555b55" fontSize={9} tickLine={false} axisLine={false} /><YAxis stroke="#555b55" fontSize={8} tickLine={false} axisLine={false} /><Tooltip content={<TerminalTooltip />} /><Bar dataKey="tvl" name="TVL $m" fill="#889f6a" /><Bar dataKey="fees" name="Fees 7D $m" fill="#d5c28b" /><Bar dataKey="revenue" name="Revenue 7D $m" fill="#a68fc5" /></BarChart></ResponsiveContainer></div><SourceFooter source={live ? "DeFiLlama" : "Unavailable"} type={live ? "LIVE" : "DERIVED"} /></Panel>
    </div>
  </PageFrame>;
}
