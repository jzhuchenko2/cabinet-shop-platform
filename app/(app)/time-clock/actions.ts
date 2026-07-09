"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function clockInAction(_formData?: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to clock in.");
  }

  const activeEntry = await prisma.timeClockEntry.findFirst({
    where: {
      userId: user.id,
      endedAt: null
    }
  });

  if (!activeEntry) {
    await prisma.timeClockEntry.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        source: "MANUAL",
        verificationNote: "Future verification: shop Wi-Fi, QR/NFC, or geofence proximity."
      }
    });
  }

  revalidatePath("/dashboard");
}

export async function clockOutAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to clock out.");
  }

  const entryId = String(formData.get("entryId") ?? "");
  const activeEntry = await prisma.timeClockEntry.findFirst({
    where: {
      ...(entryId ? { id: entryId } : {}),
      userId: user.id,
      endedAt: null
    }
  });

  if (activeEntry) {
    await prisma.timeClockEntry.update({
      where: { id: activeEntry.id },
      data: { endedAt: new Date() }
    });
  }

  revalidatePath("/dashboard");
}
