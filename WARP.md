# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a supastarter Next.js monorepo for building production-ready SaaS applications. It uses a turborepo-based monorepo structure with pnpm workspaces.

## Essential Commands

### Development
```bash
# Start development server with hot reload
pnpm dev

# Start development for specific workspace
pnpm --filter web dev
```

### Build & Production
```bash
# Build all workspaces
pnpm build

# Build specific workspace
pnpm --filter web build

# Start production server (after build)
pnpm start
```

### Code Quality
```bash
# Run linter (Biome)
pnpm lint

# Format code with Biome
pnpm format

# Type checking
pnpm --filter web type-check
```

### Testing
```bash
# Run E2E tests with Playwright UI
pnpm --filter web e2e

# Run E2E tests in CI mode
pnpm --filter web e2e:ci

# Run a single test file
pnpm --filter web exec playwright test path/to/test.spec.ts
```

### Database Operations
```bash
# Generate Prisma client
pnpm --filter @repo/database generate

# Push database schema changes
pnpm --filter @repo/database push

# Run database migrations
pnpm --filter @repo/database migrate

# Open Prisma Studio
pnpm --filter @repo/database studio

# Seed database
pnpm --filter @repo/database seed
```

### Authentication
```bash
# Generate auth migrations
pnpm --filter @repo/auth migrate
```

## Architecture

### Monorepo Structure

The codebase follows a modular monorepo architecture with clear separation of concerns:

- **apps/web**: Main Next.js application using App Router. This is where all frontend code lives.
- **packages/**: Shared backend logic and utilities
  - **ai**: AI integration code (OpenAI, Anthropic, Google AI SDKs)
  - **api**: API routes using Hono framework
  - **auth**: Authentication using better-auth library
  - **database**: Prisma ORM configuration and database schema
  - **i18n**: Internationalization with next-intl
  - **logs**: Logging configuration
  - **mail**: Email sending providers and templates
  - **payments**: Payment processing logic
  - **storage**: File/image storage providers (AWS S3)
  - **utils**: Shared utility functions
- **tooling/**: Build and development tools
- **config/**: Shared configuration files

### Key Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: better-auth
- **UI Components**: Shadcn UI + Radix UI primitives
- **Styling**: Tailwind CSS v4
- **State Management**: 
  - Server state: React Query (TanStack Query)
  - Client state: Jotai
  - URL state: nuqs
- **Forms**: React Hook Form with Zod validation
- **AI Integration**: Vercel AI SDK with multiple providers
- **Build System**: Turborepo with pnpm workspaces
- **Linting/Formatting**: Biome
- **Testing**: Playwright for E2E tests

### Development Principles

Based on .cursorrules and .windsurfrules:

1. **TypeScript First**: All code must be TypeScript with proper types
2. **Functional Programming**: Prefer functional patterns, avoid classes
3. **React Server Components**: Minimize client components, prefer RSC
4. **Performance**: 
   - Use Suspense boundaries with fallbacks
   - Implement lazy loading for non-critical components
   - Optimize images (WebP, proper sizing, lazy loading)
5. **Code Organization**:
   - Files structure: exported component → subcomponents → helpers → static content → types
   - Use lowercase-with-dashes for directories
   - Favor named exports
6. **State Management**:
   - Use nuqs for URL search params
   - Minimize useEffect and useState
   - Prefer server-side data fetching

### Environment Configuration

The project uses dotenv for environment variables with the following pattern:
- `.env.local` for local development (not committed)
- `.env.local.example` as template

All commands automatically load environment variables using `dotenv -c`.

### Important Files

- **turbo.json**: Turborepo pipeline configuration
- **pnpm-workspace.yaml**: Workspace packages definition
- **biome.json**: Linting and formatting rules
- **apps/web/playwright.config.ts**: E2E test configuration
- **packages/database/prisma/schema.prisma**: Database schema

## Package Management

This project uses pnpm with workspaces. Key commands:

```bash
# Install dependencies
pnpm install

# Add dependency to specific workspace
pnpm --filter <workspace-name> add <package-name>

# Add dev dependency
pnpm --filter <workspace-name> add -D <package-name>

# Clean all build artifacts
pnpm clean
```

## Working with UI Components

The project uses Shadcn UI. To add new components:

```bash
pnpm --filter web shadcn-ui add <component-name>
```

## Global Theme

Theme variables and Tailwind configuration are defined in `tooling/tailwind/theme.css`.

## Documentation Reference

For supastarter-specific patterns and detailed documentation, refer to: https://supastarter.dev/docs/nextjs