import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "24/7 Central Emergency Dispatch Hotline & Operations",
  description:
    "Direct phone hotlines, hospital triage transfer coordinators, and urgent paramedic dispatch contacts.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
