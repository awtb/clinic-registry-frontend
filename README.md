# Clinic Registry Frontend

Frontend for **clinic-registry**.

This project was built as a diploma work project at **Russian-Tajik (Slavonic) University**, paired with the [clinic-registry-backend](https://github.com/awtb/clinic-registry-backend) service.

## Features

- Authentication via cookie-based access token
- Patient registry with search and pagination
- Medical records with multi-procedure support
- Procedures and procedure categories management
- User management
- Audit logs with filtering
- Dashboard overview

## Tech Stack

- SvelteKit (Svelte `5`)
- TypeScript
- Tailwind CSS `v4`
- shadcn-svelte (bits-ui)
- `pnpm` as package manager

## Requirements

- Node.js
- `pnpm` (`packageManager: pnpm@10.30.1`)
- A running [clinic-registry-backend](https://github.com/awtb/clinic-registry-backend) instance

## Environment Variables

Minimal `.env`:

```env
API_BASE_URL=http://localhost:8000
```

`API_BASE_URL` defaults to `http://localhost:8000` if unset. Auth uses an `access_token` cookie issued by the backend's login flow.

## Installation

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

The app is served on `http://localhost:5173` by default.

Production build:

```bash
pnpm build
pnpm preview
```

## Quality Checks

```bash
pnpm check       # svelte-check against tsconfig.json
pnpm typecheck   # tsc --noEmit
pnpm lint        # ESLint (lint:fix to autofix)
pnpm format      # Prettier (format:fix to write)
```
