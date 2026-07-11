# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This is a workshop starter/template, not a finished product. The stack (GraphQL Yoga + Drizzle + Better-Auth + Supabase) is wired up, but most application logic is intentionally left as `TODO` for the person doing the workshop to implement. Two guides describe the exercises: `guide.twitter.md` and `guide.tiktok.md` — each is a numbered list of steps (queries → dataloaders → auth → mutations → file uploads → likes → pagination → subscriptions → seeding → testing). If asked to "do the next step" or implement a feature from one of these clones, read the relevant guide file first to know the expected scope and ordering.

Because it's a template, some referenced code doesn't exist yet and must be created rather than assumed present — e.g. `src/app/graphql/loaders/data-loader-helper.ts` and `count-loader-helper.ts` import `#/shared/domain/criteria/criteria` (a DDD `Criteria`/`Filters`/`Operator` set of base classes) that has not been built. Don't treat compile errors from these missing modules as bugs to silently paper over; they're expected until that DDD layer is implemented.

## Commands

```bash
npm run dev          # tsx watch src/app — start the dev server (http://localhost:4000/graphql)
npm run build        # tsc -> dist/
npm start             # node dist/index.js (run build first)

npm run db:generate   # regenerate the better-auth schema AND drizzle migrations (run after editing any *.schema.ts)
npm run db:migrate    # apply pending drizzle migrations
npm run db:seed       # tsx scripts/seed-db.ts — resets the DB and creates seed users via better-auth
```

There is no `lint` or `test` npm script yet (eslint/prettier/vitest are installed as dependencies but not wired into `package.json` — adding `test`/`lint` scripts is one of the workshop steps). Run them directly when needed:

```bash
npx eslint . --ext .ts
npx prettier --check .
npx vitest              # only once a vitest config + tests exist (see guide, step 15)
```

In VS Code, prefer `F5` (uses `.vscode/launch.json`) over `npm run dev` for debugging.

### Database schema changes

`db:generate` is a compound command (`auth:generate` + `drizzle:generate`):
1. `better-auth:generate` regenerates `src/contexts/auth/auth.schema.ts` from the better-auth config in `src/contexts/shared/auth.ts` — do not hand-edit fields that better-auth owns (users/sessions/accounts/verifications tables); add custom user fields via `user.additionalFields` in `auth.ts` instead, then regenerate.
2. `drizzle:generate` (via `drizzle.config.ts`) scans `src/contexts/**/*.schema.ts` and produces a new migration under `drizzle/`.

Any new domain table (e.g. tweets, likes, videos) needs its own `*.schema.ts` file inside its context folder — drizzle-kit picks it up automatically by the glob.

## Architecture

### Path aliases
- `@/*` → `src/app/*`
- `#/*` → `src/contexts/*`

### Two-layer structure
- `src/app/` — the GraphQL/HTTP wiring layer: Yoga server setup (`index.ts`), schema assembly (`graphql/schema.ts`, `graphql/type-defs.ts`, `graphql/resolvers.ts`), the `@auth` directive, and the DataLoader plumbing.
- `src/contexts/` — domain code organized by bounded context (`auth/`, `role/`, `user/`, `shared/`). Each context can hold its own `.gql` type defs and (when created) `*.schema.ts` drizzle tables. `shared/` holds cross-context infrastructure: the drizzle client, the supabase client, and the better-auth instance.

`.gql` files are auto-discovered anywhere under `src/**/*.gql` (see `type-defs.ts`, via `@graphql-tools/load-files`) — a new context just needs its `.gql` file dropped in; there's no manual registration list. The same applies to `graphql-scalars`, which is merged into both typeDefs and resolvers automatically.

### Resolvers vs. loaders (Mercurius-style)
Field resolvers for relations are not written by hand in `resolvers.ts`. Instead:
1. Declare a loader function per type/field in `src/app/graphql/loaders.ts`, shaped like `{ TypeName: { fieldName: async (entries) => [...] } }` where `entries` is `{ obj: parent }[]`.
2. `DataLoaders.appendResolvers()` (in `src/app/graphql/shared/data-loaders.ts`) wraps every declared loader into an actual GraphQL resolver that calls `context.loaders[Type][field].load(...)`.
3. `DataLoaders.createContext()` instantiates one `DataLoader` per type/field per request; this is called in the Yoga `context()` function in `src/app/index.ts`.

