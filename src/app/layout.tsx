import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PlayerBar } from "@/components/layout/player-bar";
import { AudioProvider } from "@/components/audio/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PodCentral — Podcasting 2.0 Client",
  description:
    "A modern Podcasting 2.0 client with chapters, transcripts, value-for-value, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            <AudioProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <main className="flex-1 overflow-auto pb-24">
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
              <PlayerBar />
            </AudioProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
