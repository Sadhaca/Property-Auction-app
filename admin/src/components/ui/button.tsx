import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "destructive" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-brand-500",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  icon: "p-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps, type ButtonVariant };
