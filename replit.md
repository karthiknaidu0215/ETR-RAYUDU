# 1 Acre Farm Planner

An interactive 3D editor for planning crop zones, plants, roads, and farm infrastructure across a parcel of land.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/one-acre-land/src/App.jsx` — main planner shell and Three.js scene
- `artifacts/one-acre-land/src/store.js` — Zustand state and land/crop calculations
- `artifacts/one-acre-land/src/components/` — farm scene, controls, statistics, and object editing
- `artifacts/one-acre-land/src/index.css` — planner visual language and responsive layout
- `artifacts/api-server/` — shared API scaffold; this planner currently runs without a backend

## Architecture decisions

- The planner remains a client-side editor because the imported product stores its active layout in Zustand and does not currently require shared persistence.
- The 3D scene uses React Three Fiber and Drei; the UI shell remains usable when a browser cannot create a WebGL context.
- The app is the root web artifact so the planner opens directly from the project preview.

## Product

- Configure acreage and boundary strips.
- Define crop zones and planting targets.
- Auto-arrange or manually place plants.
- Add and edit gates, roads, buildings, ponds, wells, tanks, sheds, and custom obstacles.
- Inspect land usage, free area, and crop/infrastructure statistics.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
