import { db } from "@/db";
import { applications } from "@/db/schema";
import { desc, count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
import {
  STATUS_LABELS,
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, TrendingUp, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import { StatusChart } from "@/components/status-chart";
import { TimelineChart } from "@/components/timeline-chart";
import { format } from "date-fns";

const ACTIVE_STATUSES: ApplicationStatus[] = [
  "applied",
  "phone_screen",
  "interview",
  "technical",
  "offer",
];

const RESPONSE_STATUSES: ApplicationStatus[] = [
  "phone_screen",
  "interview",
  "technical",
  "offer",
  "accepted",
  "rejected",
];

export default async function DashboardPage() {
  const allApps = await db.select().from(applications).orderBy(desc(applications.createdAt));

  const total = allApps.length;
  const active = allApps.filter((a) => ACTIVE_STATUSES.includes(a.status as ApplicationStatus)).length;
  const offers = allApps.filter((a) => a.status === "offer" || a.status === "accepted").length;
  const responseRate =
    total > 0
      ? Math.round(
          (allApps.filter((a) => RESPONSE_STATUSES.includes(a.status as ApplicationStatus)).length /
            total) *
            100
        )
      : 0;

  // Status breakdown
  const statusCounts: { status: string; count: number }[] = APPLICATION_STATUSES.map((s) => ({
    status: STATUS_LABELS[s],
    count: allApps.filter((a) => a.status === s).length,
  })).filter((s) => s.count > 0);

  // Timeline data: applications per week
  const timelineMap = new Map<string, number>();
  allApps.forEach((a) => {
    const date = new Date(a.dateApplied);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = format(weekStart, "MMM d");
    timelineMap.set(key, (timelineMap.get(key) || 0) + 1);
  });
  const timelineData = Array.from(timelineMap.entries())
    .map(([week, count]) => ({ week, count }))
    .reverse()
    .slice(0, 12)
    .reverse();

  // Recent applications
  const recent = allApps.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your job application progress
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offers</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Got a response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Applications by current status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusCounts.length > 0 ? (
              <StatusChart data={statusCounts} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No applications yet
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
            <CardDescription>Applications per week</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <TimelineChart data={timelineData} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No applications yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your latest tracked applications</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length > 0 ? (
            <div className="space-y-3">
              {recent.map((app) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{app.company}</p>
                    <p className="text-sm text-muted-foreground">{app.role}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {STATUS_LABELS[app.status as ApplicationStatus]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {app.dateApplied}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No applications yet</p>
              <Link
                href="/applications/new"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Add your first application
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
