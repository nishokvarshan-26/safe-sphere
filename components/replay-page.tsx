"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FastForward, Pause, Play, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { PageFrame } from "@/components/page-frame";
import { useApi } from "@/hooks/use-api";
import type { EulerTransaction } from "@/lib/types";
import { Button, DataUnavailable, Metric, Panel, PanelHeader, ProvenanceBadge, SourceFooter, StatusBadge } from "@/components/ui/primitives";
import { cn, shortAddress } from "@/lib/utils";

interface EulerResponse {
  transactions: EulerTransaction[];
  reference: Record<string, { value: string; source: string }>;
  provenance: { source: string; type: "HISTORICAL" };
}

export function ReplayLibraryPage() {
  return <PageFrame eyebrow="Forensic archive / 11" title="Attack Replay Library" description="Reconstruct confirmed historical incidents from supplied transaction exports and references. Replay events are evidence, not a live alert stream." type="HISTORICAL">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"><Link href="/replay/euler" className="panel group min-h-72 p-5 hover:border-[#555d55]"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center border border-danger/50 font-mono text-sm font-bold text-danger">EU</div><ProvenanceBadge type="HISTORICAL" /></div><div className="mt-16 eyebrow">Ethereum / Lending / Confirmed</div><h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">EULER FINANCE</h2><p className="mt-2 font-mono text-[10px] text-muted">13 MAR 2023 · BLOCK 16,817,996</p><div className="mt-8 flex items-center justify-between border-t border-line pt-4 font-mono text-[9px]"><span>75 supplied export rows</span><ArrowRight className="h-4 w-4 text-muted group-hover:text-signal" /></div></Link>
      <div className="panel flex min-h-72 items-center justify-center border-dashed p-6 text-center"><div><div className="font-mono text-[10px] tracking-widest text-muted">ADDITIONAL REPLAY</div><p className="mt-3 text-[11px] text-[#666c66]">Import validated transaction evidence through the Data Center.</p></div></div></div>
  </PageFrame>;
}

export function EulerReplayPage() {
  const result = useApi<EulerResponse>("/api/replay/euler");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timeline = useMemo(() => (result.data?.transactions ?? []).filter((transaction) => transaction.block >= 16_817_994 && transaction.block <= 16_971_576), [result.data]);
  const attackIndex = Math.max(0, timeline.findIndex((transaction) => transaction.hash === "0xc310a0affe2169d1f6feec1c63dbc7f7c62a887fa48795d327d4d2da2d6b111d"));
  useEffect(() => { if (timeline.length && index === 0 && attackIndex > 0) setIndex(attackIndex); }, [timeline.length, attackIndex, index]);
  useEffect(() => {
    if (!playing || !timeline.length) return;
    const timer = window.setInterval(() => setIndex((current) => { if (current >= timeline.length - 1) { setPlaying(false); return current; } return current + 1; }), 1300 / speed);
    return () => window.clearInterval(timer);
  }, [playing, speed, timeline.length]);
  const current = timeline[index];
  const reference = result.data?.reference;
  const referenceValue = (field: string) => reference?.[field]?.value ?? "—";
  const reset = () => { setPlaying(false); setIndex(attackIndex); };
  const progress = timeline.length > 1 ? (index / (timeline.length - 1)) * 100 : 0;

  return <PageFrame eyebrow="Historical attack replay / Euler" title="Euler Finance" description="13 Mar 2023 · Confirmed historical incident reconstructed from supplied Etherscan exports and curated public references." type="HISTORICAL" actions={<Link href="/replay"><Button size="sm">Replay library</Button></Link>}>
    <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-5"><Metric label="Exploit block" value="#16,817,996" type="HISTORICAL" /><Metric label="Incident date" value="13 MAR 2023" type="HISTORICAL" /><Metric label="Estimated loss" value="$197M" detail="Public incident estimate" type="HISTORICAL" tone="red" /><Metric label="Export rows loaded" value={result.data?.transactions.length ?? "—"} detail="Deduplicated hashes" type="DERIVED" /><Metric label="Validated warning window" value="NONE" detail="Not supported by dataset" type="DERIVED" /></div>
    <div className="mt-3 grid gap-3 xl:grid-cols-[1.45fr_.75fr]">
      <Panel><PanelHeader title="Transaction flow" meta={current ? `EVENT ${index + 1} / ${timeline.length}` : "LOADING"} action={<ProvenanceBadge type="HISTORICAL" />} /><div className="relative flex min-h-[320px] items-center justify-around overflow-hidden p-6 terminal-grid">
        {current ? <>{[
          [current.fromLabel || "FROM ADDRESS", shortAddress(current.from)], [current.method || "CALL", `BLOCK ${current.block.toLocaleString()}`], [current.toLabel || (current.to === "Contract Creation" ? "CONTRACT CREATION" : "TO ADDRESS"), current.to === "Contract Creation" ? "NEW CONTRACT" : shortAddress(current.to)],
        ].map(([label, value], nodeIndex) => <div key={`${index}-${nodeIndex}`} className="relative z-10 w-[28%] border border-[#444a44] bg-[#0b0e0c] p-3 text-center"><motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}><div className="font-mono text-[8px] uppercase text-muted">{label}</div><div className="mt-3 truncate font-mono text-[10px] text-bone">{value}</div></motion.div></div>)}
          <div className="absolute left-[25%] right-[25%] top-1/2 h-px bg-[#424842]" /><motion.div key={index} className="absolute left-[25%] top-[calc(50%-3px)] z-20 h-1.5 w-1.5 rounded-full bg-signal" animate={{ left: ["25%", "50%", "75%"] }} transition={{ duration: 1.1 / speed, ease: "linear" }} /></> : <DataUnavailable label={result.error ?? "LOADING HISTORICAL TRANSACTIONS"} />}
        <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 border border-line bg-[#090b0a]/95 font-mono text-[9px]"><div className="border-r border-line p-2"><span className="text-muted">METHOD</span><b className="float-right">{current?.method ?? "—"}</b></div><div className="border-r border-line p-2"><span className="text-muted">AMOUNT</span><b className="float-right">{current?.amount ?? "—"}</b></div><div className="p-2"><span className="text-muted">FEE</span><b className="float-right">{current?.fee ?? "—"} ETH</b></div></div>
      </div><SourceFooter source="Supplied Etherscan CSV exports" type="HISTORICAL" /></Panel>
      <Panel><PanelHeader title="Incident reference" meta="PUBLIC REPORTS" /><div className="divide-y divide-line">{[["Attack transaction", shortAddress(referenceValue("Attack tx"), 8)], ["Exploiter", shortAddress(referenceValue("Exploiter address 1"))], ["Exploit contract", shortAddress(referenceValue("Exploit contract 1"))], ["DAI loss", `$${Number(referenceValue("Loss - DAI USD")).toLocaleString()}`], ["WBTC loss", `$${Number(referenceValue("Loss - WBTC USD")).toLocaleString()}`], ["stETH loss", `$${Number(referenceValue("Loss - stETH USD")).toLocaleString()}`], ["USDC loss", `$${Number(referenceValue("Loss - USDC USD")).toLocaleString()}`]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 px-3 py-3 font-mono text-[9px]"><span className="text-muted">{label}</span><span className="text-right">{value}</span></div>)}</div><SourceFooter source="Euler reference CSV" type="HISTORICAL" /></Panel>
    </div>
    <Panel className="mt-3"><PanelHeader title="Replay controls" meta={current?.timestamp ?? "—"} /><div className="p-3"><div className="flex flex-wrap items-center gap-2"><Button size="sm" variant={playing ? "primary" : "outline"} onClick={() => setPlaying(!playing)} disabled={!timeline.length}>{playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}{playing ? "Pause" : "Play"}</Button><Button size="sm" onClick={reset}><RotateCcw className="h-3 w-3" />Reset</Button>{[1,2,4].map((value) => <Button key={value} size="sm" variant={speed === value ? "primary" : "ghost"} onClick={() => setSpeed(value)}>{value}x</Button>)}<span className="ml-auto font-mono text-[9px] text-muted">BLOCK {current?.block.toLocaleString() ?? "—"}</span></div><button className="relative mt-4 h-5 w-full" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setIndex(Math.min(timeline.length - 1, Math.max(0, Math.round(((event.clientX - rect.left) / rect.width) * (timeline.length - 1))))); }}><span className="absolute left-0 right-0 top-2 h-px bg-[#3a403a]" /><span className="absolute left-0 top-2 h-px bg-signal" style={{ width: `${progress}%` }} /><span className="absolute top-[5px] h-2 w-2 -translate-x-1/2 bg-signal" style={{ left: `${progress}%` }} /></button></div></Panel>
    <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_320px]">
      <Panel><PanelHeader title="Historical transaction timeline" meta={`${timeline.length} INCIDENT-WINDOW ROWS`} /><div className="max-h-[470px] overflow-auto"><table className="data-table min-w-[1250px]"><thead className="sticky top-0 z-10"><tr><th>Block</th><th>Timestamp</th><th>From</th><th>To</th><th>Value</th><th>Transaction hash</th><th>Event</th><th>Type</th></tr></thead><tbody>{timeline.map((transaction, rowIndex) => <tr key={transaction.hash} onClick={() => setIndex(rowIndex)} className={cn("cursor-pointer", rowIndex === index && "!bg-[#1b2118]")}><td className={transaction.block === 16_817_996 ? "text-danger" : ""}>{transaction.block}</td><td>{transaction.timestamp}</td><td title={transaction.from}>{transaction.fromLabel || shortAddress(transaction.from)}</td><td title={transaction.to}>{transaction.toLabel || shortAddress(transaction.to)}</td><td>{transaction.amount}</td><td>{shortAddress(transaction.hash, 8)}</td><td>{transaction.method}</td><td><ProvenanceBadge type="HISTORICAL" /></td></tr>)}</tbody></table></div><SourceFooter source="3 supplied Etherscan address exports" type="HISTORICAL" /></Panel>
      <Panel><PanelHeader title="Early signal analysis" action={<ProvenanceBadge type="DERIVED" />} /><div className="p-4"><div className="eyebrow">Earliest anomaly detected</div><div className="mt-2 font-mono text-lg">—</div><div className="mt-6 eyebrow">Attack transaction</div><div className="mt-2 break-all font-mono text-[10px]">{referenceValue("Attack tx")}</div><div className="mt-6 eyebrow">Possible warning window</div><div className="mt-2 font-mono text-sm text-muted">NOT VALIDATED</div><div className="mt-6 border border-amber/25 bg-amber/5 p-3 text-[11px] leading-5 text-amber">No validated early-warning window available from current dataset.</div><p className="mt-4 text-[10px] leading-5 text-muted">The supplied exports are address transaction histories, not a complete pre-incident protocol telemetry set. Warning time is therefore not inferred.</p></div><SourceFooter source="Safe Sphere evidence policy" type="DERIVED" /></Panel>
    </div>
  </PageFrame>;
}
