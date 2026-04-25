# Clinic Registry Frontend

[![Checks](https://img.shields.io/github/actions/workflow/status/awtb/clinic-registry-frontend/checks.yml?label=checks&style=for-the-badge)](https://github.com/awtb/clinic-registry-frontend/actions/workflows/checks.yml)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind v4](https://img.shields.io/badge/Tailwind%20v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License MIT](https://img.shields.io/github/license/awtb/clinic-registry-frontend?style=for-the-badge&v=2)](./LICENSE)

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

Run before opening a PR:

```bash
pnpm check       # svelte-check against tsconfig.json
pnpm lint        # ESLint (lint:fix to autofix)
pnpm format      # Prettier (format:fix to write)
```

## Project Structure

```
src/
├── lib/
│   ├── components/ui/   # shadcn-svelte primitives (bits-ui)
│   ├── features/        # Feature modules (patients, medical-records, procedures, ...)
│   ├── schemas/         # Zod schemas shared across features
│   ├── shared/api/      # API client + per-resource endpoints
│   ├── server/          # Server-only config
│   └── layout/          # Sidebar and shared layout pieces
└── routes/              # SvelteKit routes
```

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
