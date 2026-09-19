import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { EulerTransaction, Incident, OracleRound } from "@/lib/types";

const dataDirectory = path.join(process.cwd(), "data");

export const datasetFiles = {
  "oracle-tusd": "chainlink_tusd_usd_oracle_sample.csv",
  "defitainter-incidents": "defitainter_price_manipulation_incidents.csv",
  "euler-reference": "euler_incident_reference.csv",
  "euler-exploiter-1": "export-0xB2698C2D99aD2c302a95A8DB26B08D17a77cedd4.csv",
  "euler-exploiter-2": "export-0xb66cd966670d962C227B3EABA30a872DbFb995db.csv",
  "euler-related-3": "export-0x5F259D0b76665c337c6104145894F4D1D2758B8c.csv",
  "combined-workbook": "safe_sphere_dataset_pack.xlsx",
  "dataset-readme": "README_SAFE_SPHERE_DATA.txt",
} as const;

export type DatasetId = keyof typeof datasetFiles;

export function getDatasetPath(id: string) {
  if (!(id in datasetFiles)) return null;
  return path.join(dataDirectory, datasetFiles[id as DatasetId]);
}

export function parseCsv(input: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.length)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  const [headers = [], ...body] = rows;
  return body.map((cells) => Object.fromEntries(headers.map((header, index) => [header.trim(), cells[index] ?? ""])));
}

export function readCsv(id: DatasetId) {
  const filePath = getDatasetPath(id);
  if (!filePath) return [];
  return parseCsv(fs.readFileSync(filePath, "utf8"));
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[], average: number) {
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length);
}

export function getOracleRounds(): OracleRound[] {
  const raw = readCsv("oracle-tusd");
  return raw.map((row, index) => {
    const price = Number(row.answer_raw) / 100_000_000;
    const previous = index > 0 ? Number(raw[index - 1].answer_raw) / 100_000_000 : null;
    const window = raw.slice(Math.max(0, index - 4), index + 1).map((entry) => Number(entry.answer_raw) / 100_000_000);
    const rollingMean = window.length >= 3 ? mean(window) : null;
    const rollingStd = rollingMean !== null ? standardDeviation(window, rollingMean) : null;
    const zScore = rollingMean !== null && rollingStd ? (price - rollingMean) / rollingStd : null;
    const interval = index > 0 ? Number(row.updatedAt) - Number(raw[index - 1].updatedAt) : null;
    const status = interval !== null && interval > 21_600 ? "stale" : zScore !== null && Math.abs(zScore) >= 1.5 ? "deviation" : "normal";
    return {
      roundId: row.roundId,
      answerRaw: row.answer_raw,
      price,
      updatedAt: Number(row.updatedAt),
      phaseId: Number(row.phaseId),
      aggregatorRoundId: Number(row.aggregatorRoundId),
      dateTime: `${row.dateTimeAt} UTC`,
      interval,
      change: previous ? ((price - previous) / previous) * 100 : null,
      rollingMean,
      rollingStd,
      zScore,
      status,
    };
  });
}

export function getIncidents(): Incident[] {
  return readCsv("defitainter-incidents").map((row) => ({
    time: row.time,
    project: row.exploited_project,
    logicAddress: row.logic_addr,
    storageAddress: row.storage_addr,
    functionSignature: row.func_sign,
    platform: row.platform,
    blockNumber: Number(row.block_number),
  }));
}

function toEulerTransaction(row: Record<string, string>, dataset: string): EulerTransaction {
  return {
    hash: row["Transaction Hash"],
    status: row.Status,
    method: row.Method,
    block: Number(row.Blockno),
    timestamp: `${row["DateTime (UTC)"]} UTC`,
    from: row.From,
    fromLabel: row.From_Nametag,
    to: row.To,
    toLabel: row.To_Nametag,
    amount: row.Amount,
    usdValue: row["Value (USD)"],
    fee: row["Txn Fee"],
    dataset,
  };
}

export function getEulerReplay() {
  const sources: [DatasetId, string][] = [
    ["euler-exploiter-1", "Euler Finance Exploiter 1"],
    ["euler-exploiter-2", "Euler Finance Exploiter 2"],
    ["euler-related-3", "Euler related / frontrunner"],
  ];
  const transactions = sources
    .flatMap(([id, label]) => readCsv(id).map((row) => toEulerTransaction(row, label)))
    .filter((transaction, index, all) => all.findIndex((candidate) => candidate.hash === transaction.hash) === index)
    .sort((a, b) => a.block - b.block || a.timestamp.localeCompare(b.timestamp));
  const reference = Object.fromEntries(readCsv("euler-reference").map((row) => [row.field, { value: row.value, source: row.source_note }]));
  return { transactions, reference };
}

export function getDatasetCatalog() {
  const descriptions: Record<DatasetId, { title: string; source: string; type: string; dateRange: string }> = {
    "oracle-tusd": { title: "Chainlink TUSD / USD rounds", source: "Chainlink / Etherisc sample", type: "HISTORICAL", dateRange: "08–10 Nov 2022" },
    "defitainter-incidents": { title: "DeFiTainter manipulation incidents", source: "DeFiTainter research", type: "HISTORICAL", dateRange: "2020–2023" },
    "euler-reference": { title: "Euler incident reference", source: "Public incident reports", type: "HISTORICAL", dateRange: "13 Mar 2023" },
    "euler-exploiter-1": { title: "Euler Exploiter 1 transactions", source: "Etherscan export", type: "HISTORICAL", dateRange: "2023–2025" },
    "euler-exploiter-2": { title: "Euler Exploiter 2 transactions", source: "Etherscan export", type: "HISTORICAL", dateRange: "2023–2025" },
    "euler-related-3": { title: "Euler related address transactions", source: "Etherscan export", type: "HISTORICAL", dateRange: "Mar–Dec 2023" },
    "combined-workbook": { title: "Safe Sphere combined workbook", source: "Supplied dataset pack", type: "HISTORICAL", dateRange: "2020–2025" },
    "dataset-readme": { title: "Dataset provenance notes", source: "Supplied dataset pack", type: "HISTORICAL", dateRange: "—" },
  };
  return (Object.keys(datasetFiles) as DatasetId[]).map((id) => {
    const filePath = getDatasetPath(id)!;
    const extension = path.extname(filePath).toLowerCase();
    const rows = extension === ".csv" ? readCsv(id).length : null;
    const columns = extension === ".csv" ? Object.keys(readCsv(id)[0] ?? {}).length : null;
    return { id, file: datasetFiles[id], bytes: fs.statSync(filePath).size, rows, columns, ...descriptions[id] };
  });
}
