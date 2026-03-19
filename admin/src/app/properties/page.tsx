"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/loading";
import { formatCurrency, formatDate, truncate } from "@/lib/utils";
import api, { endpoints } from "@/lib/api";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  Building2,
} from "lucide-react";
import type { AuctionProperty, PaginatedResponse } from "@/types";

const mockProperties: AuctionProperty[] = Array.from({ length: 20 }, (_, i) => ({
  id: `prop-${i + 1}`,
  title: [
    "Residential Flat in Andheri West",
    "Commercial Office Space in Bandra",
    "Industrial Land in Bhiwandi",
    "3BHK Apartment in Whitefield",
    "Agricultural Land in Raigad",
    "Residential Plot in Noida Sector 62",
    "Office Complex in Gurgaon",
    "Warehouse in Navi Mumbai",
    "Villa in Koramangala",
    "Penthouse in Juhu",
  ][i % 10],
  propertyType: (["residential", "commercial", "industrial", "agricultural", "mixed"] as const)[i % 5],
  auctionType: (["bank", "government", "court", "private"] as const)[i % 4],
  status: (["active", "expired", "sold", "upcoming", "withdrawn"] as const)[i % 5],
  address: `${100 + i} Main Road`,
  city: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Ahmedabad", "Kolkata"][i % 8],
  state: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana", "Maharashtra", "Gujarat", "West Bengal"][i % 8],
  pincode: `${400000 + i * 11}`,
  reservePrice: Math.floor(Math.random() * 50000000) + 1000000,
  marketValue: Math.floor(Math.random() * 70000000) + 2000000,
  emdAmount: Math.floor(Math.random() * 500000) + 50000,
  auctionDate: new Date(Date.now() + (i - 10) * 86400000 * 3).toISOString(),
  bankName: ["SBI", "PNB", "Bank of Baroda", "HDFC", "ICICI", "Canara Bank"][i % 6],
  area: Math.floor(Math.random() * 5000) + 500,
  areaUnit: "sq.ft",
  sourceId: `src-${(i % 5) + 1}`,
  sourceName: ["IBAPI", "SBI Portal", "BOB Auction", "PNB Notices", "HDFC Auctions"][i % 5],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
}));

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  active: { variant: "success", label: "Active" },
  expired: { variant: "danger", label: "Expired" },
  sold: { variant: "info", label: "Sold" },
  upcoming: { variant: "warning", label: "Upcoming" },
  withdrawn: { variant: "default", label: "Withdrawn" },
};

const stateOptions = [
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Delhi", label: "Delhi" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
];

const propertyTypeOptions = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "agricultural", label: "Agricultural" },
  { value: "mixed", label: "Mixed Use" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "sold", label: "Sold" },
  { value: "upcoming", label: "Upcoming" },
  { value: "withdrawn", label: "Withdrawn" },
];

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<AuctionProperty[]>(mockProperties);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const params = {
          page,
          pageSize: 20,
          search,
          state: filterState,
          city: filterCity,
          status: filterStatus,
          propertyType: filterType,
          sortBy: sortField,
          sortOrder,
        };
        const res = await api.get(endpoints.properties.list, { params });
        setProperties(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, [page, search, filterState, filterCity, filterStatus, filterType, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <AdminLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Properties</h1>
            <p className="page-subtitle">
              Manage auction property listings across India
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              {mockProperties.length} properties
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar mb-6">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-40">
            <Select
              options={stateOptions}
              placeholder="All States"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              options={propertyTypeOptions}
              placeholder="All Types"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
          <div className="w-36">
            <Select
              options={statusOptions}
              placeholder="All Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setFilterState("");
              setFilterCity("");
              setFilterStatus("");
              setFilterType("");
            }}
          >
            Clear
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="px-0 py-0">
            {loading ? (
              <div className="p-6">
                <TableSkeleton rows={10} cols={7} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        className="flex items-center gap-1"
                        onClick={() => handleSort("title")}
                      >
                        Property
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1"
                        onClick={() => handleSort("reservePrice")}
                      >
                        Reserve Price
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1"
                        onClick={() => handleSort("auctionDate")}
                      >
                        Auction Date
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => {
                    const sc = statusConfig[property.status] || { variant: "default" as BadgeVariant, label: property.status };
                    return (
                      <TableRow
                        key={property.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/properties/${property.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                              <Building2 className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {truncate(property.title, 35)}
                              </p>
                              <p className="text-xs text-slate-400">
                                {property.area} {property.areaUnit}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-xs">
                            {property.propertyType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{property.city}</p>
                            <p className="text-xs text-slate-400">
                              {property.state}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(property.reservePrice)}
                        </TableCell>
                        <TableCell>
                          {property.auctionDate
                            ? formatDate(property.auctionDate)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {property.bankName || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sc.variant} dot>
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/properties/${property.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
              (p) => (
                <Button
                  key={p}
                  variant={p === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
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
