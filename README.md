### SkipIt: A Transactionally-Coupled Ludic

An open-source, Next.js 15 application that conjoins financial telemetry with a gamified health heuristic. Orders synchronized from third‑party delivery merchants (e.g., DoorDash and UberEats via KnotAPI) are transmuted into in‑game debuffs, orchestrating a systemic feedback loop between real‑world consumption and diegetic character vitality.

— Engineered with Next.js App Router, Prisma ORM (PostgreSQL), and progressive web app affordances. 

---

### Demonstration (Embedded)

<a href="https://www.youtube.com/watch?v=Xz8ibsBlznA">
  <img src="https://img.youtube.com/vi/Xz8ibsBlznA/maxresdefault.jpg" width="520" height="320" alt="Watch the video">
</a>




## Gallery

| Weakened | Neutral | Powered |
|----------|---------|---------|
| ![Weakened state](public/imgs/01-weakened.png) | ![Neutral state](public/imgs/01-neutral.png) | ![Powered state](public/imgs/01-powered.png) |




### Table of Contents

- Architecture Overview
- Data Model (ERD)
- Environment and Configuration
- Local Development Workflow
- Database Migrations and Seeding
- API Reference
- PWA Considerations
- Contributing Guide
- Security Posture
- License

---

### Architecture Overview

This application operationalizes a reactive pipeline whereby exogenous transactional ingress, mediated by KnotAPI, is normalized into a domain‑specific ontology and persisted through Prisma into PostgreSQL. The UI is rendered via Next.js App Router with serverless route handlers, while a PWA service worker confers offline semantics and caching determinism.

<img width="924" height="854" alt="image" src="https://github.com/user-attachments/assets/489a07d4-c8ec-4d24-8857-42fd478c3277" />


- UI: App Router components in `app/` compose the ludic state machine into a consumable interface.
- API: Route handlers in `app/api/**` provide JSON endpoints for synchronization, queries, and state mutation.
- Persistence: Prisma schema codifies relational invariants and referential integrity.
- Integration: KnotAPI ingress hydrates `Order`, `Product`, `PriceAdjustment`, and `PaymentMethod` aggregates.

---

### Data Model (ERD)

<img width="3396" height="2210" alt="image" src="https://github.com/user-attachments/assets/99389f35-145e-4a29-9c47-4c04a4b610d9" />


Key entities are defined in `prisma/schema.prisma`, including `Order`, `Product`, `Restaurant`, `User`, `CharacterState`, `Team`, `Quest`, and `GameMessage`, each with strongly typed fields and cardinalities.

---

### Environment and Configuration

The runtime expects a Postgres endpoint and KnotAPI credentials. Non‑public secrets MUST NOT be prefixed with `NEXT_PUBLIC_`.

Required environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `KNOT_CLIENT_ID` — KnotAPI credential
- `KNOT_SECRET` — KnotAPI credential
- `NEXT_PUBLIC_KNOT_CLIENT_ID` — optional client‑side echo for UI elements

PWA is enabled via `next-pwa` with `register` and `skipWaiting`. The service worker is emitted to `public/`.

---

### Local Development Workflow

Prerequisites:

- Node.js ≥ 18.18
- pnpm, yarn, npm, or bun
- PostgreSQL instance

Install and bootstrap:

```bash
pnpm install
pnpm prisma generate
```

Run the development server:

```bash
pnpm dev
```

Open http://localhost:3000 and iterate. Primary composition root is `app/page.tsx`; global styles in `app/globals.css`.

---

### Database Migrations and Seeding

Apply migrations and generate client:

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

Seed game scaffolding (characters, team, quest, messages, transactions):

```bash
node seed-game.js
```

Ingest historical delivery orders (DoorDash JSON expected at `./Development_DoorDash.json`):

```bash
# Note: seed.js uses ESM-style imports. If your Node runtime is CJS, either run Node in ESM mode or adapt the file.
node --experimental-modules seed.js
```

