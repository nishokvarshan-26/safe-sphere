"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Copy, Download, ExternalLink, Search, Star } from "lucide-react";
import { useProtocols } from "@/hooks/use-protocols";
import { useSafeSphere } from "@/components/safe-sphere-context";
import { Button, DataUnavailable, ProvenanceBadge, Skeleton, SourceFooter } from "@/components/ui/primitives";
import type { ProtocolRecord } from "@/lib/types";
import { cn, downloadData, formatMoney, formatNumber, formatPercent, toCsv } from "@/lib/utils";

type SortKey = keyof ProtocolRecord | "ratio";
const tabs = ["ALL", "LENDING", "DEX", "STAKING", "STABLECOIN", "BRIDGES", "DERIVATIVES"];
const pageSize = 12;

const categoryMatch: Record<string, string[]> = {
  LENDING: ["lending"], DEX: ["dex", "exchange"], STAKING: ["staking", "liquid staking", "restaking"],
  STABLECOIN: ["stablecoin", "cdp"], BRIDGES: ["bridge"], DERIVATIVES: ["derivatives", "options"],
};

function valueFor(protocol: ProtocolRecord, key: SortKey) {
  if (key === "ratio") return protocol.mcap && protocol.tvl ? protocol.mcap / protocol.tvl : null;
  const value = protocol[key];
  return Array.isArray(value) ? value.join(",") : value ?? null;
}

function Change({ value }: { value?: number | null }) {
  return <span className={cn(value && value > 0 ? "text-signal" : value && value < 0 ? "text-danger" : "text-muted")}>{formatPercent(value)}</span>;
}

function Header({ label, sortKey, current, direction, onSort, derived }: { label: string; sortKey: SortKey; current: SortKey; direction: "asc" | "desc"; onSort: (key: SortKey) => void; derived?: boolean }) {
  return <th><button onClick={() => onSort(sortKey)} className="flex items-center gap-1.5 hover:text-bone"><span>{label}</span>{derived && <span className="text-[7px] text-amber">D</span>}{current === sortKey ? <ChevronDown className={cn("h-2.5 w-2.5", direction === "asc" && "rotate-180")} /> : <ChevronsUpDown className="h-2.5 w-2.5 opacity-30" />}</button></th>;
}

