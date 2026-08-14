// SaaS boundary: all project reads and writes require an authenticated workspace membership.

import { z } from "zod";
import { createProjectForWorkspace, ensurePersonalWorkspace, getProjectForWorkspace, listProjectsForWorkspace, listWorkspacesForUser, saveProjectPack } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const workspaceIdInput = z.object({ workspaceId: z.string().min(4).max(36) });

export const workspaceRouter = router({
  bootstrap: protectedProcedure.query(async ({ ctx }) => {
    const defaultWorkspace = await ensurePersonalWorkspace(ctx.user);
    const workspaces = await listWorkspacesForUser(ctx.user.id);
    return { defaultWorkspace, workspaces };
  }),
  listProjects: protectedProcedure.input(workspaceIdInput).query(({ ctx, input }) => listProjectsForWorkspace(ctx.user.id, input.workspaceId)),
  createProject: protectedProcedure.input(z.object({ workspaceId: z.string().min(4).max(36), title: z.string().trim().min(3).max(180) }))
    .mutation(({ ctx, input }) => createProjectForWorkspace(ctx.user.id, input.workspaceId, input.title)),
  getProject: protectedProcedure.input(z.object({ workspaceId: z.string().min(4).max(36), projectId: z.string().min(4).max(36) }))
    .query(({ ctx, input }) => getProjectForWorkspace(ctx.user.id, input.workspaceId, input.projectId)),
  savePack: protectedProcedure.input(z.object({ workspaceId: z.string().min(4).max(36), projectId: z.string().min(4).max(36), packData: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ ctx, input }) => {
      await saveProjectPack(ctx.user.id, input.workspaceId, input.projectId, input.packData);
      return { ok: true } as const;
    }),
});
