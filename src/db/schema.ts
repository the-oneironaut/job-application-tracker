import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  status: text("status", {
    enum: [
      "applied",
      "phone_screen",
      "interview",
      "technical",
      "offer",
      "accepted",
      "rejected",
      "withdrawn",
      "ghosted",
    ],
  })
    .notNull()
    .default("applied"),
  dateApplied: text("date_applied").notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: text("salary_currency").default("USD"),
  location: text("location"),
  url: text("url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  applicationId: text("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isReminder: integer("is_reminder", { mode: "boolean" }).default(false),
  reminderDate: text("reminder_date"),
  createdAt: text("created_at").notNull(),
});

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export const APPLICATION_STATUSES = [
  "applied",
  "phone_screen",
  "interview",
  "technical",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
  "ghosted",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  phone_screen: "Phone Screen",
  interview: "Interview",
  technical: "Technical",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  ghosted: "Ghosted",
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  phone_screen: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  interview: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
  technical: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  ghosted: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};
