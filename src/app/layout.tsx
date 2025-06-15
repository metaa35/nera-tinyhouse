import { Providers } from '@/app/providers'
import LayoutClientWrapper from './LayoutClientWrapper'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="tr" className="scroll-smooth">
      <head />
      <body className={inter.className}>
        <SessionProvider>
          {!isAdmin && <Navbar />}
          <Providers>
            {/* Eğer varsa koşullu render ile pathname admin ile başlıyorsa Navbar ve Footer'ı render etme */}
            <LayoutClientWrapper>
              {children}
            </LayoutClientWrapper>
          </Providers>
          {!isAdmin && <Footer />}
        </SessionProvider>
      </body>
    </html>
  );
}
