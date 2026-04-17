import { db } from "@/db";
import { applications } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ApplicationsClient } from "@/components/applications-client";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const allApps = await db
    .select()
    .from(applications)
    .orderBy(desc(applications.updatedAt));

  return <ApplicationsClient applications={allApps} />;
}
