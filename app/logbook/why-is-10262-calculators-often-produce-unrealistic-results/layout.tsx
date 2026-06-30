import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why IS 10262 Calculators Often Produce Unrealistic Results",
  description: "Analysis of traditional concrete mix design calculators and the mathematical adjustments needed for realistic outputs.",
};

export default function ConcreteCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
