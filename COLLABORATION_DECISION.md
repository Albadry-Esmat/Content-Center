# Accounts, cloud sync, and collaboration decision

## Decision

Accounts, cloud sync, and editor collaboration are **deferred**. The current product remains a local-first single-browser workspace.

## Rationale

Collaboration changes the data model from a local artifact to an owned, shared, versioned resource. That requires authentication, authorization, conflict resolution, offline synchronization, audit history, retention, deletion, and a privacy policy. These concerns are not safe to add as UI-only features.

## Entry criteria for implementation

The feature requires an approved backend architecture, data classification, ownership model, sync strategy, and security review. It should not begin until the Next.js runtime and hosted provider decision are stable.

## Required acceptance gates

Local-only mode must remain available. Shared access must be authorized and auditable. Offline edits and conflicts must have a defined resolution strategy. Export and deletion must remain possible without requiring an account migration.
