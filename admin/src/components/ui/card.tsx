import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

function Card({ className, hoverable, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-card",
        hoverable && "transition-shadow hover:shadow-card-hover",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 px-6 pt-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight text-slate-900", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-slate-500", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center border-t border-slate-100 px-6 py-4", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
