"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

type ChatProject = {
  id: string;
  name: string;
  client: string;
};

type ConversationSummary = {
  id: string;
  title: string;
  type: "DIRECT" | "GROUP";
  project: ChatProject | null;
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
  project: ChatProject | null;
  participants: ChatUser[];
  messages: ChatMessage[];
} | null;

type ChatWorkspaceProps = {
  currentUserId: string;
  users: ChatUser[];
  projects: ChatProject[];
  conversations: ConversationSummary[];
  selectedConversation: SelectedConversation;
  createDirectChatAction: (formData: FormData) => Promise<void>;
  createGroupChatAction: (formData: FormData) => Promise<void>;
  sendMessageAction?: (formData: FormData) => Promise<void>;
};

type CreateMode = "DIRECT" | "GROUP" | null;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatConversationTime(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return formatMessageTime(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function getConversationPreview(conversation: ConversationSummary) {
  if (conversation.lastMessage === "No messages yet") {
    return conversation.project ? `${conversation.project.client} - Project chat` : "No messages yet";
  }

  return conversation.lastMessage;
}

export function ChatWorkspace({
  currentUserId,
  users,
  projects,
  conversations,
  selectedConversation,
  createDirectChatAction,
  createGroupChatAction,
  sendMessageAction
}: ChatWorkspaceProps) {
  const router = useRouter();
  const messageFormRef = useRef<HTMLFormElement>(null);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <section className={selectedConversation ? "chat-shell has-thread" : "chat-shell"}>
      <aside className="chat-sidebar-panel">
        <div className="chat-panel-heading">
          <div>
            <p className="eyebrow">Messages</p>
            <h2>Chats</h2>
          </div>
          <div className="chat-compose-menu">
            <button
              aria-expanded={isCreateMenuOpen}
              aria-label="New chat"
              className="chat-compose-button"
              onClick={() => setIsCreateMenuOpen((isOpen) => !isOpen)}
              type="button"
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
            {isCreateMenuOpen ? (
              <div className="chat-compose-popover">
                <button
                  onClick={() => {
                    setCreateMode("DIRECT");
                    setIsCreateMenuOpen(false);
                  }}
                  type="button"
                >
                  Direct message
                </button>
                <button
                  onClick={() => {
                    setCreateMode("GROUP");
                    setIsCreateMenuOpen(false);
                  }}
                  type="button"
                >
                  Project group
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <nav className="chat-conversation-list" aria-label="Conversations">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <Link
                className={selectedConversation?.id === conversation.id ? "chat-conversation-link active" : "chat-conversation-link"}
                href={`/chats?conversationId=${conversation.id}`}
                key={conversation.id}
              >
                <span className={conversation.type === "GROUP" ? "chat-avatar group" : "chat-avatar"}>{getInitials(conversation.title) || "C"}</span>
                <span className="chat-conversation-copy">
                  <span className="chat-conversation-title-row">
                    <strong>{conversation.title}</strong>
                    <small>{formatConversationTime(conversation.lastMessageAt)}</small>
                  </span>
                  {conversation.project ? <em>{conversation.project.name}</em> : null}
                  <small>{getConversationPreview(conversation)}</small>
                </span>
                {conversation.unreadCount > 0 ? <i className="chat-unread-count">{conversation.unreadCount}</i> : null}
              </Link>
            ))
          ) : (
            <div className="chat-empty-state">
              <strong>No chats yet</strong>
              <span>Start a direct message or create a project group.</span>
            </div>
          )}
        </nav>
      </aside>

      <main className="chat-thread-panel">
        {selectedConversation ? (
          <>
            <header className="chat-thread-header">
              <Link className="chat-back-link" href="/chats">
                Messages
              </Link>
              <div>
                <span className={selectedConversation.type === "GROUP" ? "chat-avatar group" : "chat-avatar"}>
                  {getInitials(selectedConversation.title) || "C"}
                </span>
                <h2>{selectedConversation.title}</h2>
                <small>{selectedConversation.project ? `${selectedConversation.project.name} - ${selectedConversation.project.client}` : selectedConversation.participants.map((participant) => participant.name).join(", ")}</small>
              </div>
            </header>

            <div className="chat-message-list" aria-live="polite">
              {selectedConversation.messages.length > 0 ? (
                selectedConversation.messages.map((message) => {
                  const isOwnMessage = message.sender.id === currentUserId;

                  return (
                    <article className={isOwnMessage ? "chat-message own" : "chat-message"} key={message.id}>
                      {!isOwnMessage ? <strong>{message.sender.name}</strong> : null}
                      <p>{message.body}</p>
                      <small>{formatMessageTime(message.createdAt)}</small>
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
                className="chat-composer"
                onSubmit={(event) => {
                  const form = event.currentTarget;
                  window.setTimeout(() => form.reset(), 0);
                }}
                ref={messageFormRef}
              >
                <textarea aria-label="Message" name="body" required rows={1} />
                <button aria-label="Send message" className="chat-send-button" type="submit">
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                    <path d="M12 19V5" />
                    <path d="m5 12 7-7 7 7" />
                  </svg>
                </button>
              </form>
            ) : null}
          </>
        ) : (
          <div className="chat-start-card">
            <p className="eyebrow">Messages</p>
            <h2>Choose a conversation</h2>
            <p className="muted">Direct messages and project group chats live here for decisions, blockers, and shop updates.</p>
          </div>
        )}
      </main>

      {createMode ? (
        <div className="modal-overlay" role="presentation">
          <div aria-labelledby="chat-create-title" aria-modal="true" className="modal-panel chat-create-modal" role="dialog">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">New message</p>
                <h2 id="chat-create-title">{createMode === "DIRECT" ? "Direct message" : "Project group chat"}</h2>
              </div>
              <button aria-label="Close new chat" className="icon-button" onClick={() => setCreateMode(null)} type="button">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>

            {createMode === "DIRECT" ? (
              <form action={createDirectChatAction} className="form">
                <div className="field">
                  <label htmlFor="direct-participant">To</label>
                  <select id="direct-participant" name="participantId" required>
                    <option value="">Choose teammate</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
                  <button className="button secondary" onClick={() => setCreateMode(null)} type="button">
                    Cancel
                  </button>
                  <button className="button" type="submit">
                    Start chat
                  </button>
                </div>
              </form>
            ) : (
              <form action={createGroupChatAction} className="form">
                <div className="field">
                  <label htmlFor="project-chat-project">Project</label>
                  <select id="project-chat-project" name="projectId" defaultValue="">
                    <option value="">No project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.client}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="group-title">Group name</label>
                  <input id="group-title" name="title" placeholder="Optional when a project is selected" />
                </div>
                <div className="field">
                  <label>Members</label>
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
                </div>
                <div className="modal-actions">
                  <button className="button secondary" onClick={() => setCreateMode(null)} type="button">
                    Cancel
                  </button>
                  <button className="button" type="submit">
                    Create group
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
