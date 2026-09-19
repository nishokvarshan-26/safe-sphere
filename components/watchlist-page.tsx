"use client";

import Link from "next/link";
import { ExternalLink, Star, Trash2 } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { useProtocols } from "@/hooks/use-protocols";
import { useSafeSphere } from "@/components/safe-sphere-context";
import { Button, DataUnavailable, SourceFooter } from "@/components/ui/primitives";
import { formatMoney, formatPercent } from "@/lib/utils";

export function WatchlistPage() {
  const { watchlist, toggleWatchlist } = useSafeSphere();
  const { protocols, live, provenance } = useProtocols();
  const watched = protocols.filter((protocol) => watchlist.includes(protocol.slug));
  return <PageFrame eyebrow="Persistent monitoring / 10" title="Watchlist" description="A locally persisted protocol shortlist. Connect Supabase in Settings to synchronize it across authenticated sessions." type="DERIVED" actions={<Link href="/protocols"><Button size="sm"><Star className="h-3 w-3" />Browse protocols</Button></Link>}>
    <div className="panel overflow-x-auto"><table className="data-table min-w-[1100px]"><thead><tr><th>Protocol</th><th>Chains</th><th>TVL</th><th>Security status</th><th>Alerts</th><th>Latest event</th><th>24H TVL change</th><th>Last checked</th><th>Actions</th></tr></thead><tbody>{watched.map((protocol) => <tr key={protocol.slug}><td><Link href={`/protocols/${protocol.slug}`} className="font-sans font-semibold text-bone hover:text-signal">{protocol.name}</Link></td><td>{protocol.chains?.length ? protocol.chains.join(" + ") : "—"}</td><td>{formatMoney(protocol.tvl)}</td><td>—</td><td>—</td><td>—</td><td>{formatPercent(protocol.change1d)}</td><td>{protocol.updatedAt ? new Date(protocol.updatedAt).toLocaleTimeString() : "—"}</td><td><div className="flex gap-1"><Link href={`/protocols/${protocol.slug}`} className="p-2 text-muted hover:text-bone"><ExternalLink className="h-3 w-3" /></Link><button onClick={() => toggleWatchlist(protocol.slug)} className="p-2 text-muted hover:text-danger"><Trash2 className="h-3 w-3" /></button></div></td></tr>)}</tbody></table>{!watched.length && <div className="p-3"><DataUnavailable label="NO PROTOCOLS IN WATCHLIST" /></div>}<SourceFooter source={live ? "DeFiLlama + local browser storage" : "Local browser storage"} type="DERIVED" updated={provenance?.updatedAt} /></div>
  </PageFrame>;
}
