import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApplicationForm } from "@/components/application-form";
import { createApplication } from "@/app/(dashboard)/applications/actions";

export default function NewApplicationPage() {
  async function action(_prevState: { error: string } | null | undefined, formData: FormData) {
    "use server";
    const result = await createApplication(formData);
    return result ?? null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Application</h1>
        <p className="text-muted-foreground">
          Track a new job application
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            Fill in the details of the job you applied to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm action={action} />
        </CardContent>
      </Card>
    </div>
  );
}