export function ProtocolTable({ compact = false }: { compact?: boolean }) {
  const { protocols, live, loading, error, provenance, partial } = useProtocols();
  const { watchlist, toggleWatchlist } = useSafeSphere();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("ALL");
  const [chain, setChain] = useState("ALL CHAINS");
  const [category, setCategory] = useState("ALL CATEGORIES");
  const [tvlRange, setTvlRange] = useState("ALL TVL");
  const [sort, setSort] = useState<SortKey>("tvl");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const chains = useMemo(() => Array.from(new Set(protocols.flatMap((protocol) => protocol.chains ?? []))).sort(), [protocols]);
  const categories = useMemo(() => Array.from(new Set(protocols.map((protocol) => protocol.category).filter(Boolean) as string[])).sort(), [protocols]);
  const filtered = useMemo(() => protocols.filter((protocol) => {
    const matchesSearch = `${protocol.name} ${protocol.symbol ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === "ALL" || categoryMatch[tab]?.some((value) => protocol.category?.toLowerCase().includes(value));
    const matchesChain = chain === "ALL CHAINS" || protocol.chains?.includes(chain);
    const matchesCategory = category === "ALL CATEGORIES" || protocol.category === category;
    const matchesTvl = tvlRange === "ALL TVL" || (tvlRange === ">$1B" ? (protocol.tvl ?? 0) > 1e9 : tvlRange === "$100M–$1B" ? (protocol.tvl ?? 0) >= 1e8 && (protocol.tvl ?? 0) <= 1e9 : (protocol.tvl ?? Infinity) < 1e8);
    return matchesSearch && matchesTab && matchesChain && matchesCategory && matchesTvl;
  }).sort((a, b) => {
    const av = valueFor(a, sort); const bv = valueFor(b, sort);
    if (av === null) return 1; if (bv === null) return -1;
    const result = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return direction === "asc" ? result : -result;
  }), [protocols, search, tab, chain, category, tvlRange, sort, direction]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shown = compact ? filtered.slice(0, 8) : filtered.slice((Math.min(page, pageCount) - 1) * pageSize, Math.min(page, pageCount) * pageSize);
  const onSort = (key: SortKey) => { if (sort === key) setDirection((value) => value === "asc" ? "desc" : "asc"); else { setSort(key); setDirection("desc"); } };
  const exportRows = () => filtered.map(({ rank, name, slug, category: cat, chains: network, tvl, change1d, change7d, fees24h, fees7d, fees30d, revenue24h, revenue7d, revenue30d, mcap, users, transactions24h }) => ({ rank, name, slug, category: cat ?? "", chains: network?.join("|") ?? "", tvl, change1d, change7d, fees24h, fees7d, fees30d, revenue24h, revenue7d, revenue30d, mcap, users, transactions24h, source: live ? "DeFiLlama" : "Unavailable", type: live ? "LIVE" : "Unavailable" }));
  const exportData = (format: "csv" | "json") => downloadData(`safe-sphere-protocols.${format}`, format === "csv" ? toCsv(exportRows()) : JSON.stringify(exportRows(), null, 2), format === "csv" ? "text/csv" : "application/json");
  const copy = async (protocol: ProtocolRecord) => { await navigator.clipboard.writeText(JSON.stringify(protocol, null, 2)); setCopied(protocol.slug); window.setTimeout(() => setCopied(null), 1200); };

  return <div className="panel min-w-0">
    {!compact && <>
      <div className="flex flex-wrap items-center border-b border-line bg-[#0a0c0b] px-2 pt-2">{tabs.map((item) => <button key={item} onClick={() => { setTab(item); setPage(1); }} className={cn("h-8 border-b px-3 font-mono text-[9px] font-semibold tracking-[.08em]", tab === item ? "border-signal text-bone" : "border-transparent text-muted hover:text-bone")}>{item}</button>)}</div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-2">
        <label className="flex h-8 min-w-[220px] flex-1 items-center border border-line bg-[#090b0a] px-2"><Search className="mr-2 h-3 w-3 text-muted" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search protocol or symbol" className="min-w-0 flex-1 bg-transparent font-mono text-[10px] outline-none placeholder:text-[#525752]" /></label>
        {[{ value: chain, setter: setChain, options: ["ALL CHAINS", ...chains] }, { value: category, setter: setCategory, options: ["ALL CATEGORIES", ...categories] }, { value: tvlRange, setter: setTvlRange, options: ["ALL TVL", ">$1B", "$100M–$1B", "<$100M"] }].map((filter, index) => <select key={index} value={filter.value} onChange={(event) => { filter.setter(event.target.value); setPage(1); }} className="terminal-input max-w-[170px] text-[9px]">{filter.options.map((option) => <option key={option}>{option}</option>)}</select>)}
        <div className="ml-auto flex gap-1"><Button size="sm" onClick={() => exportData("csv")}><Download className="h-3 w-3" />CSV</Button><Button size="sm" onClick={() => exportData("json")}>JSON</Button></div>
      </div>
    </>}
    {loading && !live ? <div className="space-y-px p-2">{Array.from({ length: compact ? 5 : 10 }, (_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div> : <div className="overflow-x-auto">
      <table className="data-table min-w-[2280px]">
        <thead><tr>
          <Header label="Rank" sortKey="rank" current={sort} direction={direction} onSort={onSort} /><Header label="Protocol" sortKey="name" current={sort} direction={direction} onSort={onSort} /><Header label="Category" sortKey="category" current={sort} direction={direction} onSort={onSort} /><Header label="Chains" sortKey="chains" current={sort} direction={direction} onSort={onSort} /><Header label="TVL" sortKey="tvl" current={sort} direction={direction} onSort={onSort} /><Header label="TVL 1D" sortKey="change1d" current={sort} direction={direction} onSort={onSort} /><Header label="TVL 7D" sortKey="change7d" current={sort} direction={direction} onSort={onSort} />
          <Header label="Fees 24H" sortKey="fees24h" current={sort} direction={direction} onSort={onSort} /><Header label="Fees 7D" sortKey="fees7d" current={sort} direction={direction} onSort={onSort} /><Header label="Fees 30D" sortKey="fees30d" current={sort} direction={direction} onSort={onSort} /><Header label="Revenue 24H" sortKey="revenue24h" current={sort} direction={direction} onSort={onSort} /><Header label="Revenue 7D" sortKey="revenue7d" current={sort} direction={direction} onSort={onSort} /><Header label="Revenue 30D" sortKey="revenue30d" current={sort} direction={direction} onSort={onSort} /><Header label="Mcap / TVL" sortKey="ratio" current={sort} direction={direction} onSort={onSort} derived />
          <Header label="Active users" sortKey="users" current={sort} direction={direction} onSort={onSort} /><Header label="Tx 24H" sortKey="transactions24h" current={sort} direction={direction} onSort={onSort} /><th>Security status</th><th>Active alerts</th><th>Oracle health</th><th>Liquidity risk</th><th>Admin risk</th><Header label="Updated" sortKey="updatedAt" current={sort} direction={direction} onSort={onSort} /><th>Actions</th>
        </tr></thead>
        <tbody>{shown.map((protocol) => <tr key={protocol.slug} className="group">
          <td className="text-muted">{String(protocol.rank).padStart(2, "0")}</td>
          <td className="sticky left-0 z-10 bg-panel group-hover:bg-[#151914]"><Link href={`/protocols/${protocol.slug}`} className="flex items-center gap-2.5"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#3a403a] bg-[#151915] font-sans text-[9px] font-bold text-bone">{protocol.name.slice(0, 2).toUpperCase()}</span><div><b className="font-sans text-[11px] text-bone">{protocol.name}</b><span className="ml-2 text-[8px] text-muted">{protocol.symbol ?? ""}</span></div></Link></td>
          <td>{protocol.category ?? "—"}</td><td>{protocol.chains?.length ? <span title={protocol.chains.join(", ")}>{protocol.chains.slice(0, 2).join(" + ")}{protocol.chains.length > 2 ? ` +${protocol.chains.length - 2}` : ""}</span> : "—"}</td><td className="font-semibold text-bone">{formatMoney(protocol.tvl)}</td><td><Change value={protocol.change1d} /></td><td><Change value={protocol.change7d} /></td>
          <td>{formatMoney(protocol.fees24h)}</td><td>{formatMoney(protocol.fees7d)}</td><td>{formatMoney(protocol.fees30d)}</td><td>{formatMoney(protocol.revenue24h)}</td><td>{formatMoney(protocol.revenue7d)}</td><td>{formatMoney(protocol.revenue30d)}</td><td>{protocol.mcap && protocol.tvl ? (protocol.mcap / protocol.tvl).toFixed(2) : "—"}</td><td>{formatNumber(protocol.users)}</td><td>{formatNumber(protocol.transactions24h)}</td>
          <td className="text-muted">—</td><td className="text-muted">—</td><td className="text-muted">—</td><td className="text-muted">—</td><td className="text-muted">—</td><td className="text-[9px] text-muted">{protocol.updatedAt ? new Date(protocol.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
          <td><div className="flex gap-1"><button title={watchlist.includes(protocol.slug) ? "Remove from watchlist" : "Add to watchlist"} onClick={() => toggleWatchlist(protocol.slug)} className={cn("p-1.5 hover:bg-[#252a25]", watchlist.includes(protocol.slug) ? "text-signal" : "text-muted")}><Star className="h-3 w-3" fill={watchlist.includes(protocol.slug) ? "currentColor" : "none"} /></button><button title={copied === protocol.slug ? "Copied" : "Copy row data"} onClick={() => copy(protocol)} className="p-1.5 text-muted hover:bg-[#252a25] hover:text-bone"><Copy className="h-3 w-3" /></button><Link title="Open protocol" href={`/protocols/${protocol.slug}`} className="p-1.5 text-muted hover:bg-[#252a25] hover:text-bone"><ExternalLink className="h-3 w-3" /></Link></div></td>
        </tr>)}</tbody>
      </table>
    </div>}
    {!loading && !shown.length && <DataUnavailable label="NO PROTOCOLS MATCH CURRENT FILTERS" />}
    {!compact && <div className="flex min-h-10 items-center border-t border-line px-3 font-mono text-[9px] text-muted"><span>{filtered.length} protocols / page {Math.min(page, pageCount)} of {pageCount}</span><div className="ml-auto flex items-center gap-1"><Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-3 w-3" /></Button><Button size="sm" variant="ghost" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}><ChevronRight className="h-3 w-3" /></Button></div></div>}
    <SourceFooter source={live ? "DeFiLlama public API" : "Live source unavailable; protocol identities only"} type={live ? "LIVE" : "DERIVED"} updated={provenance?.updatedAt ? new Date(provenance.updatedAt).toLocaleString() : undefined} />
    {live && (partial?.fees || partial?.revenue) && <div className="border-t border-amber/20 bg-amber/5 px-3 py-2 font-mono text-[9px] text-amber">PARTIAL SOURCE RESPONSE: {partial.fees ? "fee metrics unavailable " : ""}{partial.revenue ? "revenue metrics unavailable" : ""}</div>}
    {error && <div className="border-t border-danger/20 bg-danger/5 px-3 py-2 font-mono text-[9px] text-danger">{error}. Missing values remain blank.</div>}
  </div>;
}
