import { db } from "@/db";
import { applications, notes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  SOURCE_LABELS,
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type ApplicationSource,
} from "@/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ApplicationForm } from "@/components/application-form";
import { NotesSection } from "@/components/notes-section";
import { StatusPipeline } from "@/components/status-pipeline";
import { DeleteApplicationButton } from "@/components/delete-application-button";
import {
  updateApplication,
  deleteApplication,
} from "@/app/(dashboard)/applications/actions";
import { ExternalLink, MapPin, DollarSign, Calendar, Globe } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const app = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .get();

  if (!app) notFound();

  const appNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.applicationId, id))
    .orderBy(desc(notes.createdAt));

  async function handleUpdate(_prevState: { error: string } | null | undefined, formData: FormData) {
    "use server";
    const result = await updateApplication(id, formData);
    return result ?? null;
  }

  async function handleDelete() {
    "use server";
    return deleteApplication(id);
  }

  const salary = (() => {
    if (!app.salaryMin && !app.salaryMax) return null;
    const currency = app.salaryCurrency || "USD";
    const fmt = (n: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(n);
    if (app.salaryMin && app.salaryMax) return `${fmt(app.salaryMin)} – ${fmt(app.salaryMax)}`;
    if (app.salaryMin) return `${fmt(app.salaryMin)}+`;
    return `Up to ${fmt(app.salaryMax!)}`;
  })();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {app.company}
            </h1>
            <Badge
              className={STATUS_COLORS[app.status as ApplicationStatus]}
              variant="secondary"
            >
              {STATUS_LABELS[app.status as ApplicationStatus]}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">{app.role}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Applied {app.dateApplied}
            </span>
            {app.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {app.location}
              </span>
            )}
            {app.source && (
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {SOURCE_LABELS[app.source as ApplicationSource]}
              </span>
            )}
            {salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {salary}
              </span>
            )}
            {app.url && (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Job Posting
              </a>
            )}
          </div>
        </div>
        <DeleteApplicationButton onDelete={handleDelete} />
      </div>

      {/* Status Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status Pipeline</CardTitle>
          <CardDescription>Click a status to update</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusPipeline
            applicationId={app.id}
            currentStatus={app.status as ApplicationStatus}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes & Reminders</CardTitle>
          <CardDescription>
            Track your progress and set follow-up reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotesSection applicationId={app.id} notes={appNotes} />
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Details</CardTitle>
          <CardDescription>Update application information</CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm
            action={handleUpdate}
            application={app}
            submitLabel="Update Application"
          />
        </CardContent>
      </Card>
    </div>
  );
}
