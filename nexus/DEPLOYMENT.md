# Nexus production deployment

## Current deployment diagnosis

The configured Netlify site is `nexus-ai-hub-wfrk` (`ca7c5fbb-b630-4dea-b838-20e6b11899fe`). During the last live check, its public routes returned HTTP 404 and Netlify project metadata did not expose a published deploy ID. This means repository changes have not yet been proven to be deployed to that site; a successful GitHub build alone is not evidence of a live deployment.

The repository root `netlify.toml` configures the `nexus` base directory, `npm run build`, the `dist` publish directory, and the `/api/*` function redirect. The workflow makes build and static security checks repeatable and provides a deploy path independent of whether Netlify Git linking is configured.

## One-time GitHub Actions setup

In GitHub, open **Settings → Secrets and variables → Actions** and create:

- `NETLIFY_AUTH_TOKEN`: a Netlify personal access token. Keep it private; do not commit it or paste it into source files. The target site ID is already configured in the workflow.

After adding both secrets, open **Actions → Nexus build, security checks, and production deploy → Run workflow**, select branch `main`, set `deploy_production` to `true`, and run it. The workflow builds and runs static contracts before deploying. It then checks the frontend, health route, provider-status route, and a real Nexus team request using the four collaborators plus synthesis (five model calls). Live calls can consume credits. If the token is absent, it reports that deployment was skipped rather than pretending production was published.

## Post-deploy smoke tests

Check the following routes on the public site:

- `/` — frontend HTML loads.
- `/api/_healthcheck` — JSON includes `{"ok":true,"service":"nexus"}`.
- `/api/status` — returns provider-configuration booleans only (never secrets).
- `POST /api/chat` with a short prompt — verifies a real model response.
- `POST /api/team` with a short prompt — verifies all four collaborators and the synthesis model; check returned `statuses` and `warnings` instead of assuming success from HTTP 200. The CI workflow runs this smoke test automatically after a successful production deploy.

Live model tests can consume provider credits. Start with short prompts and verify model names and response content. A missing API key, disabled AI Gateway, or invalid model must be reported as a failure, not marked as working.

## Scope

This document and workflow do not store provider credentials. The first production deploy can publish the UI and health endpoints without model-provider keys; actual model calls require the Netlify AI Gateway or valid server-side provider keys.
