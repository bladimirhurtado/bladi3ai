# Google Workbench: Gmail first, Drive second

## Objective
Provide an independent, user-authorized route to Google data because the native ChatGPT Gmail and Google Drive connectors are currently reported as disabled by administrator. This project does not change or bypass that administrator policy.

## Phase 1 — Gmail MVP
Implementation: `tools/google-workbench/gmail-client/`

Included:
- Local Node.js server with no third-party npm dependencies.
- Google OAuth authorization-code flow with one-time, expiring state.
- Gmail API message listing/search, plain-text reading, and explicit-confirmation sending.
- Read-only and send scopes only; no delete/modify scope.
- In-memory tokens, local loopback bind, basic security headers, bounded request bodies, and unit tests.

Not yet established:
- The user's Google Cloud OAuth client configuration.
- Whether Gmail API is enabled and the account is allowed to authorize these scopes.
- Whether the app can be used in production without additional Google OAuth verification.
- A real end-to-end account test.
- A supported, deployed MCP/tool adapter that would let ChatGPT call the app directly.

## Phase 2 — Google Drive MVP (implemented in code)
Implementation: `tools/google-workbench/drive-client/README.md`

Included: separate local OAuth session, read-only Drive API scope, file listing/search by name, metadata, Google Workspace text export, bounded text previews, and rejection of unsupported binary previews. No file creation, update, or deletion is exposed.

Remaining: complete OAuth configuration, test against an authorized real account, verify export behavior by file type, implement pagination, and assess Google verification requirements. Gmail and Drive sessions run as separate local processes/ports.

## Architecture (current design)
1. Browser UI at loopback.
2. Local Node.js server handles OAuth callback and session tokens in memory.
3. Server calls Google OAuth and Gmail API over HTTPS.
4. Google account grants only the listed scopes.
5. No token or message persistence is implemented.

The local MVP is not a remote service and does not itself grant ChatGPT access. Do not expose it to the internet as-is. A direct assistant integration would need an authorized deployment/MCP or equivalent interface, secure secret storage, authentication, origin/network controls, and real integration tests.

## Skill chain
- `reverse-engineering`: investigate provider/API behavior with evidence.
- `anatomy`: visualize the system without presenting guesses as facts.
- `integracion-sistemas`: OAuth and API contracts.
- `ingenieria-software`: implementation.
- `gestion-errores-resiliencia`: timeouts, expired sessions, provider errors.
- `control-calidad-qa`: reproducible tests and accurate reporting.
- `reverse-engineering-anatomy`: combined workflow and evidence labels.

## Verification checklist
- [ ] Node syntax check.
- [ ] Unit tests for MIME decoding and scope constraints.
- [ ] OAuth config and redirect URI verified by the user in Google Cloud.
- [ ] Consent flow completed with the actual account.
- [ ] Read/list/search smoke test against the real account.
- [ ] Sending tested only after explicit confirmation to a user-approved test recipient.
- [ ] Deployment/security review before exposing any endpoint.
