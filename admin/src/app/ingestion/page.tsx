"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";
import api, { endpoints } from "@/lib/api";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Filter,
  Download,
} from "lucide-react";
import type { IngestionJob, IngestionLog } from "@/types";

const mockJobs: IngestionJob[] = [
  {
    id: "j1",
    sourceId: "s1",
    sourceName: "IBAPI Bank Auctions",
    status: "completed",
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: new Date(Date.now() - 600000).toISOString(),
    duration: 1200,
    stats: { totalProcessed: 450, newRecords: 32, updatedRecords: 18, failedRecords: 2, skippedRecords: 398 },
    triggeredBy: "scheduler",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    logs: [
      { id: "l1", level: "info", message: "Starting ingestion for IBAPI", timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: "l2", level: "info", message: "Fetching page 1 of 15...", timestamp: new Date(Date.now() - 1700000).toISOString() },
      { id: "l3", level: "warning", message: "Duplicate record detected: IBAPI-MH-2024-5678", timestamp: new Date(Date.now() - 1500000).toISOString() },
      { id: "l4", level: "error", message: "Failed to parse property: missing reservePrice field", timestamp: new Date(Date.now() - 1200000).toISOString() },
      { id: "l5", level: "info", message: "Ingestion completed: 32 new, 18 updated, 2 failed", timestamp: new Date(Date.now() - 600000).toISOString() },
    ],
  },
  {
    id: "j2",
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
    id: "j3",
    sourceId: "s3",
    sourceName: "Bank of Baroda Auctions",
    status: "failed",
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 7000000).toISOString(),
    duration: 200,
    stats: { totalProcessed: 0, newRecords: 0, updatedRecords: 0, failedRecords: 0, skippedRecords: 0 },
    errorMessage: "Connection timeout: source website unreachable after 3 retries",
    triggeredBy: "scheduler",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    logs: [
      { id: "l6", level: "info", message: "Starting ingestion for Bank of Baroda", timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: "l7", level: "error", message: "Connection timeout on attempt 1", timestamp: new Date(Date.now() - 7100000).toISOString() },
      { id: "l8", level: "error", message: "Connection timeout on attempt 2", timestamp: new Date(Date.now() - 7050000).toISOString() },
      { id: "l9", level: "error", message: "Connection timeout on attempt 3. Aborting.", timestamp: new Date(Date.now() - 7000000).toISOString() },
    ],
  },
  {
    id: "j4",
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
  {
    id: "j5",
    sourceId: "s6",
    sourceName: "Government e-Auction",
    status: "completed",
    startedAt: new Date(Date.now() - 43200000).toISOString(),
    completedAt: new Date(Date.now() - 42000000).toISOString(),
    duration: 1200,
    stats: { totalProcessed: 380, newRecords: 67, updatedRecords: 23, failedRecords: 1, skippedRecords: 289 },
    triggeredBy: "scheduler",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "j6",
    sourceId: "s1",
    sourceName: "IBAPI Bank Auctions",
    status: "completed",
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 85200000).toISOString(),
    duration: 1200,
    stats: { totalProcessed: 420, newRecords: 28, updatedRecords: 22, failedRecords: 0, skippedRecords: 370 },
    triggeredBy: "scheduler",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "j7",
    sourceId: "s2",
    sourceName: "SBI e-Auction Portal",
    status: "pending",
    stats: { totalProcessed: 0, newRecords: 0, updatedRecords: 0, failedRecords: 0, skippedRecords: 0 },
    triggeredBy: "scheduler",
    createdAt: new Date(Date.now() - 100000).toISOString(),
  },
];

const sourceOptions = [
  { value: "s1", label: "IBAPI Bank Auctions" },
  { value: "s2", label: "SBI e-Auction Portal" },
  { value: "s3", label: "Bank of Baroda Auctions" },
  { value: "s4", label: "PNB Auction Notices" },
  { value: "s6", label: "Government e-Auction" },
];

