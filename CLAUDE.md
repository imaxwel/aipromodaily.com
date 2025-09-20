# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- **Development**: `pnpm dev` - Starts the development server with Turbo
- **Build**: `pnpm build` - Builds the application and search index
- **Lint**: `pnpm lint` (root) or `biome lint .` - Lints the codebase using Biome
- **Format**: `pnpm format` or `biome format . --write` - Formats code using Biome
- **Type Check**: `pnpm type-check` (in apps/web) - Runs TypeScript type checking

### Database Operations
- **Generate**: `pnpm generate` (in packages/database) - Generates Prisma client
- **Push Schema**: `pnpm push` (in packages/database) - Pushes schema changes to database
- **Migrate**: `pnpm migrate` (in packages/database) - Runs database migrations
- **Database Studio**: `pnpm studio` (in packages/database) - Opens Prisma Studio
- **Seed**: `pnpm seed` (in packages/database) - Seeds the database

### Testing
- **E2E Tests**: `pnpm e2e` (in apps/web) - Runs Playwright tests with UI
- **E2E CI**: `pnpm e2e:ci` (in apps/web) - Runs Playwright tests for CI

### Search
- **Build Search Index**: `pnpm build:search` (in apps/web) - Builds Pagefind search index

## Architecture Overview

This is a **monorepo SaaS starter kit** built with **Next.js 15**, **Turbo**, and **pnpm workspaces**. The architecture follows a modular design with shared packages and a main web application.

### Project Structure
```
├── apps/web/                    # Main Next.js application
├── packages/                    # Shared packages
│   ├── api/                     # Hono API layer
│   ├── auth/                    # Better Auth authentication
│   ├── database/                # Prisma database layer
│   ├── i18n/                    # Internationalization
│   ├── payments/                # Payment processing
│   ├── mail/                    # Email functionality
│   ├── storage/                 # File storage
│   ├── ai/                      # AI integrations
│   ├── logs/                    # Logging utilities
│   └── utils/                   # Shared utilities
├── tooling/                     # Build tools and configurations
└── config/                      # Shared configuration
```

### Key Technologies
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Radix UI
- **Backend**: Hono API, Better Auth
- **Database**: Prisma ORM, PostgreSQL
- **Build System**: Turbo monorepo, pnpm workspaces
- **Linting/Formatting**: Biome
- **Testing**: Playwright for E2E
- **Search**: Pagefind
- **Content**: MDX with Content Collections
- **Payments**: Stripe integration
- **Internationalization**: next-intl with RTL support

### Application Modules
The web app is organized into feature modules:
- **Marketing**: Public pages, blog, pricing, contact
- **SaaS**: Authenticated application with organizations
- **Auth**: Authentication flows (login, signup, password reset)
- **Admin**: Administrative interface
- **Settings**: User and organization settings
- **AI**: AI chat functionality

### Configuration System
Central configuration is managed through `config/types.ts` with support for:
- Multi-language setup with RTL support
- Organization management
- Payment plans configuration
- Authentication methods
- UI theming

### Content Management
- **Blog Posts**: MDX files in `content/posts/` with multi-language support
- **Documentation**: MDX files in `content/docs/`
- **Legal Pages**: Markdown files in `content/legal/`

### Key Features
- Multi-tenant SaaS with organizations
- Internationalization (i18n) with IP-based language detection
- Subscription billing with Stripe
- AI chat integration
- Advanced search with Pagefind
- Email system with templates
- File storage with AWS S3
- Comprehensive authentication (social, email, passkeys)

### Development Notes
- Uses **Server Components** by default
- **App Router** with nested layouts
- **Middleware** for i18n and auth
- **Workspace packages** are TypeScript-first
- **Biome** for linting and formatting (replaces ESLint/Prettier)
- **Turbo** for build caching and parallelization