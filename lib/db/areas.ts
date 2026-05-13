import { prisma } from "@/lib/prisma";
import type { CabinetItemType } from "@prisma/client";

export function listProjectAreas(projectId: string) {
  return prisma.area.findMany({
    where: { projectId },
    include: {
      cabinetItems: {
        orderBy: [{ itemNumber: "asc" }, { name: "asc" }]
      }
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });
}

export function listUnassignedProjectCabinetItems(projectId: string) {
  return prisma.cabinetItem.findMany({
    where: {
      projectId,
      areaId: null
    },
    orderBy: [{ itemNumber: "asc" }, { name: "asc" }]
  });
}

export async function createArea({
  projectId,
  name,
  description
}: {
  projectId: string;
  name: string;
  description: string | null;
}) {
  const areaCount = await prisma.area.count({
    where: { projectId }
  });

  return prisma.area.create({
    data: {
      projectId,
      name,
      description,
      sortOrder: areaCount + 1
    }
  });
}

export function createCabinetItem({
  projectId,
  areaId,
  name,
  itemNumber,
  itemType,
  quantity,
  width,
  height,
  depth,
  material,
  finish,
  hardware
}: {
  projectId: string;
  areaId: string | null;
  name: string;
  itemNumber: string | null;
  itemType: CabinetItemType;
  quantity: number;
  width: string | null;
  height: string | null;
  depth: string | null;
  material: string | null;
  finish: string | null;
  hardware: string | null;
}) {
  return prisma.cabinetItem.create({
    data: {
      projectId,
      areaId,
      name,
      itemNumber,
      itemType,
      quantity,
      width,
      height,
      depth,
      material,
      finish,
      hardware
    }
  });
}
