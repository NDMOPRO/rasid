# CLAUDE.md — Rasid National Platform

## Project Overview

**Rasid (راصد)** is a national privacy compliance monitoring platform built for Saudi Arabia's NDMO (National Data Management Office). It monitors websites for compliance with Article 12 of the Saudi Personal Data Protection System (PDPL), scans for privacy policy pages, classifies PII data, detects data leaks, and provides AI-assisted analysis through "Smart Rasid."

The platform is a full-stack TypeScript monorepo with a React SPA frontend, Express + tRPC backend, and MySQL database via Drizzle ORM.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript 5.9 (strict mode) |
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, shadcn/ui (New York style) |
| **Routing (client)** | wouter (lightweight React router) |
| **State/Data** | TanStack React Query + tRPC React |
| **Backend** | Express 4, tRPC 11 |
| **Database** | MySQL (via mysql2), Drizzle ORM 0.44 |
| **Auth** | JWT (jose) + cookie-based sessions, platform login + OAuth |
| **AI/LLM** | OpenAI-compatible API (via server/_core/llm.ts) |
| **Build** | Vite (client), esbuild (server) |
| **Package Manager** | pnpm 10.4 |
| **Deployment** | Railway (Docker), Node 20 |
| **Testing** | Vitest |
| **Formatting** | Prettier |

## Repository Structure

```
rasid/
├── client/                    # React SPA frontend
│   ├── public/                # Static assets, manifest.json
│   └── src/
│       ├── App.tsx            # Root component with all routes (wouter)
│       ├── main.tsx           # Entry point, tRPC + QueryClient setup
│       ├── index.css          # Global styles (Tailwind)
│       ├── const.ts           # Client constants
│       ├── _core/             # Core client hooks
│       ├── components/        # Reusable components
│       │   ├── ui/            # shadcn/ui primitives (button, dialog, etc.)
│       │   ├── charts/        # Chart components
│       │   ├── rasid-features/# Rasid-specific feature components
│       │   ├── DashboardLayout.tsx  # Main app layout with sidebar
│       │   └── ...            # Feature components (70+ files)
│       ├── contexts/          # React contexts
│       │   ├── ThemeContext.tsx
│       │   ├── FilterContext.tsx
│       │   └── PlatformSettingsContext.tsx
│       ├── hooks/             # Custom hooks (auth, websocket, PWA, etc.)
│       ├── lib/               # Utilities, tRPC client, PDF/Excel export
│       └── pages/             # Page components (120+ pages)
│           └── admin/         # Admin-specific pages
├── server/                    # Express + tRPC backend
│   ├── _core/                 # Core server infrastructure
│   │   ├── index.ts           # Express server entry point
│   │   ├── trpc.ts            # tRPC router, procedures, middleware
│   │   ├── context.ts         # tRPC context (auth resolution)
│   │   ├── env.ts             # Environment variables
│   │   ├── llm.ts             # LLM integration
│   │   ├── rag.ts             # RAG (retrieval-augmented generation)
│   │   ├── sdk.ts             # Platform SDK
│   │   ├── vite.ts            # Vite dev server integration
│   │   └── ...                # Cache, logging, metrics, etc.
│   ├── routers.ts             # Main tRPC appRouter (very large file)
│   ├── adminRouter.ts         # Admin management routes
│   ├── cmsRouter.ts           # CMS routes
│   ├── controlPanelRouter.ts  # Control panel routes
│   ├── settingsRouter.ts      # Settings routes
│   ├── operationsRouter.ts    # Operational routes
│   ├── db.ts                  # Database queries (large, ~300KB)
│   ├── rasidAI.ts             # Rasid AI chat engine (~150KB)
│   ├── deepScanner.ts         # Deep website scanning engine
│   ├── scanEngine.ts          # Standard scan engine
│   ├── scanWorker.ts          # Scan worker processes
│   ├── aiAssistant.ts         # AI assistant logic
│   ├── aiTools.ts             # AI tool definitions
│   ├── rasidEnhancements/     # AI enhancement modules
│   │   ├── ragEngine.ts
│   │   ├── learningEngine.ts
│   │   ├── guardrails.ts
│   │   ├── circuitBreaker.ts
│   │   ├── responseCache.ts
│   │   └── ...
│   ├── seedData.ts            # Database seeding
│   ├── storage.ts             # S3 file storage
│   ├── email.ts               # Email service (nodemailer)
│   ├── websocket.ts           # WebSocket notifications
│   └── *.test.ts              # Server tests
├── shared/                    # Shared code between client & server
│   ├── compliance.ts          # PDPL compliance status definitions
│   ├── const.ts               # Shared constants (cookie name, errors)
│   ├── types.ts               # Type re-exports from schema
│   └── _core/
│       └── errors.ts          # Error types
├── drizzle/                   # Database schema & migrations
│   ├── schema.ts              # Drizzle ORM schema (~2900 lines, ~100 tables)
│   ├── relations.ts           # Table relations
│   ├── 0000_*.sql             # Initial migration
│   ├── 0001_*.sql             # Production migration
│   └── meta/                  # Drizzle migration metadata
├── scripts/
│   ├── startup.sh             # Production startup (migrations → seed → server)
│   ├── deploy.sh              # Deployment script
│   ├── run_migration.mjs      # Migration runner
│   └── setup-privacy-screenshots.sh
├── data/                      # Static data files
│   ├── final_v3_database.json # Main reference database
│   └── clean_evidence_mapping.json
├── patches/                   # pnpm patches
│   └── wouter@3.7.1.patch
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── drizzle.config.ts
├── Dockerfile                 # Multi-stage Docker build
├── railway.toml               # Railway deployment config
└── components.json            # shadcn/ui configuration
```

