import Link from "next/link";
import type { CurrentUser } from "@/lib/auth";
import { getNavigationItems } from "@/lib/rbac";

export function AppShell({ children, user }: { children: React.ReactNode; user: CurrentUser | null }) {
  const navItems = getNavigationItems(user);

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
