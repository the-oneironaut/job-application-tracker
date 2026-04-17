"use client";

import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/db/schema";
import { updateApplicationStatus } from "@/app/(dashboard)/applications/actions";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface StatusPipelineProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

const PIPELINE_ORDER: ApplicationStatus[] = [
  "applied",
  "phone_screen",
  "interview",
  "technical",
  "offer",
  "accepted",
];

const TERMINAL_STATUSES: ApplicationStatus[] = [
  "rejected",
  "withdrawn",
  "ghosted",
];

export function StatusPipeline({
  applicationId,
  currentStatus,
}: StatusPipelineProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusClick(status: ApplicationStatus) {
    if (status === currentStatus) return;
    startTransition(() => {
      updateApplicationStatus(applicationId, status);
    });
  }

  const currentIndex = PIPELINE_ORDER.indexOf(currentStatus);

  return (
    <div className="space-y-4">
      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Updating status...
        </div>
      )}

      {/* Main pipeline */}
      <div className="flex flex-wrap gap-1">
        {PIPELINE_ORDER.map((status, index) => {
          const isActive = status === currentStatus;
          const isPassed = currentIndex >= 0 && index < currentIndex;

          return (
            <button
              key={status}
              onClick={() => handleStatusClick(status)}
              disabled={isPending}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                "hover:ring-2 hover:ring-primary/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isActive &&
                  "bg-primary text-primary-foreground shadow-sm",
                isPassed &&
                  "bg-primary/20 text-primary",
                !isActive &&
                  !isPassed &&
                  "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>

      {/* Terminal statuses */}
      <div className="flex gap-1">
        {TERMINAL_STATUSES.map((status) => {
          const isActive = status === currentStatus;
          return (
            <button
              key={status}
              onClick={() => handleStatusClick(status)}
              disabled={isPending}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                "hover:ring-2 hover:ring-destructive/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isActive &&
                  "bg-destructive text-destructive-foreground shadow-sm",
                !isActive &&
                  "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
