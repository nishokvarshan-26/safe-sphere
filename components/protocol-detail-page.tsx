"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { TerminalTooltip } from "@/components/charts";
import { useApi } from "@/hooks/use-api";
import { useSafeSphere } from "@/components/safe-sphere-context";
import { Button, DataUnavailable, Metric, Panel, PanelHeader, ProvenanceBadge, Skeleton, SourceFooter } from "@/components/ui/primitives";
import { cn, formatMoney, formatNumber } from "@/lib/utils";

const tabs = ["OVERVIEW", "SECURITY", "TVL & FLOWS", "FEES & REVENUE", "USERS", "TRANSACTIONS", "ORACLE", "LIQUIDITY", "ADMIN", "CONTRACTS", "DEPENDENCIES", "ALERTS"];
const periods = ["24H", "7D", "30D", "90D", "1Y", "ALL"];

interface SeriesPoint { date: number; totalLiquidityUSD: number }
interface ChartPayload { totalDataChart?: [number, number][]; total24h?: number; total7d?: number; total30d?: number }
interface ProtocolDetailResponse {
  data: {
    name?: string; symbol?: string; category?: string; url?: string; description?: string; chains?: string[]; tvl?: SeriesPoint[];
    currentChainTvls?: Record<string, number>; address?: string; audits?: string; audit_links?: string[]; twitter?: string;
  };
  fees: ChartPayload | null;
  revenue: ChartPayload | null;
  provenance: { source: string; type: "LIVE"; updatedAt: string };
}

function daysForPeriod(period: string) {
  return { "24H": 1, "7D": 7, "30D": 30, "90D": 90, "1Y": 365, "ALL": Infinity }[period] ?? Infinity;
}

function TimeSeries({ data, dataKey = "value", color = "#b6ff4a", name = "Value" }: { data: Record<string, number | string>[]; dataKey?: string; color?: string; name?: string }) {
  if (!data.length) return <DataUnavailable />;
  return <ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".18" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs><CartesianGrid stroke="#202420" vertical={false} /><XAxis dataKey="label" stroke="#555b55" tickLine={false} axisLine={false} fontSize={8} minTickGap={40} /><YAxis stroke="#555b55" tickLine={false} axisLine={false} fontSize={8} tickFormatter={(value) => formatNumber(value)} width={50} /><Tooltip content={<TerminalTooltip />} /><Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={1.4} fill={`url(#gradient-${color.replace("#", "")})`} dot={false} /></AreaChart></ResponsiveContainer>;
}

function UnavailableAnalysis({ title, description }: { title: string; description: string }) {
  return <Panel><PanelHeader title={title} meta="SOURCE REQUIRED" /><div className="p-3"><DataUnavailable label="LIVE SOURCE UNAVAILABLE" /></div><div className="border-t border-line p-3 text-[11px] leading-5 text-muted">{description}</div></Panel>;
}

