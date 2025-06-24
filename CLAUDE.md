# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Linting and formatting
npm run lint
npm run format
npm run format:check

# Database operations
npm run db:generate    # Generate database migrations
npm run db:migrate     # Run migrations
npm run db:studio      # Open Drizzle Studio
npm run supabase:seed  # Seed database
```

## Architecture Overview

This is a React + TypeScript + Vite application for a tarot card reading service called "Rubber Duck Tarot". The application uses Supabase as its database backend.

### Key Architecture Patterns

**Database Abstraction Layer**: The app uses a database adapter pattern (`lib/database-adapter.ts`) that provides a unified interface for all database operations using Supabase.

**Module Organization**: Code is organized into feature modules under `src/modules/`:

- `auth/` - Authentication context and provider
- `cards/` - Card data management with caching
- `insights/` - Reading/insight data queries (renamed from "readings")
- `userPreferences.ts` - User profile management

**Context Providers**: The app uses React Context for global state:

- `AuthContext` for user authentication
- `CardsContext` for card data with caching layer

**AI Integration**: Uses Anthropic's Claude API (`src/modules/claude-ai.ts`) to generate personalized tarot readings based on user context and selected cards.

### Database Schema

The app uses Drizzle ORM with schemas defined in `supabase/schema.ts` (PostgreSQL/Supabase).

Core entities:

- `cards` - Tarot card definitions with meanings and prompts
- `block_types` - Categories for different reading contexts
- `insights` - User readings (formerly called "readings")
- `users` - User profiles with preferences and premium status

### Component Structure

- `components/` - Reusable UI components
- `pages/` - Route-level page components
- `hooks/` - Custom React hooks for data fetching

### Build Configuration

- Uses Vite with SWC for fast builds and HMR
- Tailwind CSS for styling
- Path aliases: `@` points to project root
- ESLint + Prettier with Husky pre-commit hooks

## Important Notes

- The terminology changed from "readings" to "insights" - use "insights" for new code
- Database seeding is done with `npm run supabase:seed`
- Claude API key must be set in `VITE_ANTHROPIC_API_KEY` environment variable
