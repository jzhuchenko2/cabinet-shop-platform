import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

export type AppRole = UserRole;

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  organizationId: string;
  departmentId: string | null;
};

export const demoUserCookieName = "cabinet-shop-demo-user-email";

const fallbackUsers: Record<string, CurrentUser> = {
  "admin@example.com": {
    id: "seed-user-owner",
    name: "MVP Admin",
    email: "admin@example.com",
    role: "OWNER_ADMIN",
    organizationId: "seed-organization",
    departmentId: null
  },
  "manager@example.com": {
    id: "seed-user-manager",
    name: "Morgan Manager",
    email: "manager@example.com",
    role: "MANAGER",
    organizationId: "seed-organization",
    departmentId: null
  },
  "sam@example.com": {
    id: "seed-user-shop-lead",
    name: "Sam Rivera",
    email: "sam@example.com",
    role: "SHOP_LEAD",
    organizationId: "seed-organization",
    departmentId: null
  },
  "casey@example.com": {
    id: "seed-user-employee",
    name: "Casey Worker",
    email: "casey@example.com",
    role: "DEPARTMENT_USER",
    organizationId: "seed-organization",
    departmentId: null
  }
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const selectedEmail = cookies().get(demoUserCookieName)?.value ?? "admin@example.com";
  const user = await prisma.user.findUnique({
    where: { email: selectedEmail }
  });

  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      departmentId: user.departmentId
    };
  }

  return fallbackUsers[selectedEmail] ?? fallbackUsers["admin@example.com"];
}
