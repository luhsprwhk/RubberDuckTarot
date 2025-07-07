# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Testing
npm run test        # Run tests with Vitest
npm run test:ui     # Open Vitest UI
npm run test:run    # Run tests once

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

This is a React + TypeScript + Vite application for a tarot card reading service called "Rubber Duck Tarot". The application uses Supabase as its database backend with comprehensive encryption for sensitive user data.

### Key Architecture Patterns

**Database Abstraction Layer**: The app uses a database adapter pattern (`lib/database-adapter.ts`) that provides a unified interface for all database operations using Supabase.

**Module Organization**: Code is organized into feature modules under `src/lib/`:

- `auth/` - Authentication context and provider
- `cards/` - Card data management with caching
- `insights/` - Reading/insight data queries (renamed from "readings")
- `blocks/` - User block tracking and management
- `blocktypes/` - Block type management
- `user/` - User operations and queries
- `alerts/` - Alert system context and provider
- `hooks/` - Custom React hooks for data fetching
- `supabase/` - Supabase client configurations

**AI Integration**: Uses Anthropic's Claude API via `src/ai/` modules to generate personalized tarot readings:

- `src/ai/generate_insight.ts` - Core insight generation logic
- `src/ai/generateUserBlockName.ts` - Dynamic block naming
- `src/ai/profession-metaphors.ts` - Context-aware metaphors
- `src/ai/system-prompt.md` - Rob's personality and consultation style

**Context Providers**: The app uses React Context for global state:

- `AuthContext` for user authentication
- `CardsContext` for card data with caching layer
- `InsightContext` for insights management
- `BlockTypesContext` for block type data
- `AlertContext` for application alerts

**Security & Encryption**: Implements AES-256-GCM encryption for sensitive data:

- `src/lib/encryption.ts` - Encryption utilities with PBKDF2 key derivation
- Encrypts user emails, names, birthdays, birth places
- Encrypts insight contexts and readings
- Uses 100,000 PBKDF2 iterations for key derivation

### Database Schema

The app uses Drizzle ORM with schemas defined in `supabase/schema.ts` (PostgreSQL/Supabase).

Core entities:

- `cards` - Tarot card definitions with meanings and prompts
- `block_types` - Categories for different reading contexts
- `insights` - User consultations (formerly called "readings")
- `users` - User accounts with preferences and premium status
- `user_profiles` - Detailed user profiles with encrypted sensitive fields
- `user_blocks` - User-tracked blocks with progress and encrypted notes

### Component Structure

- `components/` - Reusable UI components
- `pages/` - Route-level page components
- `utils/` - Utility functions

### Testing

- Uses **Vitest 3.2.4** as the testing framework
- Configuration in `vitest.config.ts`
- Test files: `*.test.ts` pattern
- Current tests cover card drawing logic and encryption

### Feature Flags

- `src/lib/featureFlags.ts` - Environment-based feature control
- `VITE_ENABLE_WAITLIST` - Controls authentication vs. marketing mode

### Build Configuration

- Uses Vite with SWC for fast builds and HMR
- Tailwind CSS for styling
- Path aliases: `@` points to project root
- ESLint + Prettier with Husky pre-commit hooks

## Environment Variables

Required environment variables:

- `VITE_ANTHROPIC_API_KEY` - Claude API key for AI generation
- `VITE_ENCRYPTION_MASTER_KEY` - Master key for user data encryption
- `VITE_ENABLE_WAITLIST` - Feature flag for waitlist mode (optional)

## Important Notes

- The terminology changed from "readings" to "insights" - use "insights" for new code
- Database seeding is done with `npm run supabase:seed`
- All sensitive user data is encrypted at rest using AES-256-GCM
- Run tests with `npm run test` before committing changes
- AI logic is located in `src/ai/`, not `src/modules/`
