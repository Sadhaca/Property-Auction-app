"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { PageLoader } from "@/components/ui/loading";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import api, { endpoints } from "@/lib/api";
import {
  ArrowLeft,
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  History,
  Sparkles,
  ExternalLink,
  Download,
  Map,
} from "lucide-react";
import type { AuctionProperty, PropertyChangeHistory } from "@/types";

const mockProperty: AuctionProperty = {
  id: "prop-1",
  title: "Residential Flat in Andheri West, Mumbai",
  description:
    "A well-maintained 2BHK residential flat located in the prime area of Andheri West, Mumbai. The property is located near the metro station with easy access to highways and commercial establishments. The flat has a carpet area of 850 sq.ft with 2 bedrooms, 2 bathrooms, a living room, and a modular kitchen. The society has amenities like a swimming pool, gymnasium, and 24/7 security.",
  propertyType: "residential",
  auctionType: "bank",
  status: "active",
  address: "Flat No. 504, Tower B, Green Meadows Society, Andheri West",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400058",
  latitude: 19.1364,
  longitude: 72.8296,
  reservePrice: 8500000,
  marketValue: 12000000,
  emdAmount: 850000,
  bidIncrementAmount: 50000,
  auctionDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  auctionStartTime: "10:00 AM",
  auctionEndTime: "05:00 PM",
  emdLastDate: new Date(Date.now() + 5 * 86400000).toISOString(),
  inspectionDate: new Date(Date.now() + 3 * 86400000).toISOString(),
  area: 850,
  areaUnit: "sq.ft",
  builtUpArea: 1050,
  borrowerName: "Rajesh Kumar Sharma",
  bankName: "State Bank of India",
  branchName: "Andheri West Branch",
  contactPerson: "Mr. Vikram Singh",
  contactPhone: "+91 98765 43210",
  contactEmail: "vikram.singh@sbi.co.in",
  sourceId: "src-1",
  sourceName: "IBAPI",
  sourceUrl: "https://ibapi.in/auction/12345",
  externalId: "IBAPI-MH-2024-12345",
  documents: [
    { id: "d1", name: "Auction Notice.pdf", type: "application/pdf", url: "#", size: 245000 },
    { id: "d2", name: "Property Photos.zip", type: "application/zip", url: "#", size: 5200000 },
    { id: "d3", name: "Valuation Report.pdf", type: "application/pdf", url: "#", size: 890000 },
  ],
  aiSummary:
    "This is a bank-auctioned 2BHK flat in Andheri West, Mumbai, offered by SBI at a reserve price of Rs 85 Lakhs, approximately 29% below the estimated market value of Rs 1.2 Crore. The property is well-connected via metro and highways, making it an attractive investment opportunity. The EMD deadline is in 5 days, and the auction is scheduled for next week. Key risk: verify encumbrance certificate and any pending litigation.",
  aiTags: ["Residential", "Below Market Value", "Metro Accessible", "Bank Auction", "Mumbai"],
  viewCount: 342,
  favoriteCount: 47,
  createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
};