---

### API Reference

All endpoints are under the App Router namespace `app/api/**`.

- POST `/api` — Synchronize transactions from KnotAPI into the local domain.
  - body: `{ userId: string, merchantId?: number }`
  - side‑effects: persists Orders/Products/Adjustments/Payments; mutates `CharacterState`, `TeamMember`, and `Team` power; emits `GameMessage`.

- POST `/api/knot/session` — Materialize a KnotAPI session for a user/merchant tuple.
  - body: `{ merchantId: number, userId: string, timestamp?: number, requestId?: string }`

- GET `/api/transactions` — Enumerate recent orders (optionally user‑scoped).
  - query: `userId?: string, limit?: number`
  - returns normalized transaction façade including inferred merchant taxonomy and product lines.

- POST `/api/transactions` — Append a synthetic transaction and propagate game consequences.
  - body: `{ userId: string, restaurant: string, amount: number }`

- GET/PUT/POST `/api/quest` — Retrieve, mutate, or instantiate quests, optionally binding teams.
  - GET query: `questId?: string, teamId?: string`
  - PUT query: `questId: string`
  - POST body: `{ name?: string, endDate: string | number, teamId?: string }`

- GET/PUT/POST `/api/team` — Fetch, update, or create teams.
  - GET query: `teamId: string`
  - PUT query: `teamId: string`; body: `{ power?: number, memberUpdates?: { userId: string, status: string }[], questUpdates?: any }`
  - POST body: `{ name: string, userIds?: string[], questEndDate?: string | number }`

- GET/PUT/POST `/api/character` — Manage character state or create a character + state atomically.
  - GET/PUT query: `userId: string`
  - POST body: `{ name: string, avatar?: string, health?: number, status?: 'powered'|'neutral'|'weakened', streak?: number }`

- GET/POST/DELETE `/api/messages` — Retrieve, create, or purge user messages.
  - GET query: `userId: string, limit?: number`
  - POST body: `{ userId: string, message: string, type?: 'success'|'warning'|'info' }`

- POST `/api/test-sync` — Deterministic UberEats fixture import for diagnostics.
  - body: `{ userId?: string }`

---

### PWA Considerations

- Service worker emitted via `next-pwa` with `register` and `skipWaiting` enabled for deterministic updates.
- Manifest at `public/site.webmanifest`; application icons in `public/` (e.g., `android-chrome-512x512.png`).
- Prefer idempotent APIs and cache versioning semantics to avoid stale UI.

---

### Contributing Guide

We welcome contributory interventions of a sophisticated nature:

1. Fork and create a feature branch with a descriptive, imperative mood.
2. Maintain referential transparency and type‑soundness; avoid leaky abstractions.
3. Provide unitary edits with comprehensive commit messages and rationale.
4. Add or update tests and documentation commensurate with the surface area.
5. Open a pull request; expect code review with an emphasis on semantics and invariants.

---

### Security Posture

- Do not exfiltrate `KNOT_SECRET` or `KNOT_CLIENT_ID` to the client. Only variables prefixed with `NEXT_PUBLIC_` are exposed.
- Rotate credentials and prefer least‑privilege principles across environments.
- Treat imported third‑party data as untrusted; validate and sanitize rigorously.

---

### License

This repository is intended for open‑source dissemination. If a `LICENSE` file is absent, we recommend adopting MIT to maximize permissibility while preserving attribution. Contributors agree to dual licensing under the chosen regime upon merge.

---

### Appendix: Quickstart

```bash
# Install
pnpm install

# Configure env (.env)
export DATABASE_URL=postgres://user:pass@localhost:5432/db
export KNOT_CLIENT_ID=...
export KNOT_SECRET=...
export NEXT_PUBLIC_KNOT_CLIENT_ID=...

# DB
pnpm prisma migrate dev && pnpm prisma generate

# Seed
node seed-game.js

# Dev
pnpm dev
```

