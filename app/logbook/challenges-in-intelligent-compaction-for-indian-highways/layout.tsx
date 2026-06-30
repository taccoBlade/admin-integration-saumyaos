import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenges in Intelligent Compaction for Indian Highways",
  description: "Research log detailing the challenges, physical limitations, and EKF algorithms in intelligent compaction for highways in India.",
};

export default function IntelligentCompactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
