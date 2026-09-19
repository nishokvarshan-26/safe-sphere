"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Database, Network, Radar, Radio } from "lucide-react";
import { SphereMark, Wordmark } from "@/components/brand";

const nodes = [
  { label: "ORACLE", x: 18, y: 28, status: "healthy" }, { label: "LENDING", x: 49, y: 16, status: "healthy" },
  { label: "LIQUIDITY", x: 76, y: 28, status: "warning" }, { label: "BRIDGE", x: 85, y: 64, status: "healthy" },
  { label: "ADMIN", x: 58, y: 78, status: "critical" }, { label: "CONTRACT", x: 28, y: 72, status: "healthy" },
  { label: "ASSET", x: 48, y: 49, status: "healthy" },
];
const edges = [[0,1],[0,6],[1,2],[1,6],[2,3],[2,6],[3,4],[4,5],[4,6],[5,0],[5,6]];

function NetworkVisual() {
  return <div className="relative h-[420px] overflow-hidden border border-line bg-[#0a0c0b] terminal-grid md:h-[560px]">
    <div className="absolute left-4 top-4 z-10 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.15em] text-muted"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />Topology model / 07 components <span className="border border-[#8f78c9]/50 px-1.5 py-0.5 text-[#bba8ea]">SIMULATION</span></div>
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {edges.map(([from, to], index) => <motion.line key={index} x1={nodes[from].x} y1={nodes[from].y} x2={nodes[to].x} y2={nodes[to].y} stroke="#404640" strokeWidth=".18" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: .9 }} transition={{ delay: .4 + index * .06, duration: 1 }} />)}
      {edges.slice(0, 7).map(([from, to], index) => <motion.circle key={`packet-${index}`} r=".45" fill={index === 4 ? "#ee5b4f" : "#b6ff4a"} initial={{ cx: nodes[from].x, cy: nodes[from].y }} animate={{ cx: [nodes[from].x, nodes[to].x], cy: [nodes[from].y, nodes[to].y] }} transition={{ duration: 3 + index * .25, repeat: Infinity, ease: "linear", delay: index * .6 }} />)}
    </svg>
    {nodes.map((node, index) => <motion.div key={node.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${node.x}%`, top: `${node.y}%` }} initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .2 + index * .08 }}>
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border bg-[#0b0e0c] ${node.status === "critical" ? "border-danger text-danger" : node.status === "warning" ? "border-amber text-amber" : "border-[#778076] text-bone"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${node.status === "critical" ? "animate-pulse bg-danger" : node.status === "warning" ? "bg-amber" : "bg-signal"}`} />
        <div className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap font-mono text-[8px] tracking-[.12em] text-[#a7aca6]">{node.label}</div>
      </div>
    </motion.div>)}
    <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 border border-line bg-[#0a0c0b]/90 font-mono text-[8px] uppercase text-muted">
      <div className="border-r border-line p-2">Edges <b className="float-right text-bone">11</b></div><div className="border-r border-line p-2">Warning <b className="float-right text-amber">01</b></div><div className="p-2">Critical <b className="float-right text-danger">01</b></div>
    </div>
  </div>;
}

export function LandingPage() {
  return <div className="min-h-screen overflow-hidden bg-ink">
    <nav className="relative z-20 flex h-16 items-center border-b border-line px-5 md:px-10">
      <Link href="/"><Wordmark /></Link>
      <div className="ml-12 hidden items-center gap-7 font-mono text-[9px] uppercase tracking-[.08em] text-muted lg:flex"><Link className="hover:text-bone" href="/dashboard">Products</Link><Link className="hover:text-bone" href="/protocols">Protocols</Link><Link className="hover:text-bone" href="/intelligence">Threat Intelligence</Link><Link className="hover:text-bone" href="/replay">Attack Replay</Link><Link className="hover:text-bone" href="/reports">Research</Link></div>
      <div className="ml-auto flex items-center gap-4"><span className="hidden items-center gap-2 font-mono text-[9px] text-muted sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />LIVE STATUS</span><Link href="/dashboard" className="flex h-9 items-center gap-2 bg-bone px-4 font-mono text-[9px] font-bold tracking-[.1em] text-ink hover:bg-signal">ENTER TERMINAL <ArrowUpRight className="h-3 w-3" /></Link></div>
    </nav>
    <main>
      <section className="relative grid min-h-[calc(100vh-64px)] border-b border-line lg:grid-cols-[.92fr_1.08fr]">
        <div className="relative flex flex-col justify-between border-b border-line p-6 md:p-10 lg:border-b-0 lg:border-r lg:p-14">
          <div className="absolute inset-0 terminal-grid opacity-30" />
          <div className="relative pt-8"><div className="eyebrow mb-8 flex items-center gap-3"><span>Web3 Security</span><span className="h-px w-12 bg-line" /><span>Protocol Health</span></div>
            <motion.h1 className="max-w-[650px] text-[clamp(72px,10vw,154px)] font-black uppercase leading-[.74] tracking-[-.085em] text-bone" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>SAFE<br /><span className="text-transparent [-webkit-text-stroke:1px_#b7bab3]">SPHERE.</span></motion.h1>
            <div className="mt-10 max-w-xl border-l border-signal pl-5"><h2 className="text-xl font-medium tracking-[-.02em]">Detect threats before they become exploits.</h2><p className="mt-4 max-w-lg text-[13px] leading-6 text-[#969b95]">A real-time Web3 security and protocol intelligence platform for monitoring risk, detecting anomalies, replaying attacks, and understanding protocol dependencies.</p></div>
            <div className="mt-8 flex flex-wrap gap-2"><Link href="/dashboard" className="flex h-10 items-center gap-3 bg-signal px-4 font-mono text-[10px] font-bold text-ink hover:bg-[#c5ff70]">OPEN COMMAND CENTER <ArrowUpRight className="h-3.5 w-3.5" /></Link><Link href="/replay/euler" className="flex h-10 items-center gap-3 border border-[#464c46] px-4 font-mono text-[10px] font-bold hover:bg-[#141714]">EXPLORE REAL ATTACKS <ArrowDownRight className="h-3.5 w-3.5" /></Link></div>
          </div>
          <div className="relative mt-16 flex items-center gap-3 font-mono text-[8px] uppercase tracking-widest text-[#646a64]"><SphereMark className="h-4 w-4 text-[#646a64]" />Built for security teams / researchers / treasuries / operators</div>
        </div>
        <div className="flex items-center p-4 md:p-8 lg:p-10"><NetworkVisual /></div>
      </section>
      <section className="grid md:grid-cols-4">
        {[[Radio,"Live protocols","Public source status"],[Database,"Real attack data","Euler + DeFiTainter"],[Radar,"Early warning","Statistical signals"],[Network,"Dependency intelligence","Trace blast radius"]].map(([Icon,title,copy], index) => {
          const Component = Icon as typeof Radio;
          return <Link href={["/protocols","/replay/euler","/analysis","/dependencies"][index]} key={String(title)} className="group min-h-40 border-b border-r border-line p-5 hover:bg-[#0f120f] md:border-b-0"><Component className="h-5 w-5 text-[#747a73] group-hover:text-signal" /><div className="mt-12 flex items-end justify-between"><div><div className="font-mono text-[10px] font-bold uppercase tracking-[.12em]">{String(title)}</div><div className="mt-2 text-[11px] text-muted">{String(copy)}</div></div><ArrowUpRight className="h-4 w-4 text-[#4d524d] group-hover:text-bone" /></div></Link>;
        })}
      </section>
    </main>
  </div>;
}
