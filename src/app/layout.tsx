import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NERA YAPI",
  description: "NERA YAPI",
  icons: {
    icon: "/logo.svg"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head />
      <body className={inter.className}>
        <SessionProvider>
          <LayoutClientWrapper>
            {children}
          </LayoutClientWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
