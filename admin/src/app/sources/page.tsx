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
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatRelativeTime, formatIndianNumber } from "@/lib/utils";
import api, { endpoints } from "@/lib/api";
import {
  Plus,
  Play,
  Pencil,
  Power,
  PowerOff,
  Database,
  Globe,
  RefreshCw,
} from "lucide-react";
import type { Source } from "@/types";

const mockSources: Source[] = [
  {
    id: "s1",
    name: "IBAPI Bank Auctions",
    slug: "ibapi",
    type: "scraper",
    url: "https://ibapi.in",
    description: "Indian Banks Auctions Properties Information portal",
    isEnabled: true,
    schedule: "0 */6 * * *",
    lastRunAt: new Date(Date.now() - 3600000).toISOString(),
    lastRunStatus: "success",
    totalRecords: 18420,
    createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "s2",
    name: "SBI e-Auction Portal",
    slug: "sbi-auction",
    type: "scraper",
    url: "https://sbi.co.in/web/eauction",
    description: "State Bank of India e-Auction portal for SARFAESI properties",
    isEnabled: true,
    schedule: "0 */4 * * *",
    lastRunAt: new Date(Date.now() - 14400000).toISOString(),
    lastRunStatus: "success",
    totalRecords: 8920,
    createdAt: new Date(Date.now() - 150 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "s3",
    name: "Bank of Baroda Auctions",
    slug: "bob-auction",
    type: "scraper",
    url: "https://bankofbaroda.in/auctions",
    description: "Bank of Baroda property auction notices",
    isEnabled: true,
    schedule: "0 8 * * *",
    lastRunAt: new Date(Date.now() - 7200000).toISOString(),
    lastRunStatus: "failed",
    totalRecords: 4250,
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "s4",
    name: "PNB Auction Notices",
    slug: "pnb-auction",
    type: "api",
    url: "https://pnb.co.in/api/auctions",
    description: "Punjab National Bank auction API",
    isEnabled: true,
    schedule: "0 */8 * * *",
    lastRunAt: new Date(Date.now() - 28800000).toISOString(),
    lastRunStatus: "success",
    totalRecords: 5120,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: "s5",
    name: "HDFC Property Auctions",
    slug: "hdfc-auction",
    type: "scraper",
    url: "https://hdfc.com/auctions",
    description: "HDFC Bank property auction listings",
    isEnabled: false,
    schedule: "0 10 * * *",
    lastRunAt: new Date(Date.now() - 259200000).toISOString(),
    lastRunStatus: "partial",
    totalRecords: 3210,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "s6",
    name: "Government e-Auction",
    slug: "gov-eauction",
    type: "api",
    url: "https://eauction.gov.in/api",
    description: "Government property auction portal API",
    isEnabled: true,
    schedule: "0 6 * * *",
    lastRunAt: new Date(Date.now() - 43200000).toISOString(),
    lastRunStatus: "success",
    totalRecords: 6780,
    createdAt: new Date(Date.now() - 200 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

const typeOptions = [
  { value: "scraper", label: "Web Scraper" },
  { value: "api", label: "API" },
  { value: "manual", label: "Manual Upload" },
  { value: "rss", label: "RSS Feed" },
];

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formType, setFormType] = useState("scraper");
  const [formSchedule, setFormSchedule] = useState("");
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    async function fetchSources() {
      try {
        const res = await api.get(endpoints.sources.list);
        setSources(res.data);
      } catch {
        // Use mock data
      }
    }
    fetchSources();
  }, []);

  const openDialog = (source?: Source) => {
    if (source) {
      setEditingSource(source);
      setFormName(source.name);
      setFormUrl(source.url);
      setFormType(source.type);
      setFormSchedule(source.schedule || "");
      setFormDescription(source.description || "");
    } else {
      setEditingSource(null);
      setFormName("");
      setFormUrl("");
      setFormType("scraper");
      setFormSchedule("");
      setFormDescription("");
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formName,
        url: formUrl,
        type: formType,
        schedule: formSchedule,
        description: formDescription,
      };
      if (editingSource) {
        await api.put(endpoints.sources.update(editingSource.id), payload);
      } else {
        await api.post(endpoints.sources.create, payload);
      }
    } catch {
      // Handle error
    }
    setDialogOpen(false);
  };

  const handleTrigger = async (id: string) => {
    setTriggeringId(id);
    try {
      await api.post(endpoints.sources.trigger(id));
    } catch {
      // Handle error
    } finally {
      setTimeout(() => setTriggeringId(null), 2000);
    }
  };

  const handleToggle = async (source: Source) => {
    try {
      await api.post(endpoints.sources.toggle(source.id));
      setSources(
        sources.map((s) =>
          s.id === source.id ? { ...s, isEnabled: !s.isEnabled } : s
        )
      );
    } catch {
      // Toggle locally anyway for demo
      setSources(
        sources.map((s) =>
          s.id === source.id ? { ...s, isEnabled: !s.isEnabled } : s
        )
      );
    }
  };

  const runStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="default">Never Run</Badge>;
    const map: Record<string, { variant: "success" | "danger" | "warning"; label: string }> = {
      success: { variant: "success", label: "Success" },
      failed: { variant: "danger", label: "Failed" },
      partial: { variant: "warning", label: "Partial" },
    };
    const config = map[status] || { variant: "default" as "success", label: status };
    return <Badge variant={config.variant} dot>{config.label}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Data Sources</h1>
            <p className="page-subtitle">
              Manage property data sources and scrapers
            </p>
          </div>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => openDialog()}
          >
            Add Source
          </Button>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-600/10 p-3">
                <Database className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="stat-card-label">Total Sources</p>
                <p className="text-2xl font-bold text-slate-900">
                  {sources.length}
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-600/10 p-3">
                <Power className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="stat-card-label">Active Sources</p>
                <p className="text-2xl font-bold text-slate-900">
                  {sources.filter((s) => s.isEnabled).length}
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-600/10 p-3">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="stat-card-label">Total Records</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatIndianNumber(
                    sources.reduce((sum, s) => sum + s.totalRecords, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sources Table */}
        <Card>
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            source.isEnabled
                              ? "bg-brand-600/10"
                              : "bg-slate-100"
                          }`}
                        >
                          <Database
                            className={`h-4 w-4 ${
                              source.isEnabled
                                ? "text-brand-600"
                                : "text-slate-400"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {source.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {source.url}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{source.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {source.isEnabled ? (
                        <Badge variant="success" dot>
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="default" dot>
                          Disabled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        {runStatusBadge(source.lastRunStatus)}
                        <p className="mt-1 text-xs text-slate-400">
                          {source.lastRunAt
                            ? formatRelativeTime(source.lastRunAt)
                            : "Never"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatIndianNumber(source.totalRecords)}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">
                      {source.schedule || "Manual"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTrigger(source.id)}
                          disabled={!source.isEnabled || triggeringId === source.id}
                          title="Trigger manual run"
                        >
                          {triggeringId === source.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(source)}
                          title="Edit source"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggle(source)}
                          title={
                            source.isEnabled ? "Disable source" : "Enable source"
                          }
                        >
                          {source.isEnabled ? (
                            <PowerOff className="h-4 w-4 text-red-500" />
                          ) : (
                            <Power className="h-4 w-4 text-emerald-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          className="max-w-xl"
        >
          <DialogHeader onClose={() => setDialogOpen(false)}>
            {editingSource ? "Edit Source" : "Add New Source"}
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <Input
                label="Source Name"
                placeholder="e.g., SBI e-Auction Portal"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <Input
                label="URL"
                placeholder="https://..."
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
              />
              <Select
                label="Type"
                options={typeOptions}
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
              />
              <Input
                label="Schedule (Cron Expression)"
                placeholder="0 */6 * * *"
                value={formSchedule}
                onChange={(e) => setFormSchedule(e.target.value)}
                hint="Leave empty for manual-only runs"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  rows={3}
                  placeholder="Brief description of this data source..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingSource ? "Update Source" : "Create Source"}
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
