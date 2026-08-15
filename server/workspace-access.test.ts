import { describe, expect, it } from "vitest";
import { EDITOR_ROLES, MANAGER_ROLES, PROJECT_READ_ROLES, hasWorkspaceRole } from "./workspace-access";

describe("workspace role boundary", () => {
  it("allows editors to save projects but not viewers", () => {
    expect(hasWorkspaceRole("editor", EDITOR_ROLES)).toBe(true);
    expect(hasWorkspaceRole("viewer", EDITOR_ROLES)).toBe(false);
  });

  it("limits workspace administration to owners and admins", () => {
    expect(hasWorkspaceRole("owner", MANAGER_ROLES)).toBe(true);
    expect(hasWorkspaceRole("reviewer", MANAGER_ROLES)).toBe(false);
  });

  it("allows reviewers and viewers to read durable project history without granting mutations", () => {
    expect(hasWorkspaceRole("reviewer", PROJECT_READ_ROLES)).toBe(true);
    expect(hasWorkspaceRole("viewer", PROJECT_READ_ROLES)).toBe(true);
    expect(hasWorkspaceRole("viewer", EDITOR_ROLES)).toBe(false);
  });
});
