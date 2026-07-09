import { ShopFloorWorkspace } from "@/components/work-areas/shop-floor-workspace";
import { AccessDenied } from "@/components/ui/access-denied";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function ShopFloorPage() {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "view_shop_floor")) {
    return <AccessDenied description="Shop Floor is limited to managers and shop leads." />;
  }

  return <ShopFloorWorkspace />;
}
