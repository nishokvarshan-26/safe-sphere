"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { useApi } from "@/hooks/use-api";
import { alertsFromOracle, eulerAttackAlert } from "@/lib/alerts";
import type { OracleRound, SecurityAlert } from "@/lib/types";
import { Button, DataUnavailable, ProvenanceBadge, SourceFooter, StatusBadge } from "@/components/ui/primitives";
import { cn, downloadData, toCsv } from "@/lib/utils";

interface OracleResponse { data: OracleRound[] }

export function AlertsPage() {
  const oracle = useApi<OracleResponse>("/api/oracle");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL SEVERITIES");
  const alerts = useMemo(() => [eulerAttackAlert, ...alertsFromOracle(oracle.data?.data ?? []).reverse()], [oracle.data]);
  const filtered = alerts.filter((alert) => `${alert.protocol} ${alert.signal} ${alert.component}`.toLowerCase().includes(search.toLowerCase()) && (severity === "ALL SEVERITIES" || alert.severity.toUpperCase() === severity));
  const exportAlerts = () => downloadData("safe-sphere-alerts.csv", toCsv(filtered as unknown as Record<string, unknown>[]), "text/csv");
  return <PageFrame eyebrow="Detection ledger / 06" title="Security Alerts" description="Explainable historical and statistically derived signals. No connected real-time detection stream is represented as active." type="DERIVED" actions={<Button size="sm" onClick={exportAlerts}><Download className="h-3 w-3" />Export ledger</Button>}>
    <div className="mb-3 grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
      <div className="panel p-3"><div className="eyebrow">Current live alerts</div><div className="mt-2 font-mono text-xl">—</div><div className="mt-1 font-mono text-[9px] text-muted">Live feed unavailable</div></div>
      <div className="panel p-3"><div className="eyebrow">Historical confirmed</div><div className="mt-2 font-mono text-xl text-danger">01</div><div className="mt-1 font-mono text-[9px] text-muted">Euler / 13 Mar 2023</div></div>
      <div className="panel p-3"><div className="eyebrow">Derived signals</div><div className="mt-2 font-mono text-xl text-amber">{Math.max(0, alerts.length - 1).toString().padStart(2, "0")}</div><div className="mt-1 font-mono text-[9px] text-muted">Chainlink sample window</div></div>
      <div className="panel p-3"><div className="eyebrow">Signal policy</div><div className="mt-2 font-mono text-xl">INVESTIGATE</div><div className="mt-1 font-mono text-[9px] text-muted">Never predictive certainty</div></div>
    </div>
    <div className="panel">
      <div className="flex flex-wrap gap-2 border-b border-line p-2"><label className="flex h-8 min-w-64 flex-1 items-center border border-line bg-[#090b0a] px-2"><Search className="mr-2 h-3 w-3 text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent font-mono text-[10px] outline-none" placeholder="Search signal, protocol, component…" /></label><select value={severity} onChange={(event) => setSeverity(event.target.value)} className="terminal-input"><option>ALL SEVERITIES</option><option>CRITICAL</option><option>WARNING</option><option>NOTICE</option></select></div>
      <div className="overflow-x-auto"><table className="data-table min-w-[1600px]"><thead><tr><th>Timestamp</th><th>Severity</th><th>Protocol</th><th>Signal</th><th>Metric</th><th>Observed</th><th>Baseline</th><th>Deviation</th><th>Affected component</th><th>Confidence</th><th>Source</th><th>Type</th><th>Status</th></tr></thead><tbody>{filtered.map((alert) => <tr key={alert.id}><td>{alert.timestamp}</td><td><StatusBadge status={alert.severity} /></td><td className="font-sans font-semibold text-bone">{alert.protocol}</td><td><Link href={`/alerts/${alert.id}`} className="text-bone hover:text-signal">{alert.signal}</Link></td><td>{alert.metric}</td><td>{alert.observed}</td><td>{alert.baseline}</td><td>{alert.deviation}</td><td>{alert.component}</td><td>{alert.confidence}</td><td>{alert.source}</td><td><ProvenanceBadge type={alert.provenance} /></td><td>{alert.status}</td></tr>)}</tbody></table></div>
      {!filtered.length && <div className="p-3"><DataUnavailable label="NO ALERTS MATCH CURRENT FILTERS" /></div>}
      <SourceFooter source="Supplied Chainlink + Euler datasets" type="DERIVED" />
    </div>
  </PageFrame>;
}

