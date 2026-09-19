"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity, Bell, Blocks, BookOpenText, Bot, Boxes, ChartNoAxesCombined, ChevronsLeft,
  CircleDot, Command, Database, FileText, GitCompareArrows, Hexagon, LayoutDashboard,
  Menu, Network, Radio, Search, Settings, ShieldAlert, Star, X
} from "lucide-react";
import { Wordmark } from "@/components/brand";
import { CommandPalette } from "@/components/command-palette";
import { SafeSphereProvider, useSafeSphere } from "@/components/safe-sphere-context";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Overview", items: [
    ["Command Center", "/dashboard", LayoutDashboard], ["Protocol Rankings", "/protocols", ChartNoAxesCombined], ["Compare", "/compare", GitCompareArrows],
  ] },
  { label: "Security", items: [
    ["Live Monitor", "/live", Radio], ["Security Alerts", "/alerts", ShieldAlert], ["Advanced Analysis", "/analysis", Activity], ["Oracle Intelligence", "/oracle", CircleDot], ["Dependencies", "/dependencies", Network],
  ] },
  { label: "Research", items: [
    ["Attack Replay", "/replay", Blocks], ["Exploit Intelligence", "/intelligence", BookOpenText], ["Watchlist", "/watchlist", Star], ["Reports", "/reports", FileText], ["Data & Export", "/data", Database],
  ] },
] as const;

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mode, setMode } = useSafeSphere();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [block, setBlock] = useState<number | null>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    let active = true;
    const load = () => fetch("/api/ethereum").then((response) => response.ok ? response.json() : null).then((payload) => { if (active) setBlock(payload?.data?.[0]?.number ?? null); }).catch(() => { if (active) setBlock(null); });
    load();
    const interval = window.setInterval(load, 30_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const sidebar = <>
    <div className={cn("flex h-12 items-center border-b border-line px-4", collapsed && "justify-center px-0")}><Link href="/dashboard"><Wordmark compact={collapsed} /></Link></div>
    <div className="flex-1 overflow-y-auto py-3">
      {navigation.map((group) => <div key={group.label} className="mb-4">
        {!collapsed && <div className="mb-1 px-4 font-mono text-[8px] font-semibold uppercase tracking-[.2em] text-[#525752]">{group.label}</div>}
        {group.items.map(([label, href, Icon]) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} title={collapsed ? label : undefined} className={cn("relative flex h-8 items-center gap-3 border-l px-4 font-mono text-[10px] uppercase tracking-[.05em] transition-colors", active ? "border-signal bg-[#141913] text-bone" : "border-transparent text-[#858a84] hover:bg-[#111411] hover:text-bone", collapsed && "justify-center px-0")}>
            <Icon className={cn("h-3.5 w-3.5 shrink-0", active && "text-signal")} />{!collapsed && <span>{label}</span>}{label === "Security Alerts" && !collapsed && <span className="ml-auto bg-danger/15 px-1.5 py-0.5 text-[8px] text-danger">HIST</span>}
          </Link>;
        })}
      </div>)}
    </div>
    <div className="border-t border-line p-2">
      <Link href="/settings" className={cn("flex h-8 items-center gap-3 px-2 font-mono text-[10px] uppercase text-muted hover:bg-[#141714] hover:text-bone", collapsed && "justify-center")}><Settings className="h-3.5 w-3.5" />{!collapsed && "Settings & Sources"}</Link>
      <button onClick={() => setCollapsed(!collapsed)} className="mt-1 hidden h-8 w-full items-center justify-center text-muted hover:bg-[#141714] hover:text-bone lg:flex"><ChevronsLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} /></button>
    </div>
  </>;

  return <div className="min-h-screen bg-ink">
    <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-[#0a0c0b] transition-[width] lg:flex lg:flex-col", collapsed ? "w-14" : "w-52")}>{sidebar}</aside>
    {mobileOpen && <div className="fixed inset-0 z-50 bg-black/75 lg:hidden" onClick={() => setMobileOpen(false)}><aside className="flex h-full w-64 flex-col border-r border-line bg-[#0a0c0b]" onClick={(event) => event.stopPropagation()}>{sidebar}</aside></div>}
    <div className={cn("transition-[margin]", collapsed ? "lg:ml-14" : "lg:ml-52")}>
      <header className="sticky top-0 z-30 flex h-12 items-center border-b border-line bg-[#090b0a]/95 px-3 backdrop-blur-md lg:px-5">
        <button className="mr-3 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        <div className="hidden items-center gap-1 border border-line p-0.5 sm:flex">
          {(["LIVE", "REPLAY"] as const).map((item) => <button key={item} onClick={() => setMode(item)} className={cn("h-6 px-2.5 font-mono text-[9px] font-semibold tracking-[.1em]", mode === item ? item === "LIVE" ? "bg-signal text-ink" : "bg-[#75629e] text-white" : "text-muted hover:text-bone")}>{item}</button>)}
        </div>
        <button onClick={() => setPaletteOpen(true)} className="ml-2 flex h-7 min-w-0 max-w-[340px] flex-1 items-center gap-2 border border-line bg-[#0d100e] px-2 text-left text-muted hover:border-[#454b45] sm:ml-4">
          <Search className="h-3 w-3 shrink-0" /><span className="truncate font-mono text-[9px]">Search protocol, wallet, transaction…</span><span className="ml-auto hidden items-center gap-0.5 border border-line px-1 py-0.5 font-mono text-[8px] md:flex"><Command className="h-2.5 w-2.5" />K</span>
        </button>
        <div className="ml-auto flex items-center gap-3 pl-3">
          <Link href="/live" className="hidden items-center gap-2 font-mono text-[9px] text-muted md:flex">
            <span className={cn("h-1.5 w-1.5 rounded-full", block ? "animate-pulse bg-signal" : "bg-danger")} />
            {block ? `ETH #${block.toLocaleString()}` : "RPC OFFLINE"}
          </Link>
          <Link href="/alerts" aria-label="Alerts" className="relative text-muted hover:text-bone"><Bell className="h-4 w-4" /><span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-danger" /></Link>
          <div className="hidden h-6 w-6 items-center justify-center border border-[#3b403b] bg-[#141714] font-mono text-[8px] text-signal sm:flex">SS</div>
        </div>
      </header>
      <main className="route-enter min-h-[calc(100vh-48px)]">{children}</main>
    </div>
    <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
  </div>;
}

export function TerminalShell({ children }: { children: React.ReactNode }) {
  return <SafeSphereProvider><ShellInner>{children}</ShellInner></SafeSphereProvider>;
}
