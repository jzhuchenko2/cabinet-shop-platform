import { prisma } from "@/lib/prisma";

export function listOrganizationUsers(organizationId: string) {
  return prisma.user.findMany({
    where: {
      organizationId,
      isActive: true
    },
    include: {
      department: true
    },
    orderBy: [{ name: "asc" }]
  });
}
