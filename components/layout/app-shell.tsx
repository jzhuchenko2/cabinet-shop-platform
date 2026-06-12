import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/shop-floor", label: "Shop Floor" },
  { href: "/sales", label: "Sales" },
  { href: "/design", label: "Design" },
  { href: "/engineering", label: "Engineering" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
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
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
