import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Story & Life Outside Engineering",
  description: "Learn about Saumya Parekh's life outside engineering, including distance running, parallel-twin motorcycle tuning, and quantitative markets.",
};

export default function PersonalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
