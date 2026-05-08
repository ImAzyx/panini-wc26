import type { Metadata, Viewport } from "next";
import { Oswald, Space_Mono, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const oswald = Oswald({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-oswald",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Panini WC26",
  description: "Suivez votre collection Panini FIFA WC 2026",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Panini WC26",
  },
};

export const viewport: Viewport = {
  themeColor: "#060911",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${oswald.variable} ${spaceMono.variable} ${dmSans.variable}`}>
      <body className="bg-void text-text font-body min-h-screen">
        <Navbar />
        <div className="md:pt-16 pb-20 md:pb-0">
          {children}
        </div>
      </body>
    </html>
  );
}