export function AlertDetailPage({ id }: { id: string }) {
  const oracle = useApi<OracleResponse>("/api/oracle");
  const alerts = [eulerAttackAlert, ...alertsFromOracle(oracle.data?.data ?? [])];
  const alert = alerts.find((item) => item.id === id);
  if (oracle.loading && !alert) return <PageFrame eyebrow="Alert investigation" title="Loading evidence" description="Reading local historical evidence…"><div className="h-64 animate-pulse bg-[#111411]" /></PageFrame>;
  if (!alert) return <PageFrame eyebrow="Alert investigation" title="Alert not found" description="The requested alert is not present in the validated local evidence set."><DataUnavailable label="ALERT NOT FOUND" /></PageFrame>;
  const isEuler = alert.id.startsWith("euler");
  const fields = [
    ["WHAT HAPPENED?", isEuler ? "A transaction identified by public incident reports as the Euler exploit was confirmed at the supplied block." : alert.signal + " was observed in the historical TUSD/USD round sample."],
    ["WHY WAS IT FLAGGED?", isEuler ? "This transaction hash and block are part of the curated incident reference and Etherscan export." : alert.signal.includes("Stale") ? "The interval since the prior supplied round exceeded the explicit six-hour analysis threshold." : "The five-round rolling z-score crossed the absolute 1.5σ analysis threshold."],
    ["OBSERVED VALUE", alert.observed], ["NORMAL RANGE", alert.baseline], ["STATISTICAL DEVIATION", alert.deviation],
    ["TRANSACTION / BLOCK", isEuler ? "0xc310a0af…d6b111d / block 16,817,996" : "Oracle round; no transaction hash in supplied file"],
    ["CONTRACT", isEuler ? "0xeBC29199C817Dc47BA12E3F86102564D640CBf99" : "Feed address not supplied"],
    ["RELATED ADDRESSES", isEuler ? "0x5f259d0b76665c337c6104145894f4d1d2758b8c" : "Not supplied"],
    ["DEPENDENCIES", isEuler ? "See replay and simulation graph" : "TUSD/USD consumers; consumer list not supplied"],
    ["POTENTIAL IMPACT", isEuler ? "Confirmed historical exploit impact. See the incident reference for loss breakdown." : "Potentially stale or deviating input for feed consumers. Dependency exposure is not confirmed compromise."],
    ["RECOMMENDED INVESTIGATION", isEuler ? "Review the full transaction replay, call trace, affected markets, and public postmortems." : "Compare with independent spot markets, inspect neighboring rounds, feed heartbeat, and downstream consumers."],
    ["DATA SOURCE", alert.source],
  ];
  return <PageFrame eyebrow={`Alert / ${alert.id}`} title={alert.signal} description="Abnormal behaviour detected. Requires investigation. Potential exposure is not a prediction of compromise." type={alert.provenance} actions={<Link href="/alerts"><Button size="sm">Back to alerts</Button></Link>}>
    <div className="mb-3 flex flex-wrap items-center gap-3 border border-line bg-panel p-3"><StatusBadge status={alert.severity} /><span className="font-mono text-[10px]">{alert.protocol}</span><span className="font-mono text-[9px] text-muted">{alert.timestamp}</span><ProvenanceBadge type={alert.provenance} /><span className="ml-auto font-mono text-[9px] text-muted">{alert.status}</span></div>
    <div className="grid gap-px bg-line md:grid-cols-2 xl:grid-cols-3">{fields.map(([label, value]) => <div key={label} className="min-h-32 bg-panel p-4"><div className="eyebrow">{label}</div><div className="mt-4 break-words font-mono text-[11px] leading-5 text-[#ccd0c9]">{value}</div></div>)}</div>
  </PageFrame>;
}