## Commands

```bash
# Development
pnpm dev                # Start dev server (tsx watch server/_core/index.ts)

# Build
pnpm build              # Build client (vite) + server (esbuild)

# Production
pnpm start              # Start production server (node dist/index.js)

# Type checking
pnpm check              # TypeScript check (tsc --noEmit)

# Testing
pnpm test               # Run tests (vitest run)

# Formatting
pnpm format             # Format all files with Prettier

# Database
pnpm db:push            # Generate + run Drizzle migrations
```

## Architecture

### Client-Server Communication

The app uses **tRPC** for type-safe client-server communication:
- Client creates a tRPC client at `client/src/lib/trpc.ts` pointing to `/api/trpc`
- Server exposes the `appRouter` from `server/routers.ts` via Express middleware
- SuperJSON is used as the transformer for serialization
- React Query handles caching and state management on the client

### Authentication

Two authentication paths exist:
1. **Platform Login** — JWT stored in `platform_session` cookie, verified via jose
2. **OAuth** — External OAuth provider, session stored in `app_session_id` cookie

Auth context is resolved in `server/_core/context.ts`. The tRPC middleware provides four procedure levels:
- `publicProcedure` — No auth required
- `protectedProcedure` — Any authenticated user
- `adminProcedure` — Admin/director/manager roles
- `rootAdminProcedure` — Root admin users only (specific user IDs)

### Routing (Client)

Client routing uses **wouter** (not React Router). All routes are defined in `client/src/App.tsx` using `<Route>` and `<Switch>` components. Pages are **lazy-loaded** via `React.lazy()` with a `Suspense` fallback.

### Database

- **MySQL** database accessed via **Drizzle ORM**
- Schema defined in `drizzle/schema.ts` (~2900 lines, ~100 tables)
- Connection string from `DATABASE_URL` environment variable
- Query functions centralized in `server/db.ts`
- Migrations stored in `drizzle/*.sql`, managed by `drizzle-kit`

### Key Server Modules

