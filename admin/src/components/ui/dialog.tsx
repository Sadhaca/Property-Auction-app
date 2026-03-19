"use client";

import React, { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

function Dialog({ open, onClose, children, className }: DialogProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Content */}
      <div
        className={cn(
          "relative z-50 mx-4 w-full max-w-lg rounded-xl bg-white shadow-modal animate-fade-in",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ className, onClose, children, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-slate-200 px-6 py-4",
        className
      )}
      {...props}
    >
      <div className="text-lg font-semibold text-slate-900">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4",
        className
      )}
      {...props}
    />
  );
}

export { Dialog, DialogHeader, DialogBody, DialogFooter };
