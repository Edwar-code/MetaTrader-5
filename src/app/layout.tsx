// src/app/layout.tsx - CORRECTED PATHS

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// CORRECTED PATH: Assumes theme-provider is in 'src/components'
import { ThemeProvider } from "@/components/theme-provider"; 
import { Toaster } from "@/components/ui/toaster";

// CORRECTED PATH: Assumes DerivContext is in 'src/context'
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
          <DerivProvider>
            {children}
            <Toaster />
          </DerivProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}