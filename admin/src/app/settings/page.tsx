"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Globe,
  Database,
  Bell,
  Shield,
  Save,
  RefreshCw,
} from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <AdminLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">
              Configure platform settings and preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="ingestion">Ingestion</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4 text-brand-600" />
                    General Settings
                  </CardTitle>
                  <CardDescription>
                    Basic platform configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Platform Name"
                      defaultValue="India Property Auction Discovery"
                    />
                    <Input
                      label="Admin Email"
                      type="email"
                      defaultValue="admin@propertyauction.in"
                    />
                    <Input
                      label="Support Email"
                      type="email"
                      defaultValue="support@propertyauction.in"
                    />
                    <Select
                      label="Default Currency"
                      options={[
                        { value: "INR", label: "Indian Rupee (INR)" },
                        { value: "USD", label: "US Dollar (USD)" },
                      ]}
                      defaultValue="INR"
                    />
                    <Select
                      label="Default Language"
                      options={[
                        { value: "en", label: "English" },
                        { value: "hi", label: "Hindi" },
                      ]}
                      defaultValue="en"
                    />
                    <Select
                      label="Timezone"
                      options={[
                        { value: "Asia/Kolkata", label: "IST (Asia/Kolkata)" },
                        { value: "UTC", label: "UTC" },
                      ]}
                      defaultValue="Asia/Kolkata"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    leftIcon={<Save className="h-4 w-4" />}
                    onClick={handleSave}
                    isLoading={saving}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="h-4 w-4 text-brand-600" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>
                    Backend API and service configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="API Base URL"
                      defaultValue="http://localhost:8000"
                    />
                    <Input
                      label="API Version"
                      defaultValue="v1"
                      disabled
                    />
                    <Input
                      label="Request Timeout (ms)"
                      type="number"
                      defaultValue="30000"
                    />
                    <Input
                      label="Max Retries"
                      type="number"
                      defaultValue="3"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    leftIcon={<Save className="h-4 w-4" />}
                    onClick={handleSave}
                    isLoading={saving}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ingestion">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <RefreshCw className="h-4 w-4 text-brand-600" />
                  Ingestion Settings
                </CardTitle>
                <CardDescription>
                  Configure data ingestion pipeline parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Max Concurrent Jobs"
                    type="number"
                    defaultValue="3"
                  />
                  <Input
                    label="Job Timeout (seconds)"
                    type="number"
                    defaultValue="3600"
                  />
                  <Input
                    label="Retry Attempts"
                    type="number"
                    defaultValue="3"
                  />
                  <Input
                    label="Retry Delay (seconds)"
                    type="number"
                    defaultValue="60"
                  />
                  <Input
                    label="Batch Size"
                    type="number"
                    defaultValue="100"
                  />
                  <Input
                    label="Rate Limit (requests/min)"
                    type="number"
                    defaultValue="60"
                  />
                  <Select
                    label="Deduplication Strategy"
                    options={[
                      { value: "external_id", label: "By External ID" },
                      { value: "title_address", label: "By Title + Address" },
                      { value: "fuzzy", label: "Fuzzy Matching" },
                    ]}
                    defaultValue="external_id"
                  />
                  <Select
                    label="On Duplicate"
                    options={[
                      { value: "update", label: "Update Existing" },
                      { value: "skip", label: "Skip" },
                      { value: "create_new", label: "Create New" },
                    ]}
                    defaultValue="update"
                  />
                </div>

                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-medium text-slate-700">
                    Data Quality Thresholds
                  </h4>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Input
                      label="Min Completeness (%)"
                      type="number"
                      defaultValue="70"
                    />
                    <Input
                      label="Max Duplicate Rate (%)"
                      type="number"
                      defaultValue="5"
                    />
                    <Input
                      label="Freshness Threshold (days)"
                      type="number"
                      defaultValue="7"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                  isLoading={saving}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-brand-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Ingestion job completed",
                      description: "Notify when an ingestion job finishes",
                      enabled: true,
                    },
                    {
                      title: "Ingestion job failed",
                      description: "Notify when an ingestion job fails",
                      enabled: true,
                    },
                    {
                      title: "Data quality alert",
                      description: "Notify when data quality drops below threshold",
                      enabled: true,
                    },
                    {
                      title: "New user registration",
                      description: "Notify when a new user signs up",
                      enabled: false,
                    },
                    {
                      title: "Source becomes unreachable",
                      description: "Notify when a data source fails health check",
                      enabled: true,
                    },
                    {
                      title: "Daily summary report",
                      description: "Receive a daily summary of platform activity",
                      enabled: true,
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-slate-900">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          defaultChecked={item.enabled}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-brand-500/20" />
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                  isLoading={saving}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-brand-600" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Authentication and security configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Session Timeout (minutes)"
                    type="number"
                    defaultValue="60"
                  />
                  <Input
                    label="Max Login Attempts"
                    type="number"
                    defaultValue="5"
                  />
                  <Input
                    label="Lockout Duration (minutes)"
                    type="number"
                    defaultValue="30"
                  />
                  <Input
                    label="Password Min Length"
                    type="number"
                    defaultValue="8"
                  />
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    {
                      title: "Require Two-Factor Authentication",
                      description: "Require 2FA for all admin accounts",
                      enabled: false,
                    },
                    {
                      title: "IP Allowlisting",
                      description: "Restrict admin access to specific IPs",
                      enabled: false,
                    },
                    {
                      title: "Audit Logging",
                      description: "Log all administrative actions",
                      enabled: true,
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-slate-900">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          defaultChecked={item.enabled}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-brand-500/20" />
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                  isLoading={saving}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
