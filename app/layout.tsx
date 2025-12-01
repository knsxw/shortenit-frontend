import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import MobileMenu from "@/components/mobile-menu";

export const metadata: Metadata = {
  title: "Shortenit - URL Shortener & Link Management",
  description: "Shorten your URLs, create QR codes, and track link analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="flex h-screen flex-col">
              {/* Mobile menu for small screens */}
              <div className="md:hidden">
                <MobileMenu />
              </div>
              {/* Desktop layout */}
              <div className="hidden md:flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  {children}
                </div>
              </div>
              {/* Mobile layout */}
              <div className="md:hidden flex flex-col flex-1 overflow-hidden">
                {children}
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
