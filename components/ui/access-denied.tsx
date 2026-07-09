import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export function AccessDenied({
  title = "Access denied",
  description = "Your current role does not have access to this area."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <>
      <PageHeader eyebrow="Security" title={title} description={description} />
      <section className="card">
        <p className="muted">Use your dashboard to access the work assigned to your role.</p>
        <Link className="button secondary" href="/dashboard">
          Back to dashboard
        </Link>
      </section>
    </>
  );
}
