import { DesignWorkspace } from "@/components/work-areas/design-workspace";
import { AccessDenied } from "@/components/ui/access-denied";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function DesignPage() {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "view_design")) {
    return <AccessDenied description="Design is limited to users with design or management access." />;
  }

  return <DesignWorkspace />;
}
