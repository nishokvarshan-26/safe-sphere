"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search, ArrowUpRight, Command } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { trackedProtocols } from "@/lib/protocols";

const baseCommands = [
  ["Open Command Center", "/dashboard", "G D"],
  ["Open Protocol Rankings", "/protocols", "G P"],
  ["Open Alerts", "/alerts", "G A"],
  ["Open Oracle Lab", "/oracle", "G O"],
  ["Replay Euler Attack", "/replay/euler", "G R"],
  ["Open Exploit Intelligence", "/intelligence", "G I"],
  ["Open Dependency Map", "/dependencies", "G X"],
  ["Open Dataset Explorer", "/data", "G E"],
] as const;

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const commands = useMemo(() => {
    const protocols = trackedProtocols.map(([name, slug]) => [`Open ${name}`, `/protocols/${slug}`, "PROTOCOL"] as const);
    return [...baseCommands, ...protocols].filter(([label]) => label.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  useEffect(() => { if (!open) setQuery(""); }, [open]);
  const go = (href: string) => { router.push(href); setOpen(false); };
  const directSearch = query.startsWith("0x") && (query.length === 42 || query.length === 66);

  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-[2px]" />
      <Dialog.Content className="fixed left-1/2 top-[16vh] z-[151] w-[min(620px,calc(100vw-24px))] -translate-x-1/2 border border-[#434943] bg-[#0c0f0d] shadow-2xl outline-none">
        <Dialog.Title className="sr-only">Safe Sphere command palette</Dialog.Title>
        <div className="flex h-12 items-center border-b border-line px-4">
          <Search className="mr-3 h-4 w-4 text-muted" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search protocol, wallet, transaction, or command…" className="h-full flex-1 bg-transparent font-mono text-xs text-bone outline-none placeholder:text-[#555a55]" />
          <span className="border border-line px-1.5 py-0.5 font-mono text-[8px] text-muted">ESC</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-2">
          <div className="px-2 py-2 font-mono text-[8px] uppercase tracking-[.18em] text-[#626862]">Navigation & research</div>
          {directSearch && <button onClick={() => window.open(`https://etherscan.io/${query.length === 66 ? "tx" : "address"}/${query}`, "_blank")} className="flex h-10 w-full items-center gap-3 px-3 text-left font-mono text-[11px] hover:bg-[#171b17]">
            <ArrowUpRight className="h-3.5 w-3.5 text-signal" /><span className="flex-1">Inspect on Etherscan</span><span className="text-[9px] text-muted">EXTERNAL</span>
          </button>}
          {commands.map(([label, href, shortcut]) => <button key={href} onClick={() => go(href)} className="group flex h-10 w-full items-center gap-3 px-3 text-left font-mono text-[11px] hover:bg-[#171b17]">
            <Command className="h-3.5 w-3.5 text-[#666c66] group-hover:text-signal" /><span className="flex-1">{label}</span><span className="text-[8px] text-[#555a55]">{shortcut}</span>
          </button>)}
          {!commands.length && !directSearch && <div className="px-3 py-10 text-center font-mono text-[10px] text-muted">NO MATCHING COMMANDS</div>}
        </div>
        <div className="flex items-center gap-4 border-t border-line px-4 py-2 font-mono text-[8px] uppercase text-[#606660]"><span>↑↓ Navigate</span><span>↵ Open</span><span className="ml-auto">Safe Sphere Index</span></div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
