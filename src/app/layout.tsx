import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/components/providers';
import LayoutClientWrapper from './LayoutClientWrapper';

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
        <Providers>
          <LayoutClientWrapper>
            {children}
          </LayoutClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