const mockHistory: PropertyChangeHistory[] = [
  {
    id: "h1",
    field: "reservePrice",
    oldValue: "9000000",
    newValue: "8500000",
    changedBy: "System (Ingestion)",
    changedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "h2",
    field: "status",
    oldValue: "upcoming",
    newValue: "active",
    changedBy: "System (Ingestion)",
    changedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "h3",
    field: "auctionDate",
    oldValue: "2024-02-15",
    newValue: "2024-02-22",
    changedBy: "Admin (Priya Patel)",
    changedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<AuctionProperty>(mockProperty);
  const [history, setHistory] = useState<PropertyChangeHistory[]>(mockHistory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      try {
        const id = params.id as string;
        const [propRes, histRes] = await Promise.allSettled([
          api.get(endpoints.properties.detail(id)),
          api.get(endpoints.properties.history(id)),
        ]);
        if (propRes.status === "fulfilled") setProperty(propRes.value.data);
        if (histRes.status === "fulfilled") setHistory(histRes.value.data);
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [params.id]);

  if (loading) {
    return (
      <AdminLayout>
        <PageLoader />
      </AdminLayout>
    );
  }

  const statusMap: Record<string, { variant: "success" | "warning" | "danger" | "info" | "default"; label: string }> = {
    active: { variant: "success", label: "Active" },
    expired: { variant: "danger", label: "Expired" },
    sold: { variant: "info", label: "Sold" },
    upcoming: { variant: "warning", label: "Upcoming" },
    withdrawn: { variant: "default", label: "Withdrawn" },
  };
  const sc = statusMap[property.status] || { variant: "default" as const, label: property.status };

  return (
    <AdminLayout>
      <div className="page-container">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Properties
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{property.title}</h1>
              <Badge variant={sc.variant} dot>
                {sc.label}
              </Badge>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {property.address}, {property.city}, {property.state} -{" "}
              {property.pincode}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              ID: {property.externalId || property.id} | Source:{" "}
              {property.sourceName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {property.sourceUrl && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="h-4 w-4" />}
                onClick={() => window.open(property.sourceUrl, "_blank")}
              >
                View Source
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">Change History</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="ai">AI Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Financial Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IndianRupee className="h-4 w-4 text-brand-600" />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs text-slate-500">Reserve Price</dt>
                      <dd className="text-xl font-bold text-brand-600">
                        {formatCurrency(property.reservePrice)}
                      </dd>
                    </div>
                    {property.marketValue && (
                      <div>
                        <dt className="text-xs text-slate-500">Market Value</dt>
                        <dd className="text-lg font-semibold text-slate-700">
                          {formatCurrency(property.marketValue)}
                        </dd>
                        <dd className="text-xs text-emerald-600">
                          {Math.round(
                            ((property.marketValue - property.reservePrice) /
                              property.marketValue) *
                              100
                          )}
                          % below market value
                        </dd>
                      </div>
                    )}
                    {property.emdAmount && (
                      <div>
                        <dt className="text-xs text-slate-500">EMD Amount</dt>
                        <dd className="font-medium">
                          {formatCurrency(property.emdAmount)}
                        </dd>
                      </div>
                    )}
                    {property.bidIncrementAmount && (
                      <div>
                        <dt className="text-xs text-slate-500">
                          Bid Increment
                        </dt>
                        <dd className="font-medium">
                          {formatCurrency(property.bidIncrementAmount)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              {/* Auction Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-brand-600" />
                    Auction Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    {property.auctionDate && (
                      <div>
                        <dt className="text-xs text-slate-500">Auction Date</dt>
                        <dd className="font-medium">
                          {formatDate(property.auctionDate)}
                        </dd>
                        <dd className="text-xs text-slate-400">
                          {property.auctionStartTime} - {property.auctionEndTime}
                        </dd>
                      </div>
                    )}
                    {property.emdLastDate && (
                      <div>
                        <dt className="text-xs text-slate-500">
                          EMD Last Date
                        </dt>
                        <dd className="font-medium">
                          {formatDate(property.emdLastDate)}
                        </dd>
                      </div>
                    )}
                    {property.inspectionDate && (
                      <div>
                        <dt className="text-xs text-slate-500">
                          Inspection Date
                        </dt>
                        <dd className="font-medium">
                          {formatDate(property.inspectionDate)}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs text-slate-500">Auction Type</dt>
                      <dd className="font-medium capitalize">
                        {property.auctionType}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Property Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-brand-600" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs text-slate-500">Type</dt>
                      <dd className="font-medium capitalize">
                        {property.propertyType}
                      </dd>
                    </div>
                    {property.area && (
                      <div>
                        <dt className="text-xs text-slate-500">Carpet Area</dt>
                        <dd className="font-medium">
                          {property.area} {property.areaUnit}
                        </dd>
                      </div>
                    )}
                    {property.builtUpArea && (
                      <div>
                        <dt className="text-xs text-slate-500">
                          Built-up Area
                        </dt>
                        <dd className="font-medium">
                          {property.builtUpArea} {property.areaUnit}
                        </dd>
                      </div>
                    )}
                    {property.borrowerName && (
                      <div>
                        <dt className="text-xs text-slate-500">Borrower</dt>
                        <dd className="font-medium">{property.borrowerName}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs text-slate-500">Views / Favorites</dt>
                      <dd className="font-medium">
                        {property.viewCount || 0} / {property.favoriteCount || 0}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>

            {/* Description + Contact */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {property.description || "No description available."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-brand-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-slate-500">Bank</dt>
                      <dd className="font-medium">{property.bankName}</dd>
                      <dd className="text-xs text-slate-400">
                        {property.branchName}
                      </dd>
                    </div>
                    {property.contactPerson && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{property.contactPerson}</span>
                      </div>
                    )}
                    {property.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{property.contactPhone}</span>
                      </div>
                    )}
                    {property.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{property.contactEmail}</span>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-brand-600" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {property.documents && property.documents.length > 0 ? (
                  <div className="space-y-3">
                    {property.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/10">
                            <FileText className="h-5 w-5 text-brand-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-slate-400">
                              {doc.size
                                ? `${(doc.size / 1024).toFixed(0)} KB`
                                : "Unknown size"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download className="h-4 w-4" />}
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No documents available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4 text-brand-600" />
                  Change History
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Old Value</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Changed By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium capitalize">
                          {h.field.replace(/([A-Z])/g, " $1").trim()}
                        </TableCell>
                        <TableCell className="text-red-600 line-through">
                          {h.field.includes("Price") || h.field.includes("price")
                            ? formatCurrency(Number(h.oldValue))
                            : h.oldValue}
                        </TableCell>
                        <TableCell className="text-emerald-600 font-medium">
                          {h.field.includes("Price") || h.field.includes("price")
                            ? formatCurrency(Number(h.newValue))
                            : h.newValue}
                        </TableCell>
                        <TableCell className="text-xs">{h.changedBy}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatDateTime(h.changedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Map className="h-4 w-4 text-brand-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
                  <div className="text-center">
                    <MapPin className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-500">
                      Map Integration Placeholder
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {property.latitude && property.longitude
                        ? `Coordinates: ${property.latitude}, ${property.longitude}`
                        : "Coordinates not available"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {property.address}, {property.city}, {property.state}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-brand-600" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {property.aiSummary ? (
                  <div>
                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                      <p className="text-sm leading-relaxed text-slate-700">
                        {property.aiSummary}
                      </p>
                    </div>
                    {property.aiTags && property.aiTags.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-medium text-slate-500">
                          AI Generated Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {property.aiTags.map((tag) => (
                            <Badge key={tag} variant="info">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-slate-400">
                    AI summary not available for this property
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Meta */}
        <div className="mt-6 flex items-center gap-6 text-xs text-slate-400">
          <span>Created: {formatDateTime(property.createdAt)}</span>
          <span>Updated: {formatDateTime(property.updatedAt)}</span>
          <span>Source: {property.sourceName}</span>
        </div>
      </div>
    </AdminLayout>
  );
}