`resolvers.ts` calls `DataLoaders.appendResolvers({...})` on its base resolver map — always go through that call rather than adding relation resolvers directly, so batching keeps working.

`DataLoaderHelper.load` / `.loadMany` and `CountLoaderHelper.loadCount` are generic helpers meant to back individual loader functions (one-to-one, one-to-many, and count-style loads respectively) — they depend on the not-yet-built `Criteria`/`Filters`/`Operator` DDD primitives under `#/shared/domain/criteria/*`.

### Repositories
Each bounded context that owns a domain table has a repository class (e.g. `src/contexts/user/user.repository.ts`, `src/contexts/tweet/tweet.repository.ts`) that encapsulates drizzle queries. Repositories:
- Are static classes with methods like `all()`, `searchById()`, `searchByIds()`, etc.
- Keep query logic out of resolvers and loaders — a resolver calls `TweetRepository.all()` instead of raw drizzle, a loader calls `UserRepository.searchByIds(ids)` instead of inline `inArray()`.
- Make it easy to refactor queries (change joins, add filters) in one place without hunting through resolvers.

Example:
```ts
// src/contexts/tweet/tweet.repository.ts
export class TweetRepository {
	static async all() { /* select all tweets */ }
	static async searchById(id) { /* select one tweet */ }
}

// src/contexts/user/user.repository.ts
export class UserRepository {
	static async searchByIds(ids) { /* select multiple users */ }
	static async searchById(id) { /* select one user */ }
}
```

Resolvers and loaders import and call these methods: `TweetRepository.all()`, `UserRepository.searchByIds(ids)`, etc.

### Auth
- Better-Auth (`src/contexts/shared/auth.ts`) owns the users/sessions/accounts tables and email+password auth, plus the `admin()` plugin for role management (`ADMIN`/`USER`, see `src/contexts/role/role.gql`).
- The `@auth(requires: [Role!])` directive (`src/app/graphql/directives/auth.gql` + `directives/auth.ts`) is applied via `mapSchema` in `graphql/schema.ts`. Its resolver wrapper is currently a stub (`// TODO`) — enforcing the session/role check there, and exposing the authenticated user through the Yoga request context (rather than re-parsing the session cookie in every resolver) is one of the core workshop exercises.
- Sessions are cookie-based; the GraphiQL/Apollo Sandbox config in `index.ts` sets `includeCookies: true` for that to work in the playground. Apollo Sandbox does not support subscriptions over SSE — switch to plain GraphiQL (comment out the `renderGraphiQL` option) when working on subscriptions.

### Mutations/Subscriptions currently disabled
`src/app/graphql/resolvers/mutations/mutation.gql.disabled` and `.../subscriptions/subscription.gql.disabled` are placeholders excluded from the `**/*.gql` glob by their extension. Rename to `.gql` (and fill in the real type defs + resolvers) when implementing mutations/subscriptions rather than creating new files elsewhere.

### Database queries and logging
`src/contexts/shared/drizzle-client.ts` is the single exported instance of the drizzle ORM client. It's configured with a custom logger that prints queries and parameters to stdout. When running `npm run dev`, all executed SQL queries appear in the dev server console, useful for debugging N+1 queries and verifying DataLoader batching behavior.

### Environment
`src/app/env.ts` loads `.env` via Vite's `loadEnv` and must be imported first (side-effect only) before anything reads `process.env` — both `src/app/index.ts` and `drizzle.config.ts` do this. Required vars: `DATABASE_URL` (Postgres), `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_BUCKET`.

### Style
Formatting is enforced by Prettier: tabs, no semicolons, single quotes, 80-char width (`.prettierrc`). ESLint extends `standard` + `@typescript-eslint/recommended` + `prettier`; `no-explicit-any` is off and unused-vars is a warning only (this codebase uses `any` liberally in generic loader/resolver plumbing).