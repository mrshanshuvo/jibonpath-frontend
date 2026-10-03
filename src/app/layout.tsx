import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pulsepoint-emergency.vercel.app"),
  title: {
    default: "PulsePoint — Rapid Emergency Ambulance Dispatch System",
    template: "%s | PulsePoint Dispatch",
  },
  description:
    "Real-time GPS ambulance dispatch, emergency triage, hospital tracking, and telemetry response platform.",
  keywords: [
    "Ambulance",
    "Emergency",
    "Dispatch",
    "Paramedic",
    "Hospital",
    "Healthcare",
    "Dhaka",
  ],
  authors: [{ name: "PulsePoint Operations" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pulsepoint-emergency.vercel.app",
    title: "PulsePoint — Rapid Emergency Ambulance Dispatch System",
    description:
      "Real-time GPS ambulance dispatch, emergency triage, hospital tracking, and telemetry response platform.",
    siteName: "PulsePoint Emergency Dispatch",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulsePoint — Rapid Emergency Ambulance Dispatch System",
    description:
      "Real-time GPS ambulance dispatch, emergency triage, hospital tracking, and telemetry response platform.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground selection:bg-emergency selection:text-white"
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              theme="dark"
              toastOptions={{
                duration: 4000,
                className: "glass-card border-border text-foreground",
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
