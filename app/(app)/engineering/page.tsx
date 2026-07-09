import { EngineeringWorkspace } from "@/components/work-areas/engineering-workspace";
import { AccessDenied } from "@/components/ui/access-denied";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function EngineeringPage() {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "view_engineering")) {
    return <AccessDenied description="Engineering is limited to users with engineering or management access." />;
  }

  return <EngineeringWorkspace />;
}
