import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { isFullAccess } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!isFullAccess(currentUser)) {
    return <AccessDenied description="Settings are limited to managers and owners." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Shop settings"
        description="Manager-only configuration for the cabinet shop platform."
      />
      <section className="card">
        <h2>Settings workspace</h2>
        <p className="muted">Configuration controls will live here as the MVP settings surface expands.</p>
      </section>
    </>
  );
}
