"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FAQ } from '@/types/faq';
import { useSession } from "next-auth/react";

// ... existing code ...

export default function SSS() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);
  if (status === "loading") return <div>Yükleniyor...</div>;
  // ... existing code ...
} 