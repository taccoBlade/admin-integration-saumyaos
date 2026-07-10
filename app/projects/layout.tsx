import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminal Vault Dashboard",
  description: "Interactive command center showing real-time logs, concrete design statistics, and IoT sensor metrics by Saumya Parekh.",
};

export default function TerminalVaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
