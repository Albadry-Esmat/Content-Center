import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, projects, users, workspaceMemberships, workspaces, type WorkspaceRole } from "../drizzle/schema";
import { nanoid } from "nanoid";
import { ENV } from './_core/env';
import { hasWorkspaceRole } from "./workspace-access";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new Error("Cloud workspace storage is unavailable. You can continue in local mode and retry later.");
  return db;
}

function makeWorkspaceName(name: string | null) {
  const ownerName = name?.trim() || "My";
  return `${ownerName.slice(0, 80)} workspace`;
}

export async function ensurePersonalWorkspace(user: { id: number; name: string | null }) {
  const db = await requireDatabase();
  const existing = await db.select({ id: workspaces.id, name: workspaces.name, role: workspaceMemberships.role })
    .from(workspaceMemberships)
    .innerJoin(workspaces, eq(workspaceMemberships.workspaceId, workspaces.id))
    .where(eq(workspaceMemberships.userId, user.id))
    .orderBy(desc(workspaceMemberships.createdAt))
    .limit(1);
  if (existing[0]) return existing[0];

  const workspaceId = `ws_${nanoid(18)}`;
  await db.insert(workspaces).values({ id: workspaceId, name: makeWorkspaceName(user.name), createdByUserId: user.id });
  await db.insert(workspaceMemberships).values({ workspaceId, userId: user.id, role: "owner" });
  return { id: workspaceId, name: makeWorkspaceName(user.name), role: "owner" as const };
}

export async function listWorkspacesForUser(userId: number) {
  const db = await requireDatabase();
  return db.select({ id: workspaces.id, name: workspaces.name, role: workspaceMemberships.role, updatedAt: workspaces.updatedAt })
    .from(workspaceMemberships)
    .innerJoin(workspaces, eq(workspaceMemberships.workspaceId, workspaces.id))
    .where(eq(workspaceMemberships.userId, userId))
    .orderBy(desc(workspaces.updatedAt));
}

export async function requireWorkspaceRole(userId: number, workspaceId: string, allowedRoles: readonly WorkspaceRole[]) {
  const db = await requireDatabase();
  const membership = await db.select({ role: workspaceMemberships.role })
    .from(workspaceMemberships)
    .where(and(eq(workspaceMemberships.userId, userId), eq(workspaceMemberships.workspaceId, workspaceId)))
    .limit(1);
  const role = membership[0]?.role;
  if (!role || !hasWorkspaceRole(role, allowedRoles)) throw new Error("You do not have permission to access this workspace.");
  return role;
}

export async function listProjectsForWorkspace(userId: number, workspaceId: string) {
  await requireWorkspaceRole(userId, workspaceId, ["owner", "admin", "editor", "reviewer", "viewer"]);
  const db = await requireDatabase();
  return db.select({ id: projects.id, title: projects.title, status: projects.status, createdAt: projects.createdAt, updatedAt: projects.updatedAt })
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.status, "active")))
    .orderBy(desc(projects.updatedAt))
    .limit(100);
}

export async function createProjectForWorkspace(userId: number, workspaceId: string, title: string) {
  await requireWorkspaceRole(userId, workspaceId, ["owner", "admin", "editor"]);
  const db = await requireDatabase();
  const id = `prj_${nanoid(18)}`;
  await db.insert(projects).values({ id, workspaceId, createdByUserId: userId, title: title.trim() });
  const created = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return created[0];
}

export async function getProjectForWorkspace(userId: number, workspaceId: string, projectId: string) {
  await requireWorkspaceRole(userId, workspaceId, ["owner", "admin", "editor", "reviewer", "viewer"]);
  const db = await requireDatabase();
  const found = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId))).limit(1);
  return found[0] ?? null;
}

export async function saveProjectPack(userId: number, workspaceId: string, projectId: string, packData: Record<string, unknown>) {
  await requireWorkspaceRole(userId, workspaceId, ["owner", "admin", "editor"]);
  const db = await requireDatabase();
  const existing = await getProjectForWorkspace(userId, workspaceId, projectId);
  if (!existing) throw new Error("Project not found in this workspace.");
  await db.update(projects).set({ packData }).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)));
}
