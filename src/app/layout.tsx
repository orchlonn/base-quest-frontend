import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NavBar } from "@/components/NavBar";
import { FloatingDigits } from "@/components/FloatingDigits";

export const metadata: Metadata = {
  title: "BaseQuest — Learn binary, decimal, octal & hex through play",
  description:
    "An interactive, game-based platform for mastering number systems and base conversions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <FloatingDigits />
          <NavBar />
          <main className="relative z-10 mx-auto max-w-6xl px-4 py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
