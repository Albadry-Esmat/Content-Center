// SaaS boundary: workspace roles are evaluated server-side before every project mutation.

import type { WorkspaceRole } from "../drizzle/schema";

export const EDITOR_ROLES: WorkspaceRole[] = ["owner", "admin", "editor"];
export const MANAGER_ROLES: WorkspaceRole[] = ["owner", "admin"];

export function hasWorkspaceRole(role: WorkspaceRole, allowedRoles: readonly WorkspaceRole[]): boolean {
  return allowedRoles.includes(role);
}
