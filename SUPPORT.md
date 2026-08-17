# Support and troubleshooting

Content Center is a public, local-first creator tool. Before opening a request, try the public demo campaign so the report is reproducible without an account, provider key, private notes, or cloud workspace.

## Start with the public demo

Run the project locally, open the dashboard, choose **Try demo campaign**, or visit `/generator?demo=1`. Confirm whether the behavior also appears with the public fixture at [`fixtures/demo-campaign.json`](fixtures/demo-campaign.json). Include the route, browser, operating system, and the smallest reproducible action sequence in a report.

## Choose the right path

| Situation | Recommended path |
|---|---|
| Reproducible product bug | Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and remove private data from evidence. |
| Local or hosted provider setup | Review [`PROVIDER_SETUP.md`](PROVIDER_SETUP.md), then use the [provider integration template](.github/ISSUE_TEMPLATE/provider_integration.md) if the documented path is insufficient. |
| Platform, CapCut, or DaVinci guidance | Use the [platform update](.github/ISSUE_TEMPLATE/platform_update.md) or [new preset](.github/ISSUE_TEMPLATE/new_preset.md) template. |
| Workflow, accessibility, responsive, or RTL improvement | Use the [UX improvement template](.github/ISSUE_TEMPLATE/ux_improvement.md). |
| Undisclosed vulnerability or exposed credential | Do not open a public issue. Follow [`SECURITY.md`](SECURITY.md) and use the private security-reporting path. |

## Safe evidence

Do not include API keys, authorization headers, cookies, database URLs, private endpoint tokens, personal notes, private prompts, account identifiers, or undisclosed exploit details. Use sanitized screenshots, the public demo fixture, normalized diagnostics, and short logs that do not reveal secrets. Provider reports should identify whether the request was local or remote and should state whether content could leave the device.

## What to include

A useful report names the Content Center commit or version, runtime and browser, operating system, provider mode and model when relevant, selected platform and editing-tool presets, reproduction steps, expected behavior, actual behavior, and whether a local backup is available. For contributors, run `pnpm verify` before reporting a failing change and include the first actionable failure rather than a full private log.

## Project boundaries

Support requests should stay within the supported scope: local-first campaign planning, one long-form video, related pre-launch and post-launch shorts, simple CapCut montage guidance, simple DaVinci Resolve coloring guidance, known-provider connections, and editable multi-platform adaptation. Advanced montage, advanced color grading, rendering, auto-publishing, and mandatory cloud usage are outside the default path.
