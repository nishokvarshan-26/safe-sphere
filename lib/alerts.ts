import type { OracleRound, SecurityAlert } from "@/lib/types";

export function alertsFromOracle(rounds: OracleRound[]): SecurityAlert[] {
  return rounds.filter((round) => round.status !== "normal").map((round) => ({
    id: `oracle-${round.aggregatorRoundId}`,
    timestamp: round.dateTime,
    severity: round.status === "stale" ? "warning" : "notice",
    protocol: "Chainlink TUSD/USD",
    signal: round.status === "stale" ? "Stale oracle interval" : "Oracle price deviation",
    metric: round.status === "stale" ? "Update interval" : "Rolling Z-score",
    observed: round.status === "stale" ? `${round.interval?.toLocaleString()} sec` : `$${round.price.toFixed(8)}`,
    baseline: round.status === "stale" ? "≤ 21,600 sec threshold" : round.rollingMean ? `$${round.rollingMean.toFixed(8)} rolling mean` : "—",
    deviation: round.status === "stale" ? `${((round.interval ?? 0) / 3600).toFixed(2)} hours` : `${round.zScore?.toFixed(3)}σ`,
    component: "TUSD/USD price feed",
    confidence: "Statistical signal only",
    source: "Chainlink sample",
    status: "ARCHIVED",
    provenance: "DERIVED",
  }));
}

export const eulerAttackAlert: SecurityAlert = {
  id: "euler-attack-16817996",
  timestamp: "2023-03-13 08:50:59 UTC",
  severity: "critical",
  protocol: "Euler Finance",
  signal: "Historical exploit transaction",
  metric: "Known attack transaction",
  observed: "Block 16,817,996",
  baseline: "Not applicable",
  deviation: "Not a statistical alert",
  component: "Euler Exploit Contract 1",
  confidence: "Confirmed historical incident",
  source: "Etherscan + incident reports",
  status: "CONFIRMED / ARCHIVED",
  provenance: "HISTORICAL",
};
