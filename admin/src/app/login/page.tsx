"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gavel, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-brand-600 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
            <Gavel className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-white">
            Property Auction
          </span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white">
            India Property Auction Discovery Platform
          </h1>
          <p className="mt-4 text-lg text-blue-200">
            Manage property listings, monitor data sources, track ingestion
            pipelines, and ensure data quality across the platform.
          </p>
        </div>

        <div className="flex items-center gap-8 text-sm text-blue-300">
          <div>
            <span className="text-2xl font-bold text-white">50K+</span>
            <p>Properties Indexed</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-white">25+</span>
            <p>Data Sources</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-white">500+</span>
            <p>Cities Covered</p>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex w-full items-center justify-center px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Gavel className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-brand-600">
              Property Auction
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Sign in to Admin
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="admin@propertyauction.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Property Auction Discovery &middot; Admin Panel v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
