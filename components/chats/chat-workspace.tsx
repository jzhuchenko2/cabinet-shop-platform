"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type ChatUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: {
    name: string;
  } | null;
};

type ConversationSummary = {
  id: string;
  title: string;
  type: "DIRECT" | "GROUP";
  participantNames: string[];
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
};

type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
};

type SelectedConversation = {
  id: string;
  title: string;
  type: "DIRECT" | "GROUP";
  participants: ChatUser[];
  messages: ChatMessage[];
} | null;

type ChatWorkspaceProps = {
  currentUserId: string;
  users: ChatUser[];
  conversations: ConversationSummary[];
  selectedConversation: SelectedConversation;
  createDirectChatAction: (formData: FormData) => Promise<void>;
  createGroupChatAction: (formData: FormData) => Promise<void>;
  sendMessageAction?: (formData: FormData) => Promise<void>;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatConversationTime(value: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function ChatWorkspace({
  currentUserId,
  users,
  conversations,
  selectedConversation,
  createDirectChatAction,
  createGroupChatAction,
  sendMessageAction
}: ChatWorkspaceProps) {
  const router = useRouter();
  const messageFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <section className="chat-shell">
      <aside className="chat-sidebar-panel">
        <div className="chat-panel-heading">
          <div>
            <p className="eyebrow">Messages</p>
            <h2>Shop chats</h2>
          </div>
          <span className="status-pill">{conversations.length} active</span>
        </div>

        <div className="chat-create-grid">
          <form action={createDirectChatAction} className="chat-create-card">
            <label htmlFor="direct-participant">Direct message</label>
            <div className="chat-inline-form-row">
              <select id="direct-participant" name="participantId" required>
                <option value="">Choose teammate</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <button className="button secondary" type="submit">
                Start
              </button>
            </div>
          </form>

          <form action={createGroupChatAction} className="chat-create-card">
            <label htmlFor="group-title">Group chat</label>
            <input id="group-title" name="title" placeholder="Install crew, Anderson Kitchen..." required />
            <div className="chat-checkbox-list" aria-label="Group members">
              {users.map((user) => (
                <label key={user.id}>
                  <input name="participantIds" type="checkbox" value={user.id} />
                  <span>
                    {user.name}
                    <small>{user.department?.name ?? user.role.replace("_", " ")}</small>
                  </span>
                </label>
              ))}
            </div>
            <button className="button secondary" type="submit">
              Create group
            </button>
          </form>
        </div>

        <nav className="chat-conversation-list" aria-label="Conversations">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <Link
                className={selectedConversation?.id === conversation.id ? "chat-conversation-link active" : "chat-conversation-link"}
                href={`/chats?conversationId=${conversation.id}`}
                key={conversation.id}
              >
                <span>
                  <strong>{conversation.title}</strong>
                  <small>{conversation.lastMessage}</small>
                </span>
                <span className="chat-conversation-meta">
                  {conversation.unreadCount > 0 ? <i>{conversation.unreadCount}</i> : null}
                  <small>{formatConversationTime(conversation.lastMessageAt)}</small>
                </span>
              </Link>
            ))
          ) : (
            <div className="chat-empty-state">
              <strong>No chats yet</strong>
              <span>Start a direct message or create a group for a project handoff.</span>
            </div>
          )}
        </nav>
      </aside>

      <main className="chat-thread-panel">
        {selectedConversation ? (
          <>
            <header className="chat-thread-header">
              <div>
                <p className="eyebrow">{selectedConversation.type === "GROUP" ? "Group chat" : "Direct message"}</p>
                <h2>{selectedConversation.title}</h2>
                <span>{selectedConversation.participants.map((participant) => participant.name).join(", ")}</span>
              </div>
            </header>

            <div className="chat-message-list" aria-live="polite">
              {selectedConversation.messages.length > 0 ? (
                selectedConversation.messages.map((message) => {
                  const isOwnMessage = message.sender.id === currentUserId;

                  return (
                    <article className={isOwnMessage ? "chat-message own" : "chat-message"} key={message.id}>
                      <div>
                        <strong>{isOwnMessage ? "You" : message.sender.name}</strong>
                        <small>{formatMessageTime(message.createdAt)}</small>
                      </div>
                      <p>{message.body}</p>
                    </article>
                  );
                })
              ) : (
                <div className="chat-thread-empty">
                  <strong>No messages yet</strong>
                  <span>Send the first update to get this conversation moving.</span>
                </div>
              )}
            </div>

            {sendMessageAction ? (
              <form
                action={sendMessageAction}
                onSubmit={(event) => {
                  const form = event.currentTarget;
                  window.setTimeout(() => form.reset(), 0);
                }}
                className="chat-composer"
                ref={messageFormRef}
              >
                <textarea name="body" placeholder="Write a message..." required rows={3} />
                <button className="button" type="submit">
                  Send
                </button>
              </form>
            ) : null}
          </>
        ) : (
          <div className="chat-start-card">
            <p className="eyebrow">Ready when you are</p>
            <h2>Choose a conversation</h2>
            <p className="muted">Direct messages and group chats live here for project decisions, blockers, and shop-floor updates.</p>
          </div>
        )}
      </main>
    </section>
  );
}
