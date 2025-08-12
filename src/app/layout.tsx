// src/app/layout.tsx - UPDATED

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// 1. IMPORT YOUR DERIV PROVIDER
import { DerivProvider } from "@/context/DerivContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deriv Trading App",
  description: "Advanced trading terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* 2. WRAP EVERYTHING INSIDE DERIVPROVIDER */}
          <DerivProvider>
            {children}
            <Toaster />
          </DerivProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}