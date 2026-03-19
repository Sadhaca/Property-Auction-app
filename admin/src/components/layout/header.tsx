"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/lib/auth";
import { getInitials, stringToColor, cn } from "@/lib/utils";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";

export function Header() {
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-slate-500">
          India Property Auction Discovery
        </h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-modal animate-fade-in">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Notifications
                </h3>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-slate-50">
                  <p className="text-sm text-slate-700">
                    Ingestion job completed for IBAPI source
                  </p>
                  <p className="mt-1 text-xs text-slate-400">2 minutes ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50">
                  <p className="text-sm text-slate-700">
                    3 new properties added from Bank of India
                  </p>
                  <p className="mt-1 text-xs text-slate-400">15 minutes ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50">
                  <p className="text-sm text-slate-700">
                    Data quality score dropped below 80%
                  </p>
                  <p className="mt-1 text-xs text-slate-400">1 hour ago</p>
                </div>
              </div>
              <div className="border-t border-slate-200 px-4 py-2 text-center">
                <button className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white",
                user ? stringToColor(user.name) : "bg-slate-400"
              )}
            >
              {user ? getInitials(user.name) : "?"}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-700">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-slate-400">
                {user?.role || "admin"}
              </p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-modal animate-fade-in">
              <div className="border-b border-slate-200 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="py-1">
                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <User className="h-4 w-4 text-slate-400" />
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
