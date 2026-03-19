"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Database,
  Activity,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Gavel,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Sources", href: "/sources", icon: Database },
  { label: "Ingestion Jobs", href: "/ingestion", icon: Activity },
  { label: "Users", href: "/users", icon: Users },
  { label: "Audit Logs", href: "/audit", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Gavel className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="truncate text-sm font-bold text-brand-600">
              Property Auction
            </h1>
            <p className="truncate text-[10px] font-medium text-slate-400">
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-600/10 text-brand-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-brand-600" : "text-slate-400"
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-200 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
