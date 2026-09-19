"use client";

import { useCallback, useEffect, useState } from "react";

export function useApi<T>(url: string, refreshMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const response = await fetch(url, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Source unavailable");
      setData(payload);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Source unavailable");
    } finally {
      setLoading(false);
    }
  }, [url]);
  useEffect(() => {
    load();
    if (!refreshMs) return;
    const interval = window.setInterval(load, refreshMs);
    return () => window.clearInterval(interval);
  }, [load, refreshMs]);
  return { data, error, loading, refresh: load };
}