| Module | Purpose |
|--------|---------|
| `routers.ts` | Main tRPC router merging all sub-routers |
| `adminRouter.ts` | Admin panel management (users, groups, roles, menus) |
| `cmsRouter.ts` | Content management system routes |
| `controlPanelRouter.ts` | Platform control panel |
| `settingsRouter.ts` | Platform settings management |
| `operationsRouter.ts` | Operational monitoring routes |
| `db.ts` | All database query functions |
| `rasidAI.ts` | Core Rasid AI chat engine |
| `deepScanner.ts` | Deep website compliance scanning |
| `scanEngine.ts` | Standard compliance scanning |
| `aiAssistant.ts` | AI assistant for Smart Rasid |
| `rasidEnhancements/` | RAG, learning, guardrails, caching for AI |

### Key Domain Concepts

- **Compliance Status**: `compliant`, `partially_compliant`, `non_compliant`, `not_working` (defined in `shared/compliance.ts`)
- **Article 12 Clauses**: 8 clauses from Saudi PDPL Article 12 that sites must comply with
- **Sites**: Monitored websites with compliance scores
- **Scans**: Automated or manual compliance scans of sites
- **Leaks**: Data leak incidents tracked and monitored
- **Smart Rasid**: AI assistant for compliance analysis and recommendations
- **Deep Scan**: Thorough website scanning including page discovery and clause verification

## Path Aliases

Defined in `tsconfig.json` and `vite.config.ts`:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## Code Conventions

### Formatting (Prettier)

- Semicolons: yes
- Quotes: double quotes (JSX double quotes)
- Trailing commas: es5
- Print width: 80
- Tab width: 2 (spaces)
- Arrow parens: avoid single-param parens
- End of line: LF

### TypeScript

- Strict mode enabled
- Module: ESNext, Target: ES2022
- Bundler module resolution
- Types from Drizzle schema are the source of truth (`drizzle/schema.ts`)

### Component Patterns

- React functional components only
- shadcn/ui for base UI components (in `client/src/components/ui/`)
- Tailwind CSS for styling (v4 with CSS variables)
- Framer Motion for animations
- Recharts and Chart.js for data visualization
- `react-hook-form` + `zod` for form validation
- RTL (right-to-left) support for Arabic

### Server Patterns

- tRPC procedures with Zod input validation
- Database queries use Drizzle ORM query builder
- Error handling via `TRPCError`
- Audit logging for sensitive operations

## Environment Variables

Required environment variables:
- `DATABASE_URL` — MySQL connection string
- `JWT_SECRET` — Secret for JWT signing
- `PORT` — Server port (default: 3000)
- `NODE_ENV` — `development` or `production`
- `VITE_APP_ID` — Application ID
- `OAUTH_SERVER_URL` — OAuth provider URL
- `OWNER_OPEN_ID` — Owner's OpenID

Optional:
- `BUILT_IN_FORGE_API_URL` — LLM API URL
- `BUILT_IN_FORGE_API_KEY` — LLM API key
- AWS S3 credentials for file storage

## Testing

- Framework: **Vitest**
- Test files: `server/**/*.test.ts` and `server/**/*.spec.ts`
- Environment: Node
- Run: `pnpm test`

## Deployment

- **Platform**: Railway
- **Build**: Docker multi-stage build (Node 20)
- **Startup**: `scripts/startup.sh` (runs migrations → seeds → starts server)
- **Health check**: `GET /api/health`
- **Static files**: Built client served from `dist/public/`

## Important Notes

- The codebase is bilingual (Arabic + English), with Arabic as the primary UI language
- Many server files are very large (db.ts ~300KB, routers.ts ~425KB, rasidAI.ts ~150KB) — be cautious with full-file reads
- The schema has ~100 tables — refer to `drizzle/schema.ts` for the authoritative data model
- All pages in `client/src/pages/` are lazy-loaded — new pages need lazy import in `App.tsx`
- The `shared/` directory is imported by both client and server — keep it free of platform-specific code
- S3 storage is used for file uploads (evidence, exports)
- WebSocket support exists for real-time notifications (`server/websocket.ts`)
