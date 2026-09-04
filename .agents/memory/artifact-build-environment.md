---
name: Artifact build environment
description: Environment requirements for building the workspace's Vite artifacts outside managed workflows.
---

The Vite artifact configurations intentionally fail fast unless `PORT` and
`BASE_PATH` are supplied. Managed workflows provide these values; standalone
workspace builds need to provide them explicitly.

**Why:** A plain root build can fail before compiling application code when
those artifact-specific values are absent.

**How to apply:** When validating the full workspace outside a workflow, set
`PORT` and a suitable `BASE_PATH` for the build invocation. Keep production
and preview routing values in artifact/workflow configuration rather than
committing secrets or ad hoc environment files.