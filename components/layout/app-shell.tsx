import Link from "next/link";
import type { CurrentUser } from "@/lib/auth";
import { getNavigationItems, getUtilityNavigationItems } from "@/lib/rbac";

function UtilityIcon({ icon }: { icon: "calendar" | "chat" | "clock" | "settings" }) {
  if (icon === "calendar") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 8h16" />
        <path d="M5 5h14v15H5z" />
      </svg>
    );
  }

  if (icon === "chat") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M21 12a7.5 7.5 0 0 1-7.5 7.5H7l-4 2 1.5-4.5A7.5 7.5 0 1 1 21 12z" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
      </svg>
    );
  }

  if (icon === "settings") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
        <path d="M19 12a7.1 7.1 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7.2 7.2 0 0 0-2.1-1.2L14 3h-4l-.4 2.6a7.2 7.2 0 0 0-2.1 1.2l-2.4-1-2 3.5 2 1.5A7.1 7.1 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1a7.2 7.2 0 0 0 2.1 1.2L10 21h4l.4-2.6a7.2 7.2 0 0 0 2.1-1.2l2.4 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M12 7v5l3 2" />
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}

export function AppShell({ children, user }: { children: React.ReactNode; user: CurrentUser | null }) {
  const navItems = getNavigationItems(user);
  const utilityNavItems = getUtilityNavigationItems(user);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand-lockup" href="/dashboard" aria-label="AZ Custom Cabinetry dashboard">
          <span className="brand-mark">AZ</span>
          <span>
            <span className="brand-name">Custom</span>
            <span className="brand-subtitle">Cabinetry OS</span>
          </span>
        </Link>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        {utilityNavItems.length > 0 ? (
          <nav className="sidebar-utility-nav" aria-label="Utility navigation">
            {utilityNavItems.map((item) => (
              <Link aria-label={item.label} className="utility-nav-link" href={item.href} key={item.href} title={item.label}>
                <UtilityIcon icon={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        ) : null}
        {user ? (
          <div className="sidebar-user">
            <strong>{user.name}</strong>
            <span>{user.role.replace("_", " ")}</span>
          </div>
        ) : null}
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
