import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return <AppShell user={currentUser}>{children}</AppShell>;
}
