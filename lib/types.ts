export type Provenance = "LIVE" | "HISTORICAL" | "DERIVED" | "SIMULATION";
export type Severity = "critical" | "warning" | "notice" | "healthy";

export interface ProtocolRecord {
  rank: number;
  name: string;
  slug: string;
  symbol?: string | null;
  category?: string | null;
  chains?: string[];
  tvl?: number | null;
  change1d?: number | null;
  change7d?: number | null;
  fees24h?: number | null;
  fees7d?: number | null;
  fees30d?: number | null;
  revenue24h?: number | null;
  revenue7d?: number | null;
  revenue30d?: number | null;
  mcap?: number | null;
  users?: number | null;
  transactions24h?: number | null;
  updatedAt?: string | null;
}

export interface OracleRound {
  roundId: string;
  answerRaw: string;
  price: number;
  updatedAt: number;
  phaseId: number;
  aggregatorRoundId: number;
  dateTime: string;
  interval: number | null;
  change: number | null;
  rollingMean: number | null;
  rollingStd: number | null;
  zScore: number | null;
  status: "normal" | "deviation" | "stale";
}

export interface EulerTransaction {
  hash: string;
  status: string;
  method: string;
  block: number;
  timestamp: string;
  from: string;
  fromLabel: string;
  to: string;
  toLabel: string;
  amount: string;
  usdValue: string;
  fee: string;
  dataset: string;
}

export interface Incident {
  time: string;
  project: string;
  logicAddress: string;
  storageAddress: string;
  functionSignature: string;
  platform: string;
  blockNumber: number;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: Severity;
  protocol: string;
  signal: string;
  metric: string;
  observed: string;
  baseline: string;
  deviation: string;
  component: string;
  confidence: string;
  source: string;
  status: string;
  provenance: Provenance;
}
