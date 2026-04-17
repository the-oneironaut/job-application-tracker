"use server";

import { db } from "@/db";
import { applications, notes } from "@/db/schema";
import type { ApplicationStatus, ApplicationSource } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

function generateId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function createApplication(formData: FormData) {
  await requireAuth();

  const company = formData.get("company") as string;
  const role = formData.get("role") as string;
  const status = (formData.get("status") as ApplicationStatus) || "applied";
  const dateApplied = (formData.get("dateApplied") as string) || now().split("T")[0];
  const salaryMin = formData.get("salaryMin") ? Number(formData.get("salaryMin")) : null;
  const salaryMax = formData.get("salaryMax") ? Number(formData.get("salaryMax")) : null;
  const salaryCurrency = (formData.get("salaryCurrency") as string) || "USD";
  const location = (formData.get("location") as string) || null;
  const source = (formData.get("source") as ApplicationSource) || null;
  const url = (formData.get("url") as string) || null;

  if (!company || !role) {
    return { error: "Company and role are required" };
  }

  const id = generateId();
  const timestamp = now();

  await db.insert(applications).values({
    id,
    company,
    role,
    status,
    dateApplied,
    salaryMin,
    salaryMax,
    salaryCurrency,
    location,
    source,
    url,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  revalidatePath("/");
  revalidatePath("/applications");
  redirect(`/applications/${id}`);
}

export async function updateApplication(id: string, formData: FormData) {
  await requireAuth();

  const company = formData.get("company") as string;
  const role = formData.get("role") as string;
  const status = formData.get("status") as ApplicationStatus;
  const dateApplied = formData.get("dateApplied") as string;
  const salaryMin = formData.get("salaryMin") ? Number(formData.get("salaryMin")) : null;
  const salaryMax = formData.get("salaryMax") ? Number(formData.get("salaryMax")) : null;
  const salaryCurrency = (formData.get("salaryCurrency") as string) || "USD";
  const location = (formData.get("location") as string) || null;
  const source = (formData.get("source") as ApplicationSource) || null;
  const url = (formData.get("url") as string) || null;

  if (!company || !role) {
    return { error: "Company and role are required" };
  }

  await db
    .update(applications)
    .set({
      company,
      role,
      status,
      dateApplied,
      salaryMin,
      salaryMax,
      salaryCurrency,
      location,
      source,
      url,
      updatedAt: now(),
    })
    .where(eq(applications.id, id));

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  await requireAuth();

  await db
    .update(applications)
    .set({ status, updatedAt: now() })
    .where(eq(applications.id, id));

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
}

export async function deleteApplication(id: string) {
  await requireAuth();

  await db.delete(applications).where(eq(applications.id, id));

  revalidatePath("/");
  revalidatePath("/applications");
  redirect("/applications");
}

export async function addNote(
  applicationId: string,
  content: string,
  isReminder: boolean = false,
  reminderDate: string | null = null
) {
  await requireAuth();

  if (!content.trim()) {
    return { error: "Note content is required" };
  }

  await db.insert(notes).values({
    id: generateId(),
    applicationId,
    content: content.trim(),
    isReminder,
    reminderDate,
    createdAt: now(),
  });

  revalidatePath(`/applications/${applicationId}`);
}

export async function deleteNote(noteId: string, applicationId: string) {
  await requireAuth();

  await db.delete(notes).where(eq(notes.id, noteId));

  revalidatePath(`/applications/${applicationId}`);
}
