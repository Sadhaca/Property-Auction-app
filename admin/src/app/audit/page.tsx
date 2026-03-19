"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatDateTime } from "@/lib/utils";
import api, { endpoints } from "@/lib/api";
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import type { AuditLog } from "@/types";

const mockAuditLogs: AuditLog[] = [
  {
    id: "a1",
    userId: "u1",
    userName: "Priya Patel",
    action: "LOGIN",
    entity: "auth",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    ipAddress: "192.168.1.100",
  },
  {
    id: "a2",
    userId: "u2",
    userName: "Vikram Singh",
    action: "UPDATE",
    entity: "property",
    entityId: "prop-1",
    details: { field: "status", oldValue: "upcoming", newValue: "active" },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    ipAddress: "192.168.1.101",
  },
  {
    id: "a3",
    userId: "u1",
    userName: "Priya Patel",
    action: "TRIGGER_INGESTION",
    entity: "source",
    entityId: "s2",
    details: { sourceName: "SBI e-Auction Portal" },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ipAddress: "192.168.1.100",
  },
  {
    id: "a4",
    userId: "u3",
    userName: "Anita Sharma",
    action: "CREATE",
    entity: "source",
    entityId: "s7",
    details: { sourceName: "Canara Bank Auctions" },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ipAddress: "192.168.1.102",
  },
  {
    id: "a5",
    userId: "u1",
    userName: "Priya Patel",
    action: "UPDATE_ROLE",
    entity: "user",
    entityId: "u6",
    details: { userName: "Amit Jain", oldRole: "viewer", newRole: "moderator" },
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    ipAddress: "192.168.1.100",
  },
  {
    id: "a6",
    userId: "u2",
    userName: "Vikram Singh",
    action: "DISABLE_SOURCE",
    entity: "source",
    entityId: "s5",
    details: { sourceName: "HDFC Property Auctions" },
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    ipAddress: "192.168.1.101",
  },
  {
    id: "a7",
    userId: "u1",
    userName: "Priya Patel",
    action: "DEACTIVATE_USER",
    entity: "user",
    entityId: "u5",
    details: { userName: "Sunita Devi" },
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    ipAddress: "192.168.1.100",
  },
  {
    id: "a8",
    userId: "u6",
    userName: "Amit Jain",
    action: "UPDATE",
    entity: "property",
    entityId: "prop-15",
    details: { field: "reservePrice", oldValue: "5000000", newValue: "4500000" },
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    ipAddress: "192.168.1.103",
  },
  {
    id: "a9",
    userId: "u2",
    userName: "Vikram Singh",
    action: "UPDATE_SETTINGS",
    entity: "settings",
    details: { setting: "ingestion.maxRetries", oldValue: "3", newValue: "5" },
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    ipAddress: "192.168.1.101",
  },
  {
    id: "a10",
    userId: "u3",
    userName: "Anita Sharma",
    action: "DELETE",
    entity: "property",
    entityId: "prop-99",
    details: { reason: "Duplicate record" },
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    ipAddress: "192.168.1.102",
  },
];

const actionOptions = [
  { value: "LOGIN", label: "Login" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "TRIGGER_INGESTION", label: "Trigger Ingestion" },
  { value: "UPDATE_ROLE", label: "Update Role" },
  { value: "DISABLE_SOURCE", label: "Disable Source" },
  { value: "DEACTIVATE_USER", label: "Deactivate User" },
  { value: "UPDATE_SETTINGS", label: "Update Settings" },
];

const entityOptions = [
  { value: "auth", label: "Auth" },
  { value: "property", label: "Property" },
  { value: "source", label: "Source" },
  { value: "user", label: "User" },
  { value: "settings", label: "Settings" },
];

const actionBadge = (action: string) => {
  const map: Record<string, "success" | "info" | "danger" | "warning" | "default"> = {
    LOGIN: "info",
    CREATE: "success",
    UPDATE: "warning",
    DELETE: "danger",
    TRIGGER_INGESTION: "info",
    UPDATE_ROLE: "warning",
    DISABLE_SOURCE: "danger",
    DEACTIVATE_USER: "danger",
    UPDATE_SETTINGS: "warning",
  };
  return (
    <Badge variant={map[action] || "default"}>
      {action.replace(/_/g, " ")}
    </Badge>
  );
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await api.get(endpoints.audit.logs, {
          params: { search, action: filterAction, entity: filterEntity, page },
        });
        setLogs(res.data.data);
      } catch {
        // Use mock data
      }
    }
    fetchLogs();
  }, [search, filterAction, filterEntity, page]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !search ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    const matchesAction = !filterAction || log.action === filterAction;
    const matchesEntity = !filterEntity || log.entity === filterEntity;
    return matchesSearch && matchesAction && matchesEntity;
  });

  return (
    <AdminLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Audit Logs</h1>
            <p className="page-subtitle">
              Track all administrative actions and changes
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar mb-6">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by user or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-44">
            <Select
              options={actionOptions}
              placeholder="All Actions"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            />
          </div>
          <div className="w-36">
            <Select
              options={entityOptions}
              placeholder="All Entities"
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
            />
          </div>
          <Input type="date" className="w-40" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setFilterAction("");
              setFilterEntity("");
            }}
          >
            Clear
          </Button>
        </div>

        {/* Audit Logs Table */}
        <Card>
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs text-slate-500">
                      {formatDateTime(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.userName}
                    </TableCell>
                    <TableCell>{actionBadge(log.action)}</TableCell>
                    <TableCell>
                      <span className="capitalize text-xs font-medium text-slate-600">
                        {log.entity}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {log.entityId || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {log.details ? (
                        <span className="text-xs text-slate-500 truncate block">
                          {Object.entries(log.details)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {log.ipAddress || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {filteredLogs.length} logs
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
