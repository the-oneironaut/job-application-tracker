import { db } from "@/db";
import { applications } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ApplicationsClient } from "@/components/applications-client";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const allApps = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, session.userId))
    .orderBy(desc(applications.updatedAt));

  return <ApplicationsClient applications={allApps} />;
}
