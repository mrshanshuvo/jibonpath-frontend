import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions & Dispatch Guidelines",
  description:
    "Answers about emergency booking triage, paramedic credentials, response times, and fare tariffs.",
  openGraph: {
    title: "Frequently Asked Questions & Dispatch Guidelines | JibonPath",
    description:
      "Answers about emergency booking triage, paramedic credentials, response times, and fare tariffs.",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
