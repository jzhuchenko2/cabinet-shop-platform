"use client";

import { useEffect, useMemo, useState } from "react";

type NotificationCategory = "Task" | "Project" | "File" | "Blocker";

type DashboardNotification = {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  timestamp: string;
  unread: boolean;
};

const initialNotifications: DashboardNotification[] = [
  {
    id: "task-appliance-panel",
    title: "Task assigned",
    body: "Finalize appliance panel dimensions for Anderson Kitchen.",
    category: "Task",
    timestamp: "8:15 AM",
    unread: true
  },
  {
    id: "project-stage-anderson",
    title: "Project stage changed",
    body: "Anderson Kitchen moved from Sales to Design.",
    category: "Project",
    timestamp: "Yesterday",
    unread: true
  },
  {
    id: "blocked-finish-sample",
    title: "Task blocked",
    body: "Finish sample approval is waiting on the customer.",
    category: "Blocker",
    timestamp: "Yesterday",
    unread: true
  },
  {
    id: "file-upload-shop-drawings",
    title: "Files added",
    body: "Shop drawings were uploaded to Mercado Built-In.",
    category: "File",
    timestamp: "Mon",
    unread: false
  },
  {
    id: "project-qc-ready",
    title: "QC ready",
    body: "Lot 42 Mudroom is ready for quality control review.",
    category: "Project",
    timestamp: "Mon",
    unread: false
  }
];

const notificationStateStorageKey = "cabinet-shop-dashboard-notification-read-state";

function getStoredReadState() {
  try {
    const storedValue = window.localStorage.getItem(notificationStateStorageKey);

    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
      return {};
    }

    return parsedValue as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function DashboardNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [hasLoadedStoredState, setHasLoadedStoredState] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications]
  );

  useEffect(() => {
    const storedReadState = getStoredReadState();

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => {
        const storedUnreadValue = storedReadState[notification.id];

        if (typeof storedUnreadValue !== "boolean") {
          return notification;
        }

        return { ...notification, unread: storedUnreadValue };
      })
    );
    setHasLoadedStoredState(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredState) {
      return;
    }

    const readState = notifications.reduce<Record<string, boolean>>((currentState, notification) => {
      currentState[notification.id] = notification.unread;
      return currentState;
    }, {});

    window.localStorage.setItem(notificationStateStorageKey, JSON.stringify(readState));
  }, [hasLoadedStoredState, notifications]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function markAllRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, unread: false }))
    );
  }

  function toggleRead(notificationId: string) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, unread: !notification.unread }
          : notification
      )
    );
  }

  return (
    <>
      <button
        aria-label={`Open notifications. ${unreadCount} unread.`}
        className="notification-bell"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unreadCount > 0 ? <span className="notification-count">{unreadCount}</span> : null}
      </button>

      {isOpen ? (
        <div className="notification-overlay" role="presentation" onClick={() => setIsOpen(false)}>
          <aside
            aria-label="Dashboard notifications"
            aria-modal="true"
            className="notification-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="notification-panel-header">
              <div>
                <p className="eyebrow">Updates</p>
                <h2>Notifications</h2>
                <p className="muted">{unreadCount} unread items need review.</p>
              </div>
              <button
                aria-label="Close notifications"
                className="icon-button"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <span aria-hidden="true">x</span>
              </button>
            </div>

            <div className="notification-actions">
              <button className="button secondary" onClick={markAllRead} type="button">
                Mark all read
              </button>
            </div>

            <div className="notification-list">
              {notifications.map((notification) => (
                <article
                  className={`notification-item${notification.unread ? " unread" : ""}`}
                  key={notification.id}
                >
                  <div className="notification-item-main">
                    <div className="notification-item-title">
                      <h3>{notification.title}</h3>
                      {notification.unread ? <span className="unread-dot" aria-label="Unread" /> : null}
                    </div>
                    <p>{notification.body}</p>
                    <div className="notification-meta">
                      <span className="status-pill ready">{notification.category}</span>
                      <span>{notification.timestamp}</span>
                    </div>
                  </div>
                  <button
                    className="button secondary notification-read-toggle"
                    onClick={() => toggleRead(notification.id)}
                    type="button"
                  >
                    {notification.unread ? "Mark read" : "Mark unread"}
                  </button>
                </article>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
