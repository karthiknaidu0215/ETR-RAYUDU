---
name: WebGL preview fallback
description: Three.js previews may run in a browser without a usable WebGL context.
---

When an app depends on React Three Fiber, detect WebGL support before mounting the renderer and show an in-app fallback when it is unavailable.

**Why:** The Replit preview browser can fail WebGL context creation before React Three Fiber's fallback prop runs, which otherwise produces the runtime error overlay.

**How to apply:** Keep the full canvas path for capable browsers, but guard renderer creation with a lightweight canvas context check so restricted previews remain readable and error-free.