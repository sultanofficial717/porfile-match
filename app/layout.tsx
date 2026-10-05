import type { Metadata } from "next";
import { Urbanist, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/lib/auth";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProfileMatch — Automated Profile Matching Platform",
  description:
    "Connect students and recruiters with automated match scoring. Build your profile, post roles, and let the algorithm find the best fits.",
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${urbanist.variable} ${manrope.variable}`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-body antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full mx-auto relative">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
