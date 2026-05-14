import { prisma } from "@/lib/prisma";

export type AppRole =
  | "OWNER_ADMIN"
  | "MANAGER"
  | "SALES"
  | "DESIGNER"
  | "PURCHASER"
  | "SHOP_LEAD"
  | "DEPARTMENT_USER"
  | "INSTALLER";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  organizationId: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: "admin@example.com" }
  });

  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    };
  }

  return {
    id: "seed-user-owner",
    name: "MVP Admin",
    email: "admin@example.com",
    role: "OWNER_ADMIN",
    organizationId: "seed-organization"
  };
}
