"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  type Application,
  type ApplicationStatus,
  type ApplicationSource,
  STATUS_LABELS,
  STATUS_COLORS,
  SOURCE_LABELS,
  APPLICATION_STATUSES,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search, LayoutGrid, List, ExternalLink } from "lucide-react";
import { updateApplicationStatus } from "@/app/(dashboard)/applications/actions";
import { cn } from "@/lib/utils";

interface ApplicationsClientProps {
  applications: Application[];
}

// Pipeline order for Kanban
const PIPELINE_STATUSES: ApplicationStatus[] = [
  "applied",
  "phone_screen",
  "interview",
  "technical",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
  "ghosted",
];

export function ApplicationsClient({ applications }: ApplicationsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"table" | "kanban">("table");

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !search ||
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const kanbanColumns = useMemo(() => {
    const cols = new Map<ApplicationStatus, Application[]>();
    PIPELINE_STATUSES.forEach((s) => cols.set(s, []));
    filtered.forEach((app) => {
      const status = app.status as ApplicationStatus;
      cols.get(status)?.push(app);
    });
    return cols;
  }, [filtered]);

  function formatSalary(app: Application) {
    if (!app.salaryMin && !app.salaryMax) return "—";
    const currency = app.salaryCurrency || "USD";
    const fmt = (n: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(n);
    if (app.salaryMin && app.salaryMax) return `${fmt(app.salaryMin)} - ${fmt(app.salaryMax)}`;
    if (app.salaryMin) return `${fmt(app.salaryMin)}+`;
    return `Up to ${fmt(app.salaryMax!)}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            {filtered.length} application{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/applications/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setView("table")}
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setView("kanban")}
            className="h-8 w-8"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === "table" ? (
        /* Table view */
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No applications found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((app) => (
                  <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-medium hover:underline"
                      >
                        {app.company}
                      </Link>
                      {app.url && (
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 inline-block text-muted-foreground hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs font-medium",
                          STATUS_COLORS[app.status as ApplicationStatus]
                        )}
                      >
                        {STATUS_LABELS[app.status as ApplicationStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.source ? SOURCE_LABELS[app.source as ApplicationSource] : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.dateApplied}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatSalary(app)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.location || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Kanban view */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STATUSES.map((status) => {
            const apps = kanbanColumns.get(status) || [];
            if (apps.length === 0 && statusFilter !== "all" && statusFilter !== status) return null;
            return (
              <div
                key={status}
                className="flex w-64 shrink-0 flex-col rounded-lg border bg-muted/30"
              >
                <div className="flex items-center justify-between border-b p-3">
                  <h3 className="text-sm font-medium">
                    {STATUS_LABELS[status]}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {apps.length}
                  </Badge>
                </div>
                <div className="flex-1 space-y-2 p-2">
                  {apps.map((app) => (
                    <Link key={app.id} href={`/applications/${app.id}`}>
                      <Card className="cursor-pointer transition-shadow hover:shadow-md">
                        <CardContent className="p-3">
                          <p className="font-medium text-sm">{app.company}</p>
                          <p className="text-xs text-muted-foreground">
                            {app.role}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {app.dateApplied}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  {apps.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No applications
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
