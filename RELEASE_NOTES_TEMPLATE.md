# Content Center [version or date]

> Replace every bracketed placeholder before publishing. Remove sections that do not apply, but do not omit privacy, validation, or recovery notes.

## Summary

Describe the creator-facing outcome in one short paragraph. Keep the language aligned with the supported scope: local-first campaign planning, one long-form video, related pre-launch and post-launch shorts, simple CapCut montage guidance, simple DaVinci Resolve coloring guidance, known-provider connections, and multi-platform adaptation.

## What changed

| Area | User-visible change | Scope or issue reference |
|---|---|---|
| Campaign workflow | [Describe the change.] | [Reference] |
| Generation or providers | [Describe the change, including local/remote behavior.] | [Reference] |
| Production guidance | [Describe the simple montage or coloring change.] | [Reference] |
| Platform adaptation | [Describe the preset or export change.] | [Reference] |
| Reliability or accessibility | [Describe the recovery, warning, keyboard, RTL, or responsive change.] | [Reference] |

## Privacy and security

State whether prompts or notes can leave the device, whether provider configuration changed, and whether any security issue is included. Never publish credentials, private prompts, authorization headers, exploit details for an unresolved issue, or personal data. Direct undisclosed vulnerabilities to [SECURITY.md](SECURITY.md).

## Compatibility and recovery

Describe backup, restore, migration, or compatibility impact. If the release causes data loss, unsafe credential handling, or a broken local-first path, pause promotion and follow the rollback guidance in [PUBLIC_RELEASE_CHECKLIST.md](PUBLIC_RELEASE_CHECKLIST.md).

## Validation evidence

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm verify`
- [ ] Public demo smoke check completed from `/generator?demo=1`.
- [ ] Manual review completed for meaningful UI or workflow changes.
- [ ] Release commit is clean and synchronized with the intended remote branch.

Validation notes: [Add the commit, checks, and any non-blocking warnings.]

## Known limitations

- [Describe a real limitation or write “None beyond the documented roadmap.”]

## Upgrade or contributor notes

[Explain configuration changes, provider setup changes, fixture changes, or contributor actions. Link to the relevant documentation.]

## Links

- Release commit: [URL]
- Public demo: [URL]
- Documentation: [URL]
- Security policy: [URL]
