"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAuthStore } from "@/lib/auth";
import { Spinner } from "@/components/ui/loading";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-64 transition-all duration-200">
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
