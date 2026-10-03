import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Hospitals & Trauma Centers",
  description:
    "Direct emergency trauma coordination network and ICU availability across Dhaka metropolitan hospitals.",
};

export default function HospitalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
