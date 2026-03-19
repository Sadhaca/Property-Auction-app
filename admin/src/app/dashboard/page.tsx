"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { CardSkeleton } from "@/components/ui/loading";
import {
  formatCurrency,
  formatRelativeTime,
  formatIndianNumber,
} from "@/lib/utils";
import api, { endpoints } from "@/lib/api";
import {
  Building2,
  Users,
  Database,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type {
  DashboardStats,
  IngestionJob,
  DataQuality,
  IngestionChartData,
  CityPropertyCount,
} from "@/types";

// Mock data for demonstration
const mockStats: DashboardStats = {
  totalProperties: 52847,
  activeProperties: 31204,
  totalUsers: 18432,
  activeUsers: 4521,
  totalSources: 28,
  activeSources: 24,
  todayIngestion: 1247,
  propertiesGrowth: 12.5,
  usersGrowth: 8.3,
};

const mockChartData: IngestionChartData[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  }),
  newRecords: Math.floor(Math.random() * 500) + 200,
  updatedRecords: Math.floor(Math.random() * 300) + 100,
  failedRecords: Math.floor(Math.random() * 30),
}));

const mockRecentJobs: IngestionJob[] = [
  {
    id: "1",
    sourceId: "s1",
    sourceName: "IBAPI Bank Auctions",
    status: "completed",
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: new Date(Date.now() - 600000).toISOString(),
    duration: 1200,
    stats: { totalProcessed: 450, newRecords: 32, updatedRecords: 18, failedRecords: 2, skippedRecords: 398 },
    triggeredBy: "scheduler",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "2",
    sourceId: "s2",
    sourceName: "SBI e-Auction Portal",
    status: "running",
    startedAt: new Date(Date.now() - 300000).toISOString(),
    duration: 300,
    stats: { totalProcessed: 120, newRecords: 15, updatedRecords: 8, failedRecords: 0, skippedRecords: 97 },
    triggeredBy: "manual",
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "3",
    sourceId: "s3",
    sourceName: "Bank of Baroda Auctions",
    status: "failed",
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 7000000).toISOString(),
    duration: 200,
    stats: { totalProcessed: 0, newRecords: 0, updatedRecords: 0, failedRecords: 0, skippedRecords: 0 },
    errorMessage: "Connection timeout: source website unreachable",
    triggeredBy: "scheduler",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "4",
    sourceId: "s4",
    sourceName: "PNB Auction Notices",
    status: "completed",
    startedAt: new Date(Date.now() - 14400000).toISOString(),
    completedAt: new Date(Date.now() - 13200000).toISOString(),
    duration: 1200,
    stats: { totalProcessed: 280, newRecords: 45, updatedRecords: 12, failedRecords: 3, skippedRecords: 220 },
    triggeredBy: "scheduler",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

const mockDataQuality: DataQuality = {
  overallScore: 82,
  completeness: 78,
  accuracy: 91,
  freshness: 85,
  duplicates: 3.2,
  missingFields: [
    { field: "Market Value", count: 12340, percentage: 23.3 },
    { field: "Built-up Area", count: 18920, percentage: 35.8 },
    { field: "Contact Email", count: 8430, percentage: 15.9 },
    { field: "Latitude/Longitude", count: 21050, percentage: 39.8 },
  ],
};

const mockTopCities: CityPropertyCount[] = [
  { city: "Mumbai", state: "Maharashtra", count: 8420, percentage: 15.9 },
  { city: "Delhi", state: "Delhi", count: 6230, percentage: 11.8 },
  { city: "Bangalore", state: "Karnataka", count: 4890, percentage: 9.2 },
  { city: "Chennai", state: "Tamil Nadu", count: 3210, percentage: 6.1 },
  { city: "Hyderabad", state: "Telangana", count: 2980, percentage: 5.6 },
  { city: "Pune", state: "Maharashtra", count: 2540, percentage: 4.8 },
  { city: "Ahmedabad", state: "Gujarat", count: 2120, percentage: 4.0 },
  { city: "Kolkata", state: "West Bengal", count: 1890, percentage: 3.6 },
];

const statusBadge = (status: string) => {
  const map: Record<string, { variant: "success" | "warning" | "danger" | "info"; label: string }> = {
    completed: { variant: "success", label: "Completed" },
    running: { variant: "info", label: "Running" },
    failed: { variant: "danger", label: "Failed" },
    pending: { variant: "warning", label: "Pending" },
    cancelled: { variant: "default" as "warning", label: "Cancelled" },
  };
  const config = map[status] || { variant: "default" as "warning", label: status };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [chartData, setChartData] = useState<IngestionChartData[]>(mockChartData);
  const [recentJobs, setRecentJobs] = useState<IngestionJob[]>(mockRecentJobs);
  const [dataQuality, setDataQuality] = useState<DataQuality>(mockDataQuality);
  const [topCities, setTopCities] = useState<CityPropertyCount[]>(mockTopCities);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, chartRes, jobsRes, qualityRes, citiesRes] =
          await Promise.allSettled([
            api.get(endpoints.dashboard.stats),
            api.get(endpoints.dashboard.ingestionChart),
            api.get(endpoints.dashboard.recentJobs),
            api.get(endpoints.dashboard.dataQuality),
            api.get(endpoints.dashboard.topCities),
          ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
        if (chartRes.status === "fulfilled") setChartData(chartRes.value.data);
        if (jobsRes.status === "fulfilled") setRecentJobs(jobsRes.value.data);
        if (qualityRes.status === "fulfilled") setDataQuality(qualityRes.value.data);
        if (citiesRes.status === "fulfilled") setTopCities(citiesRes.value.data);
      } catch {
        // Use mock data on failure
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Properties",
      value: formatIndianNumber(stats.totalProperties),
      change: stats.propertiesGrowth,
      icon: Building2,
      color: "text-brand-600",
      bg: "bg-brand-600/10",
    },
    {
      label: "Active Users",
      value: formatIndianNumber(stats.activeUsers),
      change: stats.usersGrowth,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-600/10",
    },
    {
      label: "Data Sources",
      value: `${stats.activeSources}/${stats.totalSources}`,
      change: null,
      icon: Database,
      color: "text-purple-600",
      bg: "bg-purple-600/10",
    },
    {
      label: "Today's Ingestion",
      value: formatIndianNumber(stats.todayIngestion),
      change: null,
      icon: Activity,
      color: "text-orange-600",
      bg: "bg-orange-600/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Overview of the Property Auction platform
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.label} className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-card-label">{card.label}</p>
                    <p className="stat-card-value mt-1">{card.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${card.bg}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                {card.change !== null && (
                  <div className="mt-3 flex items-center gap-1">
                    {card.change > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                    )}
                    <span
                      className={`stat-card-change ${card.change > 0 ? "positive" : "negative"}`}
                    >
                      {card.change > 0 ? "+" : ""}
                      {card.change}% from last month
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ingestion Chart + Data Quality */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Ingestion Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ingestion Activity (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="newRecords"
                      name="New"
                      fill="#1e3a5f"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="updatedRecords"
                      name="Updated"
                      fill="#10b981"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="failedRecords"
                      name="Failed"
                      fill="#ef4444"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Data Quality */}
          <Card>
            <CardHeader>
              <CardTitle>Data Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="relative flex h-32 w-32 items-center justify-center">
                  <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={
                        dataQuality.overallScore >= 80
                          ? "#10b981"
                          : dataQuality.overallScore >= 60
                            ? "#f59e0b"
                            : "#ef4444"
                      }
                      strokeWidth="10"
                      strokeDasharray={`${(dataQuality.overallScore / 100) * 314} 314`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-3xl font-bold text-slate-900">
                    {dataQuality.overallScore}%
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Overall Score
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { label: "Completeness", value: dataQuality.completeness },
                  { label: "Accuracy", value: dataQuality.accuracy },
                  { label: "Freshness", value: dataQuality.freshness },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{metric.label}</span>
                      <span className="font-medium text-slate-900">
                        {metric.value}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          metric.value >= 80
                            ? "bg-emerald-500"
                            : metric.value >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {dataQuality.duplicates}% duplicate records detected
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Jobs + Top Cities */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Ingestion Jobs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Ingestion Jobs</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {job.sourceName}
                      </TableCell>
                      <TableCell>{statusBadge(job.status)}</TableCell>
                      <TableCell>{job.stats.totalProcessed}</TableCell>
                      <TableCell>
                        <span className="text-emerald-600 font-medium">
                          +{job.stats.newRecords}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {job.startedAt ? formatRelativeTime(job.startedAt) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Cities */}
          <Card>
            <CardHeader>
              <CardTitle>Top Cities by Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCities.map((city, index) => (
                  <div key={city.city} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          {city.city}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatIndianNumber(city.count)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{
                            width: `${(city.count / topCities[0].count) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
