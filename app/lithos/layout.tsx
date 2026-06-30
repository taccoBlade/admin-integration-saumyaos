import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lithos",
  description: "An architectural and structural aesthetic presentation by Saumya Parekh.",
};

export default function LithosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
