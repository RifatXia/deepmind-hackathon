import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChiQuest 🍀 | Gamified Chicago Explorer",
  description:
    "Explore Chicago's iconic landmarks, earn XP, unlock AI-generated postcards, and redeem rewards — St. Patrick's Day Edition!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ChiQuest",
  },
  openGraph: {
    title: "ChiQuest 🍀 | Gamified Chicago Explorer",
    description:
      "Visit Chicago landmarks, get AI postcards by Gemini, earn points!",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
