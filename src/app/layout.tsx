import type { Metadata } from "next";
import { Nunito, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-body",
  display: "swap",
});

const nunitoDisplay = Nunito({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BaseQuest — Learn binary, decimal, octal & hex through play",
  description:
    "An interactive, game-based platform for mastering number systems and base conversions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${nunitoDisplay.variable} ${jetbrains.variable}`}
    >
      <body>
        <NavBar />
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
