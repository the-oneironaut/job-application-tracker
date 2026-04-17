"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_STATUSES,
  APPLICATION_SOURCES,
  STATUS_LABELS,
  SOURCE_LABELS,
  type Application,
  type ApplicationStatus,
  type ApplicationSource,
} from "@/db/schema";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";

type ActionResult = { error: string } | null | undefined;

interface ApplicationFormProps {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  application?: Application;
  submitLabel?: string;
}

export function ApplicationForm({
  action,
  application,
  submitLabel = "Save Application",
}: ApplicationFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            name="company"
            required
            defaultValue={application?.company}
            placeholder="e.g. Google"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            name="role"
            required
            defaultValue={application?.role}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            defaultValue={application?.status || "applied"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateApplied">Date Applied</Label>
          <Input
            id="dateApplied"
            name="dateApplied"
            type="date"
            defaultValue={
              application?.dateApplied ||
              new Date().toISOString().split("T")[0]
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="salaryMin">Salary Min</Label>
          <Input
            id="salaryMin"
            name="salaryMin"
            type="number"
            defaultValue={application?.salaryMin ?? ""}
            placeholder="e.g. 120000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salaryMax">Salary Max</Label>
          <Input
            id="salaryMax"
            name="salaryMax"
            type="number"
            defaultValue={application?.salaryMax ?? ""}
            placeholder="e.g. 180000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salaryCurrency">Currency</Label>
          <Input
            id="salaryCurrency"
            name="salaryCurrency"
            defaultValue={application?.salaryCurrency || "USD"}
            placeholder="USD"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={application?.location ?? ""}
            placeholder="e.g. Remote, New York, NY"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Select
            name="source"
            defaultValue={application?.source || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Where did you find it?" />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">Job Posting URL</Label>
          <Input
            id="url"
            name="url"
            type="url"
            defaultValue={application?.url ?? ""}
            placeholder="https://..."
          />
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
