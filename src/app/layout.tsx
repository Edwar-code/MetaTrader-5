// src/app/layout.tsx - CORRECTED

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Now this path is correct
import { Toaster } from "@/components/ui/toaster";
import { DerivProvider } from "@/context/DerivContext"; // Now this path is correct

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deriv Trading Terminal",
  description: "Built with Deriv API",
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
          <DerivProvider>
            {children}
            <Toaster />
          </DerivProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}