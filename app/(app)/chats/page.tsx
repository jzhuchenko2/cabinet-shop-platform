import { ChatWorkspace } from "@/components/chats/chat-workspace";
import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { getConversationForUser, listChatProjects, listOrganizationChatUsers, listUserConversations, markConversationRead } from "@/lib/db/chats";
import { hasPermission } from "@/lib/rbac";
import { createDirectChatAction, createGroupChatAction, sendChatMessageAction } from "./actions";

export const dynamic = "force-dynamic";

type ChatPageProps = {
  searchParams?: {
    conversationId?: string;
  };
};

function getConversationTitle(
  conversation: Awaited<ReturnType<typeof listUserConversations>>[number] | NonNullable<Awaited<ReturnType<typeof getConversationForUser>>>,
  currentUserId: string
) {
  if (conversation.type === "GROUP") {
    return conversation.title ?? "Group chat";
  }

  return conversation.participants.find((participant) => participant.userId !== currentUserId)?.user.name ?? "Direct message";
}

function toConversationSummary(conversation: Awaited<ReturnType<typeof listUserConversations>>[number], currentUserId: string) {
  const lastMessage = conversation.messages[0];

  return {
    id: conversation.id,
    title: getConversationTitle(conversation, currentUserId),
    type: conversation.type,
    project: conversation.project
      ? {
          id: conversation.project.id,
          name: conversation.project.name,
          client: conversation.project.client.name
        }
      : null,
    participantNames: conversation.participants.map((participant) => participant.user.name),
    lastMessage: lastMessage ? `${lastMessage.sender.name}: ${lastMessage.body}` : "No messages yet",
    lastMessageAt: lastMessage?.createdAt.toISOString() ?? null,
    unreadCount: conversation.unreadCount
  };
}

function toSelectedConversation(conversation: NonNullable<Awaited<ReturnType<typeof getConversationForUser>>>, currentUserId: string) {
  return {
    id: conversation.id,
    title: getConversationTitle(conversation, currentUserId),
    type: conversation.type,
    project: conversation.project
      ? {
          id: conversation.project.id,
          name: conversation.project.name,
          client: conversation.project.client.name
        }
      : null,
    participants: conversation.participants.map((participant) => ({
      id: participant.user.id,
      name: participant.user.name,
      email: participant.user.email,
      role: participant.user.role,
      department: participant.user.department
    })),
    messages: conversation.messages.map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id,
        name: message.sender.name
      }
    }))
  };
}

export default async function ChatsPage({ searchParams }: ChatPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !hasPermission(currentUser, "view_chats")) {
    return <AccessDenied description="Chat access is limited to signed-in shop users." />;
  }

  const initialConversations = await listUserConversations(currentUser);
  const selectedConversationId = searchParams?.conversationId ?? initialConversations[0]?.id ?? null;

  if (selectedConversationId) {
    await markConversationRead(selectedConversationId, currentUser);
  }

  const [users, projects, conversations, selectedConversation] = await Promise.all([
    listOrganizationChatUsers(currentUser),
    listChatProjects(currentUser),
    listUserConversations(currentUser),
    selectedConversationId ? getConversationForUser(selectedConversationId, currentUser) : Promise.resolve(null)
  ]);

  const sendMessageAction = selectedConversation ? sendChatMessageAction.bind(null, selectedConversation.id) : undefined;

  return (
    <>
      <PageHeader eyebrow="Communication" title="Chats" />
      <ChatWorkspace
        conversations={conversations.map((conversation) => toConversationSummary(conversation, currentUser.id))}
        createDirectChatAction={createDirectChatAction}
        createGroupChatAction={createGroupChatAction}
        currentUserId={currentUser.id}
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
          client: project.client.name
        }))}
        selectedConversation={selectedConversation ? toSelectedConversation(selectedConversation, currentUser.id) : null}
        sendMessageAction={sendMessageAction}
        users={users}
      />
    </>
  );
}
