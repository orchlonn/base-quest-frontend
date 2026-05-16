# base-quest-frontend

Frontend for **Base Quest**, a gamified learning app with lessons, mini-games, pre/post tests, and an XP-based progression dashboard. Built with Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Zustand, and Framer Motion.

## Prerequisites

- **Node.js** 18.17+ (Node 20 LTS recommended)
- **npm** 9+ (or pnpm / yarn — examples below use npm)
- A running **Base Quest backend** reachable at the URL you configure in `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000`)

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd base-quest-frontend
npm install
```

### 2. Configure environment variables

Copy the example env file and edit if your backend runs on a different URL:

```bash
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the Base Quest backend API. |

### 3. Run the dev server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server on port 3000 with hot reload. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Start the production server (run `build` first). |
| `npm run lint` | Run Next.js / ESLint checks. |

## Production build

```bash
npm run build
npm run start
```

The server listens on port 3000 by default. Override with the `PORT` env var or by editing the `start` script in `package.json`.

## Project structure

```
src/
├── app/                # Next.js App Router pages
│   ├── dashboard/      # Authenticated user dashboard
│   ├── games/          # Mini-game routes
│   ├── how-to-play/    # Onboarding / instructions
│   ├── lessons/        # Lesson content
│   ├── login/          # Sign in
│   ├── register/       # Sign up
│   ├── pre-test/       # Diagnostic test
│   ├── post-test/      # Post-lesson assessment
│   ├── results/        # Test results
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── components/         # Shared UI (NavBar, XPBar, RequireAuth)
├── lib/                # API client + helpers
├── store/              # Zustand stores (auth)
└── styles/             # Global styles
```

## Authentication

The auth token is stored in `localStorage` under the key `bq_token` and is sent as a `Bearer` token by the `api()` helper in `src/lib/api.ts`. Routes that require auth wrap their content in the `RequireAuth` component.

## Troubleshooting

- **`Request failed: 401` / API errors** — make sure the backend is running and `NEXT_PUBLIC_API_URL` points to it. Env vars prefixed with `NEXT_PUBLIC_` require a dev server restart after changes.
- **Port 3000 already in use** — change the port in the `dev` / `start` scripts in `package.json`, or run `npx next dev -p 3001`.
- **Stale build artifacts** — delete `.next/` and `tsconfig.tsbuildinfo`, then rebuild.
