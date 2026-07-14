import type { UserRole } from "@prisma/client";
import type { CurrentUser } from "@/lib/auth";

export type AppPermission =
  | "view_full_dashboard"
  | "view_all_projects"
  | "view_calendar"
  | "view_chats"
  | "view_clients"
  | "view_sales"
  | "view_design"
  | "view_engineering"
  | "view_shop_floor"
  | "manage_projects"
  | "manage_tasks"
  | "view_time_logs"
  | "view_time_cards"
  | "manage_time_clock"
  | "manage_project_files"
  | "view_settings"
  | "update_own_tasks"
  | "view_department_tasks";

export const fullAccessRoles: UserRole[] = ["OWNER_ADMIN", "MANAGER"];
export const departmentLeadRoles: UserRole[] = ["SHOP_LEAD"];
export const employeeRoles: UserRole[] = ["DEPARTMENT_USER", "INSTALLER"];

const rolePermissions: Record<UserRole, AppPermission[]> = {
  OWNER_ADMIN: [
    "view_full_dashboard",
    "view_all_projects",
    "view_calendar",
    "view_chats",
    "view_clients",
    "view_sales",
    "view_design",
    "view_engineering",
    "view_shop_floor",
    "manage_projects",
    "manage_tasks",
    "view_time_logs",
    "view_time_cards",
    "manage_time_clock",
    "manage_project_files",
    "view_settings",
    "update_own_tasks",
    "view_department_tasks"
  ],
  MANAGER: [
    "view_full_dashboard",
    "view_all_projects",
    "view_calendar",
    "view_chats",
    "view_clients",
    "view_sales",
    "view_design",
    "view_engineering",
    "view_shop_floor",
    "manage_projects",
    "manage_tasks",
    "view_time_logs",
    "view_time_cards",
    "manage_time_clock",
    "manage_project_files",
    "view_settings",
    "update_own_tasks",
    "view_department_tasks"
  ],
  SHOP_LEAD: ["view_calendar", "view_chats", "view_shop_floor", "manage_tasks", "view_time_cards", "update_own_tasks", "view_department_tasks"],
  SALES: ["view_calendar", "view_chats", "view_sales", "view_time_cards", "update_own_tasks"],
  DESIGNER: ["view_calendar", "view_chats", "view_design", "view_time_cards", "update_own_tasks"],
  PURCHASER: ["view_calendar", "view_chats", "view_engineering", "view_time_cards", "update_own_tasks"],
  DEPARTMENT_USER: ["view_calendar", "view_chats", "view_time_cards", "update_own_tasks"],
  INSTALLER: ["view_calendar", "view_chats", "view_time_cards", "update_own_tasks"]
};

export function hasPermission(user: CurrentUser | null, permission: AppPermission) {
  if (!user) {
    return false;
  }

  return rolePermissions[user.role]?.includes(permission) ?? false;
}

export function hasAnyPermission(user: CurrentUser | null, permissions: AppPermission[]) {
  return permissions.some((permission) => hasPermission(user, permission));
}

export function isFullAccess(user: CurrentUser | null) {
  return Boolean(user && fullAccessRoles.includes(user.role));
}

export function isDepartmentLead(user: CurrentUser | null) {
  return Boolean(user && departmentLeadRoles.includes(user.role));
}

export function isEmployeeContributor(user: CurrentUser | null) {
  return Boolean(user && !isFullAccess(user) && !isDepartmentLead(user));
}

export function getHomePath(user: CurrentUser | null) {
  return user ? "/dashboard" : "/sign-in";
}

export function getNavigationItems(user: CurrentUser | null) {
  const items = [{ href: "/dashboard", label: "Dashboard", permissions: ["update_own_tasks"] as AppPermission[] }];

  if (hasAnyPermission(user, ["view_all_projects", "view_department_tasks"])) {
    items.push({ href: "/projects", label: "Projects", permissions: ["view_all_projects", "view_department_tasks"] });
  }

  if (hasPermission(user, "view_shop_floor")) {
    items.push({ href: "/shop-floor", label: "Shop Floor", permissions: ["view_shop_floor"] });
  }

  if (hasPermission(user, "view_sales")) {
    items.push({ href: "/sales", label: "Sales", permissions: ["view_sales"] });
  }

  if (hasPermission(user, "view_design")) {
    items.push({ href: "/design", label: "Design", permissions: ["view_design"] });
  }

  if (hasPermission(user, "view_engineering")) {
    items.push({ href: "/engineering", label: "Engineering", permissions: ["view_engineering"] });
  }

  return items.map(({ href, label }) => ({ href, label }));
}

export function getUtilityNavigationItems(user: CurrentUser | null) {
  const items: { href: string; label: string; icon: "calendar" | "chat" | "clock" | "settings" }[] = [];

  if (hasPermission(user, "view_chats")) {
    items.push({ href: "/chats", label: "Chats", icon: "chat" });
  }

  if (hasPermission(user, "view_calendar")) {
    items.push({ href: "/calendar", label: "Calendar", icon: "calendar" });
  }

  if (hasPermission(user, "view_time_cards")) {
    items.push({ href: "/time-cards", label: "Time Cards", icon: "clock" });
  }

  if (hasPermission(user, "view_settings")) {
    items.push({ href: "/settings", label: "Settings", icon: "settings" });
  }

  return items;
}
