import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const workspaces = mysqlTable("workspaces", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const workspaceMemberships = mysqlTable("workspace_memberships", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: varchar("workspaceId", { length: 36 }).notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "editor", "reviewer", "viewer"]).notNull().default("owner"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  workspaceIdx: index("workspace_memberships_workspace_idx").on(table.workspaceId),
  userIdx: index("workspace_memberships_user_idx").on(table.userId),
  memberUnique: uniqueIndex("workspace_memberships_workspace_user_unique").on(table.workspaceId, table.userId),
}));

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspaceId", { length: 36 }).notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["active", "archived"]).notNull().default("active"),
  packData: json("packData").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  workspaceStatusUpdatedIdx: index("projects_workspace_status_updated_idx").on(table.workspaceId, table.status, table.updatedAt),
  workspaceIdx: index("projects_workspace_idx").on(table.workspaceId),
}));

export const projectPackVersions = mysqlTable("project_pack_versions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspaceId", { length: 36 }).notNull(),
  projectId: varchar("projectId", { length: 36 }).notNull(),
  revision: int("revision").notNull(),
  source: mysqlEnum("source", ["manual_save", "restore", "run_completion"]).notNull().default("manual_save"),
  packData: json("packData").$type<Record<string, unknown>>().notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  projectRevisionUnique: uniqueIndex("project_pack_versions_project_revision_unique").on(table.projectId, table.revision),
  workspaceProjectCreatedIdx: index("project_pack_versions_workspace_project_created_idx").on(table.workspaceId, table.projectId, table.createdAt),
}));

export const projectGenerationRuns = mysqlTable("project_generation_runs", {
  id: varchar("id", { length: 80 }).primaryKey(),
  workspaceId: varchar("workspaceId", { length: 36 }).notNull(),
  projectId: varchar("projectId", { length: 36 }).notNull(),
  status: mysqlEnum("status", ["running", "complete", "partial", "cancelled"]).notNull().default("running"),
  tasks: json("tasks").$type<Record<string, unknown>[]>().notNull(),
  packData: json("packData").$type<Record<string, unknown> | null>(),
  startedAt: timestamp("startedAt").notNull(),
  finishedAt: timestamp("finishedAt"),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  workspaceProjectStartedIdx: index("project_generation_runs_workspace_project_started_idx").on(table.workspaceId, table.projectId, table.startedAt),
}));

export type Workspace = typeof workspaces.$inferSelect;
export type WorkspaceMembership = typeof workspaceMemberships.$inferSelect;
export type WorkspaceRole = NonNullable<WorkspaceMembership["role"]>;
export type Project = typeof projects.$inferSelect;
export type ProjectPackVersion = typeof projectPackVersions.$inferSelect;
export type ProjectGenerationRun = typeof projectGenerationRuns.$inferSelect;