const statusOptions = [
  { value: "completed", label: "Completed" },
  { value: "running", label: "Running" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

export default function IngestionPage() {
  const [jobs, setJobs] = useState<IngestionJob[]>(mockJobs);
  const [loading, setLoading] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await api.get(endpoints.ingestion.jobs, {
          params: { source: filterSource, status: filterStatus, page },
        });
        setJobs(res.data.data);
      } catch {
        // Use mock data
      }
    }
    fetchJobs();
  }, [filterSource, filterStatus, page]);

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "running":
        return <Activity className="h-4 w-4 animate-pulse text-blue-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: "success" | "info" | "danger" | "warning" | "default"; label: string }> = {
      completed: { variant: "success", label: "Completed" },
      running: { variant: "info", label: "Running" },
      failed: { variant: "danger", label: "Failed" },
      pending: { variant: "warning", label: "Pending" },
      cancelled: { variant: "default", label: "Cancelled" },
    };
    const config = map[status] || { variant: "default" as const, label: status };
    return <Badge variant={config.variant} dot>{config.label}</Badge>;
  };

  const logLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-amber-600 bg-amber-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      case "debug":
        return "text-slate-500 bg-slate-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "-";
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Daily summary
  const todayJobs = jobs.filter((j) => {
    const created = new Date(j.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  });
  const todayNew = todayJobs.reduce((s, j) => s + j.stats.newRecords, 0);
  const todayUpdated = todayJobs.reduce((s, j) => s + j.stats.updatedRecords, 0);
  const todayFailed = todayJobs.reduce((s, j) => s + j.stats.failedRecords, 0);

  return (
    <AdminLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Ingestion Jobs</h1>
            <p className="page-subtitle">
              Monitor data ingestion pipelines and job history
            </p>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="stat-card">
            <p className="stat-card-label">Today&apos;s Jobs</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {todayJobs.length}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">New Records</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              +{todayNew}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Updated Records</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {todayUpdated}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Failed Records</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {todayFailed}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar mb-6">
          <div className="w-48">
            <Select
              options={sourceOptions}
              placeholder="All Sources"
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              options={statusOptions}
              placeholder="All Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </div>
          <Input type="date" className="w-40" />
          <Input type="date" className="w-40" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilterSource("");
              setFilterStatus("");
            }}
          >
            Clear
          </Button>
        </div>

        {/* Jobs List */}
        <Card>
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Triggered By</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <React.Fragment key={job.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedJob(expandedJob === job.id ? null : job.id)
                      }
                    >
                      <TableCell>
                        {expandedJob === job.id ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcon(job.status)}
                          <span className="font-medium">{job.sourceName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{statusBadge(job.status)}</TableCell>
                      <TableCell className="font-medium">
                        {job.stats.totalProcessed}
                      </TableCell>
                      <TableCell>
                        <span className="text-emerald-600 font-medium">
                          +{job.stats.newRecords}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-blue-600">
                          {job.stats.updatedRecords}
                        </span>
                      </TableCell>
                      <TableCell>
                        {job.stats.failedRecords > 0 ? (
                          <span className="text-red-600 font-medium">
                            {job.stats.failedRecords}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDuration(job.duration)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            job.triggeredBy === "manual" ? "info" : "default"
                          }
                        >
                          {job.triggeredBy}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {job.startedAt
                          ? formatRelativeTime(job.startedAt)
                          : "Queued"}
                      </TableCell>
                    </TableRow>

                    {/* Expanded log view */}
                    {expandedJob === job.id && (
                      <TableRow>
                        <TableCell colSpan={10} className="bg-slate-50 p-0">
                          <div className="p-4">
                            {job.errorMessage && (
                              <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                <p className="text-sm text-red-700">
                                  {job.errorMessage}
                                </p>
                              </div>
                            )}
                            {job.logs && job.logs.length > 0 ? (
                              <div className="space-y-1">
                                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                  Job Logs
                                </h4>
                                {job.logs.map((log) => (
                                  <div
                                    key={log.id}
                                    className="flex items-start gap-2 rounded px-2 py-1 text-xs"
                                  >
                                    <span className="w-20 shrink-0 text-slate-400">
                                      {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span
                                      className={`shrink-0 rounded px-1.5 py-0.5 font-medium uppercase ${logLevelColor(log.level)}`}
                                    >
                                      {log.level}
                                    </span>
                                    <span className="text-slate-600">
                                      {log.message}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">
                                No logs available for this job
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {jobs.length} jobs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
