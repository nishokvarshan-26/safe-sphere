import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value?: number | null, compact = true) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : 0,
  }).format(value);
}

export function formatNumber(value?: number | null, compact = true) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function shortAddress(value?: string | null, size = 5) {
  if (!value) return "—";
  if (value.length < size * 2 + 2) return value;
  return `${value.slice(0, size + 2)}…${value.slice(-size)}`;
}

export function downloadData(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [keys.map(escape).join(","), ...rows.map((row) => keys.map((key) => escape(row[key])).join(","))].join("\n");
}
