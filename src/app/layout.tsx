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
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-emergency selection:text-white">
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
