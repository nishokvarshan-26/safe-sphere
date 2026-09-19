import { TerminalShell } from "@/components/terminal-shell";

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  return <TerminalShell>{children}</TerminalShell>;
}
