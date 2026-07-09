import { SalesWorkspace } from "@/components/work-areas/sales-workspace";
import { AccessDenied } from "@/components/ui/access-denied";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function SalesPage() {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "view_sales")) {
    return <AccessDenied description="Sales is limited to users with sales or management access." />;
  }

  return <SalesWorkspace />;
}