export function ProtocolDetailPage({ slug }: { slug: string }) {
  const result = useApi<ProtocolDetailResponse>(`/api/protocols/${slug}`);
  const { watchlist, toggleWatchlist } = useSafeSphere();
  const [tab, setTab] = useState("OVERVIEW");
  const [period, setPeriod] = useState("1Y");
  const data = result.data?.data;
  const tvlSeries = useMemo(() => {
    const cutoff = Date.now() / 1000 - daysForPeriod(period) * 86_400;
    return (data?.tvl ?? []).filter((point) => point.date >= cutoff).map((point) => ({ label: new Date(point.date * 1000).toLocaleDateString(undefined, { month: "short", day: period === "1Y" || period === "ALL" ? undefined : "numeric", year: period === "ALL" ? "2-digit" : undefined }), value: point.totalLiquidityUSD }));
  }, [data?.tvl, period]);
  const feeSeries = (result.data?.fees?.totalDataChart ?? []).map(([date, value]) => ({ label: new Date(date * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }), value }));
  const revenueSeries = (result.data?.revenue?.totalDataChart ?? []).map(([date, value]) => ({ label: new Date(date * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }), value }));
  const currentTvl = data?.tvl?.at(-1)?.totalLiquidityUSD ?? null;
  const chainEntries = Object.entries(data?.currentChainTvls ?? {}).filter(([chain]) => !chain.includes("-borrowed") && !chain.includes("-staking")).sort((a, b) => b[1] - a[1]);
  const protocolName = data?.name ?? slug.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");

  const overview = <div className="grid gap-3 xl:grid-cols-[1.55fr_.75fr]">
    <Panel><PanelHeader title="TVL history" meta={period} action={<div className="flex">{periods.map((item) => <button key={item} onClick={() => setPeriod(item)} className={cn("h-6 px-2 font-mono text-[8px]", period === item ? "bg-bone text-ink" : "text-muted hover:text-bone")}>{item}</button>)}</div>} /><div className="h-[350px] p-3">{result.loading ? <Skeleton className="h-full" /> : <TimeSeries data={tvlSeries} name="TVL USD" />}</div><SourceFooter source={result.data ? "DeFiLlama" : "Unavailable"} type={result.data ? "LIVE" : "DERIVED"} updated={result.data?.provenance.updatedAt} /></Panel>
    <div className="space-y-3"><Panel><PanelHeader title="Chain allocation" meta={`${chainEntries.length} CHAINS`} /><div className="max-h-[250px] overflow-y-auto">{chainEntries.slice(0, 12).map(([chain, value]) => <div key={chain} className="flex items-center border-b border-line px-3 py-2.5 font-mono text-[10px]"><span className="flex-1">{chain}</span><span>{formatMoney(value)}</span><span className="ml-3 w-11 text-right text-muted">{currentTvl ? `${((value / currentTvl) * 100).toFixed(1)}%` : "—"}</span></div>)}{!chainEntries.length && <div className="p-3"><DataUnavailable compact /></div>}</div><SourceFooter source={result.data ? "DeFiLlama" : "Unavailable"} type={result.data ? "LIVE" : "DERIVED"} /></Panel><Panel><PanelHeader title="Protocol metadata" /><div className="space-y-3 p-3 text-[11px] leading-5 text-muted"><p>{data?.description ?? "Live protocol metadata is unavailable."}</p>{data?.url && <a className="flex items-center gap-2 font-mono text-[9px] text-bone hover:text-signal" href={data.url} target="_blank" rel="noreferrer">OFFICIAL SITE <ExternalLink className="h-3 w-3" /></a>}</div></Panel></div>
    <Panel className="xl:col-span-2"><PanelHeader title="Fees trend" meta="AVAILABLE HISTORY" action={<ProvenanceBadge type="LIVE" />} /><div className="h-56 p-3"><TimeSeries data={feeSeries.slice(-180)} color="#d5c28b" name="Fees USD" /></div><SourceFooter source={result.data?.fees ? "DeFiLlama fees" : "Unavailable"} type={result.data?.fees ? "LIVE" : "DERIVED"} /></Panel>
  </div>;

  const security = <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[
    ["ORACLE", "No connected oracle feed map", "Oracle contracts and feed heartbeat are required."], ["LIQUIDITY", "No live flow source", "Pool-level withdrawals and depth are not available."], ["ADMIN", "No monitored admin events", "Configure privileged role and upgrade event signatures."], ["CONTRACT", slug.includes("euler") ? "Historical incident indexed" : "No current findings source", slug.includes("euler") ? "Euler 13 Mar 2023 is indexed as historical evidence, not current protocol status." : "Contract scanner not configured."], ["WALLET", "No wallet anomaly source", "Add monitored operator and treasury addresses."], ["DEPENDENCY", "Simulation available", "Open dependency graph to model exposure."],
  ].map(([name, evidence, note]) => <Panel key={name}><PanelHeader title={name} action={name === "DEPENDENCY" ? <ProvenanceBadge type="SIMULATION" /> : slug.includes("euler") && name === "CONTRACT" ? <ProvenanceBadge type="HISTORICAL" /> : undefined} /><div className="p-4"><div className="eyebrow">Status</div><div className="mt-2 font-mono text-sm text-muted">UNASSESSED</div><div className="mt-5 grid grid-cols-2 gap-4"><div><div className="eyebrow">Trend</div><div className="mt-1 font-mono text-[10px]">—</div></div><div><div className="eyebrow">Confidence</div><div className="mt-1 font-mono text-[10px]">—</div></div></div><div className="mt-5 border-t border-line pt-3 text-[11px]"><b className="font-medium text-bone">{evidence}</b><p className="mt-1 leading-5 text-muted">{note}</p></div></div></Panel>)}</div>;

  const fees = <><div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-6"><Metric label="Fees 24H" value={formatMoney(result.data?.fees?.total24h)} type={result.data?.fees ? "LIVE" : undefined} /><Metric label="Fees 7D" value={formatMoney(result.data?.fees?.total7d)} type={result.data?.fees ? "LIVE" : undefined} /><Metric label="Fees 30D" value={formatMoney(result.data?.fees?.total30d)} type={result.data?.fees ? "LIVE" : undefined} /><Metric label="Revenue 24H" value={formatMoney(result.data?.revenue?.total24h)} type={result.data?.revenue ? "LIVE" : undefined} /><Metric label="Revenue 7D" value={formatMoney(result.data?.revenue?.total7d)} type={result.data?.revenue ? "LIVE" : undefined} /><Metric label="Revenue 30D" value={formatMoney(result.data?.revenue?.total30d)} type={result.data?.revenue ? "LIVE" : undefined} /></div><div className="mt-3 grid gap-3 lg:grid-cols-2"><Panel><PanelHeader title="Fee trend" /><div className="h-72 p-3"><TimeSeries data={feeSeries.slice(-365)} color="#d5c28b" name="Fees USD" /></div><SourceFooter source={result.data?.fees ? "DeFiLlama" : "Unavailable"} type={result.data?.fees ? "LIVE" : "DERIVED"} /></Panel><Panel><PanelHeader title="Revenue trend" /><div className="h-72 p-3"><TimeSeries data={revenueSeries.slice(-365)} color="#b6ff4a" name="Revenue USD" /></div><SourceFooter source={result.data?.revenue ? "DeFiLlama" : "Unavailable"} type={result.data?.revenue ? "LIVE" : "DERIVED"} /></Panel></div></>;

  const flow = <div className="space-y-3"><Panel><PanelHeader title="TVL history" action={<div className="flex">{periods.map((item) => <button key={item} onClick={() => setPeriod(item)} className={cn("h-6 px-2 font-mono text-[8px]", period === item ? "bg-bone text-ink" : "text-muted")}>{item}</button>)}</div>} /><div className="h-80 p-3"><TimeSeries data={tvlSeries} name="TVL USD" /></div><SourceFooter source={result.data ? "DeFiLlama" : "Unavailable"} type={result.data ? "LIVE" : "DERIVED"} /></Panel><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{["NET INFLOW / OUTFLOW", "DEPOSITS / WITHDRAWALS", "BORROW / REPAY", "LIQUIDATIONS / LARGE TX"].map((title) => <UnavailableAnalysis key={title} title={title} description="This metric requires indexed protocol event data. Safe Sphere will not infer it from TVL changes." />)}</div></div>;

  let content = overview;
  if (tab === "SECURITY") content = security;
  if (tab === "TVL & FLOWS") content = flow;
  if (tab === "FEES & REVENUE") content = fees;
  if (["USERS", "TRANSACTIONS", "ORACLE", "LIQUIDITY", "ADMIN"].includes(tab)) content = <UnavailableAnalysis title={`${tab} intelligence`} description={`No validated ${tab.toLowerCase()} source is connected for this protocol. Configure a source in Settings to populate this view.`} />;
  if (tab === "CONTRACTS") content = <div className="grid gap-3 lg:grid-cols-2"><Panel><PanelHeader title="Known contract reference" /><div className="p-4"><div className="eyebrow">Address</div><div className="mt-2 break-all font-mono text-[11px]">{data?.address ?? "—"}</div><div className="mt-6 grid grid-cols-2"><div><div className="eyebrow">Reported audits</div><div className="mt-2 font-mono">{data?.audits ?? "—"}</div></div><div><div className="eyebrow">Chain scope</div><div className="mt-2 font-mono">{data?.chains?.length ?? "—"}</div></div></div></div><SourceFooter source={result.data ? "DeFiLlama metadata" : "Unavailable"} type={result.data ? "LIVE" : "DERIVED"} /></Panel><UnavailableAnalysis title="Upgrade & admin monitor" description="No indexed privileged events are connected." /></div>;
  if (tab === "DEPENDENCIES") content = <Panel><PanelHeader title="Dependency exposure" action={<ProvenanceBadge type="SIMULATION" />} /><div className="flex min-h-52 flex-col items-center justify-center p-5 text-center"><p className="max-w-lg text-[12px] leading-6 text-muted">Open the interactive dependency workspace to model oracle, collateral, borrowing, and liquidity propagation. Exposure is not a confirmed compromise.</p><Link href="/dependencies" className="mt-5"><Button variant="primary">Open dependency map</Button></Link></div></Panel>;
  if (tab === "ALERTS") content = <Panel><PanelHeader title="Protocol alerts" /><div className="p-3"><DataUnavailable label="NO ACTIVE VALIDATED ALERTS" /></div><SourceFooter source="No connected real-time alert stream" type="LIVE" /></Panel>;

  return <PageFrame eyebrow="Protocol intelligence / 03" title={protocolName} description={`${data?.category ?? "Protocol"} · ${data?.chains?.length ? data.chains.join(" + ") : "Chain coverage unavailable"}`} type={result.data ? "LIVE" : undefined} actions={<><Link href="/protocols"><Button size="sm"><ArrowLeft className="h-3 w-3" />Rankings</Button></Link><Button size="sm" onClick={() => toggleWatchlist(slug)} className={watchlist.includes(slug) ? "border-signal text-signal" : ""}><Star className="h-3 w-3" fill={watchlist.includes(slug) ? "currentColor" : "none"} />{watchlist.includes(slug) ? "Watching" : "Watch"}</Button></>}>
    <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-7"><Metric label="TVL" value={formatMoney(currentTvl)} type={result.data ? "LIVE" : undefined} /><Metric label="Fees 7D" value={formatMoney(result.data?.fees?.total7d)} type={result.data?.fees ? "LIVE" : undefined} /><Metric label="Revenue 7D" value={formatMoney(result.data?.revenue?.total7d)} type={result.data?.revenue ? "LIVE" : undefined} /><Metric label="Users" value="—" detail="Source unavailable" /><Metric label="Transactions" value="—" detail="Source unavailable" /><Metric label="Health status" value="UNASSESSED" detail="No composite score inferred" /><Metric label="Active alerts" value="—" detail="Feed unavailable" /></div>
    {result.error && <div className="mt-3 border border-danger/30 bg-danger/5 p-3 font-mono text-[10px] text-danger">LIVE SOURCE UNAVAILABLE. Historical and simulation tools remain accessible.</div>}
    <div className="mt-3 overflow-x-auto border-b border-line"><div className="flex min-w-max">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("h-10 border-b px-3 font-mono text-[9px] font-semibold", tab === item ? "border-signal text-bone" : "border-transparent text-muted hover:text-bone")}>{item}</button>)}</div></div>
    <div className="mt-3">{content}</div>
  </PageFrame>;
}
