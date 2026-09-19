import { PageFrame } from "@/components/page-frame";
import { ProtocolTable } from "@/components/protocol-table";

export const metadata = { title: "Protocol Rankings" };
export default function Page() {
  return <PageFrame eyebrow="Market intelligence / 02" title="Protocol Rankings" description="Sortable institutional coverage of monitored DeFi protocols. Missing source values are intentionally left blank; no financial metric is synthesized." type="LIVE"><ProtocolTable /></PageFrame>;
}
