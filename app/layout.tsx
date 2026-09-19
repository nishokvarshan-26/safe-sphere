import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Safe Sphere | Web3 Security Intelligence", template: "%s | Safe Sphere" },
  description: "Detect threats before they become exploits. Web3 security and protocol intelligence terminal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
