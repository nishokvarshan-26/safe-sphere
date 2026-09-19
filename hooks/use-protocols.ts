"use client";

import { useMemo } from "react";
import { trackedProtocols } from "@/lib/protocols";
import type { ProtocolRecord } from "@/lib/types";
import { useApi } from "@/hooks/use-api";

interface ProtocolResponse {
  data: ProtocolRecord[];
  provenance: { source: string; type: "LIVE"; updatedAt: string };
  partial: { fees: boolean; revenue: boolean };
}

export function useProtocols() {
  const response = useApi<ProtocolResponse>("/api/protocols", 300_000);
  const fallback = useMemo<ProtocolRecord[]>(() => trackedProtocols.map(([name, slug], index) => ({ rank: index + 1, name, slug })), []);
  return { ...response, protocols: response.data?.data ?? fallback, live: Boolean(response.data), provenance: response.data?.provenance, partial: response.data?.partial };
}
