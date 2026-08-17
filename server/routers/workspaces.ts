// SaaS boundary: all project reads and writes require an authenticated workspace membership.

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createProjectForWorkspace, ensurePersonalWorkspace, getProjectForWorkspace, listProjectGenerationRuns, listProjectPackVersions, listProjectsForWorkspace, listWorkspacesForUser, PackRevisionConflictError, restoreProjectPackVersion, saveProjectGenerationRun, saveProjectPack } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const workspaceIdInput = z.object({ workspaceId: z.string().min(4).max(36) });
const projectInput = z.object({ workspaceId: z.string().min(4).max(36), projectId: z.string().min(4).max(36) });

export const workspaceRouter = router({
  bootstrap: protectedProcedure.query(async ({ ctx }) => {
    const defaultWorkspace = await ensurePersonalWorkspace(ctx.user);
    const workspaces = await listWorkspacesForUser(ctx.user.id);
    return { defaultWorkspace, workspaces };
  }),
  listProjects: protectedProcedure.input(workspaceIdInput).query(({ ctx, input }) => listProjectsForWorkspace(ctx.user.id, input.workspaceId)),
  createProject: protectedProcedure.input(z.object({ workspaceId: z.string().min(4).max(36), title: z.string().trim().min(3).max(180) }))
    .mutation(({ ctx, input }) => createProjectForWorkspace(ctx.user.id, input.workspaceId, input.title)),
  getProject: protectedProcedure.input(projectInput)
    .query(({ ctx, input }) => getProjectForWorkspace(ctx.user.id, input.workspaceId, input.projectId)),
  savePack: protectedProcedure.input(projectInput.extend({ packData: z.record(z.string(), z.unknown()), expectedRevision: z.number().int().nonnegative().optional() }))
    .mutation(async ({ ctx, input }) => {
      try { return await saveProjectPack(ctx.user.id, input.workspaceId, input.projectId, input.packData, input.expectedRevision) }
      catch (error) { if (error instanceof PackRevisionConflictError) throw new TRPCError({ code: 'CONFLICT', message: error.message, cause: error }); throw error }
    }),
  listPackVersions: protectedProcedure.input(projectInput)
    .query(({ ctx, input }) => listProjectPackVersions(ctx.user.id, input.workspaceId, input.projectId)),
  restorePackVersion: protectedProcedure.input(projectInput.extend({ versionId: z.string().min(4).max(36), expectedRevision: z.number().int().nonnegative().optional() }))
    .mutation(async ({ ctx, input }) => {
      try { return await restoreProjectPackVersion(ctx.user.id, input.workspaceId, input.projectId, input.versionId, input.expectedRevision) }
      catch (error) { if (error instanceof PackRevisionConflictError) throw new TRPCError({ code: 'CONFLICT', message: error.message, cause: error }); throw error }
    }),
  listGenerationRuns: protectedProcedure.input(projectInput)
    .query(({ ctx, input }) => listProjectGenerationRuns(ctx.user.id, input.workspaceId, input.projectId)),
  saveGenerationRun: protectedProcedure.input(projectInput.extend({
    run: z.object({
      id: z.string().min(4).max(80),
      status: z.enum(["running", "complete", "partial", "cancelled"]),
      tasks: z.array(z.record(z.string(), z.unknown())).max(100),
      packData: z.record(z.string(), z.unknown()).nullable().optional(),
      startedAt: z.number().int().positive(),
      finishedAt: z.number().int().positive().nullable().optional(),
    }),
  })).mutation(async ({ ctx, input }) => {
    await saveProjectGenerationRun(ctx.user.id, input.workspaceId, input.projectId, {
      ...input.run,
      startedAt: new Date(input.run.startedAt),
      finishedAt: input.run.finishedAt ? new Date(input.run.finishedAt) : null,
    });
    return { ok: true } as const;
  }),
});
