"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoUserCookieName } from "@/lib/auth";

export async function selectDemoUser(formData: FormData) {
  const email = String(formData.get("email") ?? "admin@example.com");

  cookies().set(demoUserCookieName, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  redirect("/dashboard");
}
