"use client";

import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue>({
  activeTab: "",
  setActiveTab: () => {},
});

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
  onChange?: (value: string) => void;
}

function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1",
        className
      )}
      role="tablist"
      {...props}
    />
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all",
        isActive
          ? "bg-white text-brand-600 shadow-sm"
          : "text-slate-600 hover:text-slate-900",
        className
      )}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ value, className, ...props }: TabsContentProps) {
  const { activeTab } = useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-4 animate-fade-in", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
