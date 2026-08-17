# Security Policy

Content Center is being prepared as a public GitHub project. Security reports are welcome, especially reports involving exposed credentials, unsafe provider handling, unauthorized cloud access, unsafe rendering, or loss of user campaign data.

## Supported security expectations

The project must preserve these boundaries:

- Provider credentials must not be committed to the repository.
- Secrets must not be placed in public frontend environment variables.
- Browser-local mode must not require a Content Center account.
- Remote-provider mode must clearly disclose that prompts and notes may leave the device.
- Authorization headers, tokens, and raw private provider responses must not be written to logs or exports.
- AI and imported backup content must be parsed and rendered safely.
- Cloud workspace access must enforce authentication, workspace membership, and project authorization.
- Local persistence failures must not silently discard the active campaign.
- Optional analytics must remain disabled unless both an explicit HTTP(S) endpoint and site identifier are configured.

## Reporting a vulnerability

Please do not open a public issue for an undisclosed vulnerability. Use the repository’s GitHub private vulnerability-reporting flow when it is enabled. If private reporting is not yet available, contact the repository owner through the security contact configured in the GitHub repository settings and include the repository name, affected version or commit, impact, reproduction steps, and a suggested mitigation if known.

Remove personal notes, API keys, authorization headers, database URLs, cookies, and other sensitive data from reports. If a secret may have been exposed, rotate it immediately and report the affected provider or environment without including the secret value.

## Scope

In scope are the active Vite/Express runtime, provider adapters, campaign persistence and export, workspace authorization, dependency configuration, public CI workflows, and documented setup paths. The retained migration scaffolding is not a supported runtime, but unsafe behavior in it should still be reported if it can be reached from the supported build or creates a realistic contributor or deployment risk. Dependency updates are surfaced through the repository’s weekly Dependabot configuration and must still pass the normal verification gate before merging.

## Dependency and secret hygiene

Run the repository checks before submitting changes:

```bash
pnpm security
pnpm check
pnpm test
pnpm build
```

Never bypass secret scanning by renaming a credential or placing it in a fixture. Use deterministic placeholders and test doubles instead. Provider contract fixtures must not contain real account data or private prompts. The default build must not emit requests to placeholder analytics URLs; optional analytics is initialized only when both configuration values are present and the endpoint uses HTTP(S).

## Response process

The maintainers should acknowledge a report, reproduce it in a safe environment, assess severity and affected versions, prepare a fix or mitigation, and publish an advisory when appropriate. Public release notes should describe the impact and upgrade guidance without exposing exploit details before users have a reasonable opportunity to update.
