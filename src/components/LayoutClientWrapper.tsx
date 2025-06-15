"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <SessionProvider>
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && <Footer />}
    </SessionProvider>
  );
} 