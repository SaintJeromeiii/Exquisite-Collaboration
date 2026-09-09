import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { TerminalShell } from "@/components/TerminalShell";
import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-ibm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const condensed = Barlow_Condensed({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EXQ — Collab desk",
  description:
    "A collab sneaker desk: what to watch, why it matters, when it drops. No store. No box.",
  applicationName: "EXQ Desk",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "EXQ Desk",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${condensed.variable} h-dvh overflow-hidden antialiased`}
    >
      <body className="h-dvh overflow-hidden bg-bg text-ink">
        <TerminalShell>{children}</TerminalShell>
      </body>
    </html>
  );
}
