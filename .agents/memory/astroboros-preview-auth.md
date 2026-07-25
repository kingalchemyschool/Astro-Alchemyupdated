---
name: Preview authentication
description: Clerk behavior on Replit preview hosts for the AstroAlchemy app
---

Clerk authentication can fail to load on a Replit development preview host even when the app itself is healthy. The product should continue rendering its public chart and report experiences, while sign-in and account-only actions remain available on a published host.

**Why:** The Clerk development instance rejects or cannot proxy the preview hostname, so treating this as a fatal app error would hide the public product unnecessarily.

**How to apply:** Keep the Clerk error boundary and timeout fallback when working on the app. Verify the authenticated flow on a published URL rather than interpreting preview CDN/proxy failures as homepage regressions.