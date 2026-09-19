"use client";

import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Blocks, Network, ShieldAlert } from "lucide-react";
import { PageFrame, RefreshButton } from "@/components/page-frame";
import { ProtocolTable } from "@/components/protocol-table";
import { TerminalTooltip } from "@/components/charts";
import { DataUnavailable, Metric, Panel, PanelHeader, ProvenanceBadge, SourceFooter, StatusBadge } from "@/components/ui/primitives";
import { useProtocols } from "@/hooks/use-protocols";
import { useApi } from "@/hooks/use-api";
import type { OracleRound } from "@/lib/types";
import { formatMoney, formatNumber } from "@/lib/utils";

interface OracleResponse { data: OracleRound[] }
interface EthereumResponse { data: { number: number; timestamp: string; transactionCount: number; gasUsed: number }[]; provenance: { updatedAt: string } }

export function DashboardPage() {
  const protocols = useProtocols();
  const ethereum = useApi<EthereumResponse>("/api/ethereum", 30_000);
  const oracle = useApi<OracleResponse>("/api/oracle");
  const liveProtocols = protocols.live ? protocols.protocols.filter((protocol) => protocol.tvl !== null && protocol.tvl !== undefined) : [];
  const totalTvl = liveProtocols.reduce((sum, protocol) => sum + (protocol.tvl ?? 0), 0);
  const chains = new Set(liveProtocols.flatMap((protocol) => protocol.chains ?? [])).size;
  const anomalies = oracle.data?.data.filter((round) => round.status !== "normal") ?? [];
  const chartData = liveProtocols.slice(0, 12).map((protocol) => ({ name: protocol.name, tvl: Math.round((protocol.tvl ?? 0) / 1e6) }));
  const latest = ethereum.data?.data[0];

  return <PageFrame eyebrow="Operational overview / 01" title="Command Center" description="Protocol health, source availability, historical threat signals, and dependency exposure in one operating view." type="DERIVED" actions={<><span className="font-mono text-[9px] text-muted">AUTO REFRESH / 30S</span><RefreshButton onClick={() => { protocols.refresh(); ethereum.refresh(); }} loading={protocols.loading || ethereum.loading} /></>}>
    <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-5">
      <Metric label="Total TVL monitored" value={protocols.live ? formatMoney(totalTvl) : "—"} detail={protocols.live ? `${liveProtocols.length} reporting protocols` : "Live source unavailable"} type={protocols.live ? "DERIVED" : undefined} />
      <Metric label="Protocols monitored" value={protocols.protocols.length} detail="Configured protocol identities" type="DERIVED" />
      <Metric label="Chains covered" value={protocols.live ? chains : "—"} detail="Reported by live source" type={protocols.live ? "DERIVED" : undefined} />
      <Metric label="Active alerts" value="—" detail="No connected real-time alert stream" />
      <Metric label="Latest Ethereum block" value={latest ? `#${latest.number.toLocaleString()}` : "—"} detail={latest ? new Date(latest.timestamp).toLocaleTimeString() : "RPC unavailable"} type={latest ? "LIVE" : undefined} tone={latest ? "green" : undefined} />
    </div>
    <div className="mt-px grid grid-cols-2 gap-px bg-line lg:grid-cols-5">
      <Metric label="Critical threats" value="—" detail="Current feed unavailable" />
      <Metric label="Oracle warnings" value={anomalies.length} detail="35-round historical sample" type="DERIVED" tone={anomalies.length ? "amber" : "green"} />
      <Metric label="Liquidity anomalies" value="—" detail="No live liquidity event source" />
      <Metric label="Admin events" value="—" detail="No live admin event source" />
      <Metric label="Historical exploits indexed" value="24" detail="23 DeFiTainter + Euler" type="DERIVED" />
    </div>

    <div className="mt-3 grid gap-3 xl:grid-cols-[1.65fr_.75fr]">
      <Panel><PanelHeader title="Monitored TVL distribution" meta="USD MILLIONS / TOP REPORTING PROTOCOLS" action={protocols.live ? <ProvenanceBadge type="LIVE" /> : undefined} />
        <div className="h-[292px] p-3">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid stroke="#202420" vertical={false} /><XAxis dataKey="name" stroke="#575d57" fontSize={8} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={48} /><YAxis stroke="#575d57" fontSize={8} tickLine={false} axisLine={false} tickFormatter={(value) => `$${formatNumber(value)}m`} /><Tooltip content={<TerminalTooltip />} cursor={{ fill: "rgba(182,255,74,.04)" }} /><Bar dataKey="tvl" name="TVL $m" fill="#a5c776" /></BarChart></ResponsiveContainer> : <DataUnavailable />}</div>
        <SourceFooter source={protocols.live ? "DeFiLlama" : "Unavailable"} type={protocols.live ? "LIVE" : "DERIVED"} updated={protocols.provenance?.updatedAt} />
      </Panel>
      <Panel><PanelHeader title="Security signal feed" meta="HISTORICAL SAMPLE" action={<Link href="/alerts" className="font-mono text-[8px] text-muted hover:text-bone">VIEW ALL</Link>} />
        <div className="divide-y divide-line">{anomalies.slice(-6).reverse().map((round) => <Link href={`/alerts/oracle-${round.aggregatorRoundId}`} key={round.roundId} className="block p-3 hover:bg-[#141714]"><div className="flex items-center justify-between"><StatusBadge status={round.status === "stale" ? "warning" : "notice"} label={round.status} /><span className="font-mono text-[8px] text-muted">{round.dateTime.slice(5,16)}</span></div><div className="mt-2 text-[11px] font-semibold">{round.status === "stale" ? "Oracle update interval exceeded threshold" : "Oracle price deviation"}</div><div className="mt-1 font-mono text-[9px] text-muted">TUSD/USD · Z {round.zScore?.toFixed(2) ?? "—"} · ${round.price.toFixed(6)}</div></Link>)}
        {!anomalies.length && <div className="p-3"><DataUnavailable label="NO DERIVED ANOMALIES" compact /></div>}</div>
        <SourceFooter source="Chainlink TUSD/USD supplied sample" type="HISTORICAL" />
      </Panel>
    </div>

    <div className="mt-3"><div className="mb-2 flex items-end justify-between"><div><div className="eyebrow">Market coverage</div><h2 className="mt-1 text-lg font-bold uppercase tracking-[-.03em]">Protocol Rankings</h2></div><Link href="/protocols" className="flex items-center gap-2 font-mono text-[9px] text-muted hover:text-bone">FULL TERMINAL <ArrowUpRight className="h-3 w-3" /></Link></div><ProtocolTable compact /></div>

    <div className="mt-3 grid gap-3 lg:grid-cols-3">
      <Panel><PanelHeader title="Oracle health" meta="TUSD / USD" action={<ProvenanceBadge type="HISTORICAL" />} /><div className="h-44 p-3">{oracle.data?.data ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={oracle.data.data}><defs><linearGradient id="oracle-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b6ff4a" stopOpacity=".2" /><stop offset="1" stopColor="#b6ff4a" stopOpacity="0" /></linearGradient></defs><CartesianGrid stroke="#202420" vertical={false} /><XAxis dataKey="aggregatorRoundId" hide /><YAxis domain={[.985,1.015]} stroke="#575d57" fontSize={8} tickLine={false} axisLine={false} /><Tooltip content={<TerminalTooltip />} /><Area dataKey="price" name="Price USD" stroke="#b6ff4a" fill="url(#oracle-area)" strokeWidth={1.2} dot={false} /></AreaChart></ResponsiveContainer> : <DataUnavailable compact />}</div><SourceFooter source="Chainlink sample" type="HISTORICAL" /></Panel>
      <Panel><PanelHeader title="Liquidity flows" meta="LIVE EVENTS" /><div className="p-3"><DataUnavailable label="LIVE SOURCE UNAVAILABLE" compact /></div><div className="grid grid-cols-2 border-t border-line"><div className="p-3"><div className="eyebrow">Net flow</div><div className="mt-2 font-mono text-lg">—</div></div><div className="border-l border-line p-3"><div className="eyebrow">Large exits</div><div className="mt-2 font-mono text-lg">—</div></div></div><SourceFooter source="Not configured" type="LIVE" /></Panel>
      <Panel><PanelHeader title="Admin activity" meta="PRIVILEGED EVENTS" /><div className="p-3"><DataUnavailable label="NO CONNECTED ADMIN EVENT SOURCE" compact /></div><div className="border-t border-line p-3 font-mono text-[9px] leading-5 text-muted">Configure monitored contract addresses and an Alchemy WebSocket endpoint in Settings.</div><SourceFooter source="Not configured" type="LIVE" /></Panel>
    </div>

    <div className="mt-3 grid gap-3 lg:grid-cols-2">
      <Link href="/replay/euler" className="panel group flex min-h-40 items-stretch hover:border-[#484f48]"><div className="flex w-14 items-center justify-center border-r border-line"><Blocks className="h-5 w-5 text-danger" /></div><div className="flex-1 p-4"><div className="flex justify-between"><span className="eyebrow">Historical attack intelligence</span><ProvenanceBadge type="HISTORICAL" /></div><h3 className="mt-7 text-xl font-bold">EULER FINANCE / 13 MAR 2023</h3><p className="mt-2 text-[11px] text-muted">Replay the supplied Etherscan transaction sequence from block 16,817,994.</p></div><div className="flex w-12 items-center justify-center"><ArrowUpRight className="h-4 w-4 text-muted group-hover:text-bone" /></div></Link>
      <Link href="/dependencies" className="panel group flex min-h-40 items-stretch hover:border-[#484f48]"><div className="flex w-14 items-center justify-center border-r border-line"><Network className="h-5 w-5 text-amber" /></div><div className="flex-1 p-4"><div className="flex justify-between"><span className="eyebrow">Dependency overview</span><ProvenanceBadge type="SIMULATION" /></div><h3 className="mt-7 text-xl font-bold">TRACE PROTOCOL BLAST RADIUS</h3><p className="mt-2 text-[11px] text-muted">Inspect modeled oracle, market, collateral, borrowing, and liquidity dependencies.</p></div><div className="flex w-12 items-center justify-center"><ArrowUpRight className="h-4 w-4 text-muted group-hover:text-bone" /></div></Link>
    </div>
  </PageFrame>;
}
