"use client";

import { useEffect, useState } from "react";
import { Activity, Radio, WifiOff } from "lucide-react";
import { PageFrame, RefreshButton } from "@/components/page-frame";
import { useApi } from "@/hooks/use-api";
import { DataUnavailable, Metric, Panel, PanelHeader, ProvenanceBadge, SourceFooter } from "@/components/ui/primitives";
import { formatNumber, shortAddress } from "@/lib/utils";

interface BlockRecord { number: number; timestamp: string; transactionCount: number; gasUsed: number; gasLimit: number; hash: string }
interface EthereumResponse { data: BlockRecord[]; provenance: { source: string; type: "LIVE"; updatedAt: string } }

export function LivePage() {
  const result = useApi<EthereumResponse>("/api/ethereum", 12_000);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => { setSeconds(0); const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [result.data?.provenance.updatedAt]);
  const blocks = result.data?.data ?? [];
  const latest = blocks[0];
  const averageTransactions = blocks.length ? blocks.reduce((sum, block) => sum + block.transactionCount, 0) / blocks.length : null;
  const averageGas = blocks.length ? blocks.reduce((sum, block) => sum + (block.gasUsed / block.gasLimit) * 100, 0) / blocks.length : null;
  return <PageFrame eyebrow="Chain operations / 05" title="Live Chain Monitor" description="Polling the latest Ethereum blocks through the configured RPC or public fallback. Event-specific panels remain unavailable without indexed addresses and logs." type={latest ? "LIVE" : undefined} actions={<RefreshButton onClick={result.refresh} loading={result.loading} />}>
    <div className={`mb-3 flex items-center border p-3 font-mono text-[10px] ${latest ? "border-signal/30 bg-signal/5 text-signal" : "border-danger/30 bg-danger/5 text-danger"}`}>{latest ? <Radio className="mr-2 h-3.5 w-3.5 animate-pulse" /> : <WifiOff className="mr-2 h-3.5 w-3.5" />}{latest ? `ETHEREUM RPC CONNECTED · POLL AGE ${seconds}S · ${result.data?.provenance.source}` : "LIVE SOURCE UNAVAILABLE · RETRYING EVERY 12 SECONDS"}</div>
    <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-5"><Metric label="Latest block" value={latest ? `#${latest.number.toLocaleString()}` : "—"} type={latest ? "LIVE" : undefined} tone={latest ? "green" : undefined} /><Metric label="Transactions" value={latest?.transactionCount ?? "—"} detail="Latest block" type={latest ? "LIVE" : undefined} /><Metric label="Gas used" value={latest ? formatNumber(latest.gasUsed) : "—"} type={latest ? "LIVE" : undefined} /><Metric label="Avg transactions" value={averageTransactions ? Math.round(averageTransactions) : "—"} detail="7 observed blocks" type={averageTransactions ? "DERIVED" : undefined} /><Metric label="Avg gas utilization" value={averageGas ? `${averageGas.toFixed(1)}%` : "—"} detail="7 observed blocks" type={averageGas ? "DERIVED" : undefined} /></div>
    <div className="mt-3 grid gap-3 xl:grid-cols-[1.35fr_.65fr]">
      <Panel><PanelHeader title="Latest blocks" meta="ETHEREUM MAINNET" action={latest ? <ProvenanceBadge type="LIVE" /> : undefined} /><div className="overflow-x-auto"><table className="data-table min-w-[800px]"><thead><tr><th>Block number</th><th>Timestamp</th><th>Transaction count</th><th>Gas used</th><th>Gas limit</th><th>Utilization</th><th>Block hash</th></tr></thead><tbody>{blocks.map((block) => <tr key={block.number}><td className="text-signal">#{block.number.toLocaleString()}</td><td>{new Date(block.timestamp).toLocaleString()}</td><td>{block.transactionCount.toLocaleString()}</td><td>{block.gasUsed.toLocaleString()}</td><td>{block.gasLimit.toLocaleString()}</td><td>{((block.gasUsed / block.gasLimit) * 100).toFixed(2)}%</td><td title={block.hash}>{shortAddress(block.hash, 10)}</td></tr>)}</tbody></table></div>{!blocks.length && <div className="p-3"><DataUnavailable /></div>}<SourceFooter source={result.data?.provenance.source ?? "Ethereum RPC unavailable"} type="LIVE" updated={result.data?.provenance.updatedAt} /></Panel>
      <Panel><PanelHeader title="Stream status" meta="CAPABILITY MATRIX" /><div className="divide-y divide-line">{[["Latest blocks", Boolean(latest)], ["Transaction hashes", Boolean(latest)], ["Large transfers", false], ["Contract interactions", false], ["Protocol events", false], ["Admin actions", false], ["Token movements", false]].map(([label, active]) => <div key={String(label)} className="flex items-center px-3 py-3 font-mono text-[9px]"><span className={`mr-2 h-1.5 w-1.5 rounded-full ${active ? "bg-signal" : "bg-[#555b55]"}`} /><span>{String(label)}</span><span className={`ml-auto ${active ? "text-signal" : "text-muted"}`}>{active ? "LIVE" : "NOT CONFIGURED"}</span></div>)}</div><SourceFooter source="Runtime configuration" type="DERIVED" /></Panel>
    </div>
    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{[["Monitored transactions", "Add protocol address registry"], ["Large transfers", "Requires indexed transfer logs"], ["Admin actions", "Requires role and event signatures"], ["Token movements", "Requires token address scope"]].map(([title, note]) => <Panel key={title}><PanelHeader title={title} /><div className="p-3"><DataUnavailable label="SOURCE UNAVAILABLE" compact /><p className="mt-3 font-mono text-[9px] text-muted">{note}</p></div></Panel>)}</div>
  </PageFrame>;
}
