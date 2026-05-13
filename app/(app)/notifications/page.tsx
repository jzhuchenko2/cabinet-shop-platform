import { PageHeader } from "@/components/ui/page-header";

const notifications = [
  { title: "Task assigned", body: "Finalize appliance panel dimensions", type: "TASK_ASSIGNED" },
  { title: "Project stage changed", body: "Anderson Kitchen moved to Design", type: "PROJECT_STAGE_CHANGED" },
  { title: "Task blocked", body: "Finish sample approval is waiting on customer", type: "TASK_BLOCKED" }
];

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Updates"
        title="Notifications"
        description="Important task assignments, due work, blocked items, uploads, notes, and stage changes."
      />
      <section className="grid">
        {notifications.map((notification) => (
          <article className="card" key={notification.title}>
            <h3>{notification.title}</h3>
            <p>{notification.body}</p>
            <p className="muted">{notification.type}</p>
          </article>
        ))}
      </section>
    </>
  );
}

