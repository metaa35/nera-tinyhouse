import { Providers } from '@/app/providers'
import LayoutClientWrapper from './LayoutClientWrapper'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
          {/* Eğer varsa koşullu render ile pathname admin ile başlıyorsa Navbar ve Footer'ı render etme */}
          <LayoutClientWrapper>
            {children}
          </LayoutClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
