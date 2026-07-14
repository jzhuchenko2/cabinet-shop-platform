"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createGroupConversation, createOrGetDirectConversation, sendConversationMessage } from "@/lib/db/chats";
import { hasPermission } from "@/lib/rbac";
import { requiredString } from "@/lib/validations/common";

export async function createDirectChatAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !hasPermission(currentUser, "view_chats")) {
    return;
  }

  const participantId = requiredString(formData.get("participantId"), "Team member");
  const conversation = await createOrGetDirectConversation(currentUser, participantId);

  revalidatePath("/chats");
  redirect(`/chats?conversationId=${conversation.id}`);
}

export async function createGroupChatAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !hasPermission(currentUser, "view_chats")) {
    return;
  }

  const title = requiredString(formData.get("title"), "Group name");
  const participantIds = formData.getAll("participantIds").map((value) => String(value));
  const conversation = await createGroupConversation(currentUser, { title, participantIds });

  revalidatePath("/chats");
  redirect(`/chats?conversationId=${conversation.id}`);
}

export async function sendChatMessageAction(conversationId: string, formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !hasPermission(currentUser, "view_chats")) {
    return;
  }

  const body = requiredString(formData.get("body"), "Message");
  await sendConversationMessage(currentUser, { conversationId, body });

  revalidatePath("/chats");
}
