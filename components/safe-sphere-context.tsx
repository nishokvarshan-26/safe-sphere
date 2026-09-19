"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Mode = "LIVE" | "REPLAY";

interface SafeSphereContextValue {
  mode: Mode;
  setMode: (mode: Mode) => void;
  watchlist: string[];
  toggleWatchlist: (slug: string) => void;
}

const SafeSphereContext = createContext<SafeSphereContextValue | null>(null);

export function SafeSphereProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("LIVE");
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const storedMode = window.localStorage.getItem("safe-sphere-mode");
    const storedWatchlist = window.localStorage.getItem("safe-sphere-watchlist");
    if (storedMode === "LIVE" || storedMode === "REPLAY") setModeState(storedMode);
    if (storedWatchlist) {
      try { setWatchlist(JSON.parse(storedWatchlist)); } catch { setWatchlist([]); }
    }
  }, []);

  const setMode = (nextMode: Mode) => {
    setModeState(nextMode);
    window.localStorage.setItem("safe-sphere-mode", nextMode);
  };
  const toggleWatchlist = (slug: string) => {
    setWatchlist((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      window.localStorage.setItem("safe-sphere-watchlist", JSON.stringify(next));
      return next;
    });
  };

  return <SafeSphereContext.Provider value={{ mode, setMode, watchlist, toggleWatchlist }}>{children}</SafeSphereContext.Provider>;
}

export function useSafeSphere() {
  const context = useContext(SafeSphereContext);
  if (!context) throw new Error("useSafeSphere must be used inside SafeSphereProvider");
  return context;
}
