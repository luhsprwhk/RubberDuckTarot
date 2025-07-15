# Rubber Duck Tarot - Architecture Documentation

## Project Overview

**Rubber Duck Tarot** is a React-based web application that provides personalized tarot-style consultations for debugging life problems. The app features "Rob Chen," a fictional deceased developer who offers practical problem-solving advice through a rubber duck medium.

## Technology Stack

### Frontend

- **React 19.1.0** - Core UI framework
- **TypeScript 5.8.3** - Type safety and developer experience
- **Vite 6.3.5** - Build tool and development server
- **React Router DOM 7.6.2** - Client-side routing
- **Tailwind CSS 4.1.10** - Utility-first CSS framework
- **Lucide React 0.519.0** - Icon library
- **React Icons 5.5.0** - Additional icon library
- **Headless UI 2.2.4** - Unstyled, accessible UI components
- **hCaptcha React 1.12.0** - Bot protection
- **SWC** - Fast compilation via Vite React SWC plugin

### Backend & Database

- **Supabase 2.50.0** - Backend-as-a-Service (PostgreSQL database + Auth + API)
- **Drizzle ORM 0.44.2** - TypeScript ORM for database operations
- **Drizzle Kit 0.31.1** - Schema management and migrations
- **PostgreSQL** - Primary database (via Supabase)
- **Postgres.js 3.4.7** - PostgreSQL client for Node.js
- **Google Maps API** - Location services for birth place input

### AI Integration

- **Anthropic Claude API** - AI-powered consultation generation
- **@anthropic-ai/sdk 0.54.0** - Official Anthropic SDK

### Development Tools

- **ESLint 9.25.0** - Code linting with TypeScript ESLint 8.30.1
- **Prettier 3.5.3** - Code formatting
- **Husky 9.1.7** - Git hooks for pre-commit checks
- **Vitest 3.2.4** - Testing framework with UI support
- **Testing Library** - React testing utilities
- **JSDoc** - Documentation generation
- **Sharp 0.34.2** - Image optimization
- **SVGO 4.0.0** - SVG optimization
- **TSX 4.20.3** - TypeScript execution for scripts

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Route-level page components
├── lib/                # Core application logic
│   ├── auth/           # Authentication context and providers
│   ├── supabase/       # Supabase-specific integrations
│   ├── cards/          # Card data management with caching
│   ├── insights/       # Reading/insight data queries
│   ├── blocks/         # User block tracking
│   ├── blocktypes/     # Block type management
│   ├── user/           # User operations and queries
│   ├── alerts/         # Alert system context and provider
│   ├── hooks/          # Custom React hooks
│   ├── chat/           # Chat persistence and management
│   ├── analytics/      # User analytics and insights
│   ├── privacy/        # Privacy and data protection
│   ├── ads/            # Advertisement management
│   ├── notion/         # Notion integration
│   ├── reflections/    # User reflection management
│   └── advice/         # Advice generation and storage
├── ai/                 # AI prompt engineering and generation
├── assets/             # Static images and media
└── types/              # TypeScript type definitions

supabase/
├── migrations/         # Database schema migrations
├── schema.ts          # Drizzle ORM schema definitions
└── seed.ts            # Database seeding scripts

data/
├── cards.json         # Tarot card definitions
└── block_types.json   # Block type categories
```

## Architecture Patterns

### Database Abstraction Layer

The application uses a **database adapter pattern** (`lib/database-adapter.ts`) that provides a unified interface for all database operations. This abstraction layer:

- Centralizes all database interactions
- Provides a consistent API across the application
- Enables easy testing with mock implementations
- Supports multiple database backends (currently Supabase)

### Module Organization

Code is organized into **feature modules** under `src/lib/` and `src/ai/`:

**Core Features:**

- `auth/` - Authentication context and provider
- `cards/` - Card data management with caching layer
- `insights/` - Reading/insight data queries (renamed from "readings")
- `blocks/` - User block tracking functionality
- `blocktypes/` - Block type management and context
- `user/` - User operations, queries, and profile management
- `alerts/` - Global alert and notification system

**AI & Generation (`src/ai/`):**

- `generate_insight.ts` - Core insight generation logic
- `generate_advice_for_user.ts` - Personalized advice generation
- `generate_block_chat.ts` - Block-specific chat responses
- `generate_insight_chat.ts` - Insight-specific chat responses
- `generateUserBlockName.ts` - Dynamic block naming
- `profession-metaphors.ts` - Context-aware metaphors
- `system-prompt.md` - Rob's personality and consultation style

**Utility & Infrastructure:**

- `chat/` - Chat persistence and conversation management
- `analytics/` - User behavior analytics and insight improvement
- `privacy/` - Privacy controls and data protection
- `encryption.ts` - AES-256-GCM encryption for sensitive data
- `ads/` - Advertisement management and session tracking
- `notion/` - Notion workspace integration
- `reflections/` - User reflection storage and encryption migration

### Context Providers

The app uses **React Context** for global state management:

- `AuthContext` - User authentication state and user data
- `CardsContext` - Card data with intelligent caching layer
- `InsightContext` - Reading/insight state management and operations
- `AlertContext` - Global alert/notification system with auto-dismiss
- `BlockTypesContext` - Block type categories and metadata

Each context provider includes:

- State management with optimized re-renders
- Error boundary handling
- Loading states and skeleton UIs
- Automatic data refetching and cache invalidation

### Component Architecture

- **Page Components** (`pages/`) - Route-level components that handle data fetching
- **UI Components** (`components/`) - Reusable, presentational components
- **Context Providers** - Wrap the app to provide global state
- **Custom Hooks** (`lib/hooks/`) - Encapsulate complex stateful logic

## Database Schema

### Core Entities

- **`cards`** - Tarot card definitions with meanings, prompts, and block applications
- **`block_types`** - Categories for different reading contexts (creative, work, life, relationship)
- **`insights`** - User consultations/readings with AI-generated content and feedback tracking
- **`users`** - User accounts with preferences, premium status, and Notion integration
- **`user_profiles`** - Detailed user profiles with encrypted sensitive fields (name, birthday, birth place)
- **`user_blocks`** - User-tracked blocks with progress, status, and encrypted notes
- **`user_card_advice`** - Personalized advice generated for specific card/block type combinations
- **`user_card_reflections`** - User reflections on card prompts with encryption
- **`insight_conversations`** - Chat conversations linked to specific insights
- **`chat_messages`** - Individual chat messages with encrypted content
- **`user_chat_privacy_settings`** - Privacy controls for chat data retention and analytics

### Key Relationships

- Users have many insights, blocks, advice entries, and reflections
- Insights can link to specific user blocks and support chat conversations
- User blocks are categorized by block types and track resolution progress
- Card advice is generated per user/card/block-type combination for personalization
- Chat conversations can be linked to insights or standalone for block discussions
- All sensitive user data (profiles, reflections, chat messages, block notes) is encrypted at rest
- Privacy settings control data retention and analytics participation per user

## AI Integration

### Claude API Integration

- **Primary Module**: `src/ai/` directory with specialized generation functions
- **Core Functions**:
  - `generate_insight.ts` - Personalized tarot readings with card interpretations
  - `generate_advice_for_user.ts` - Contextual advice based on user profile
  - `generate_block_chat.ts` - Interactive chat for block discussions
  - `generate_insight_chat.ts` - Follow-up conversations about insights
  - `generateUserBlockName.ts` - AI-generated names for user blocks
- **Error Handling**: `ai-error-handler.ts` - Robust error handling with fallbacks
- **Input Sanitization**: `ai-prompt-sanitization.ts` and `input-sanitization.ts`
- **Rate Limiting**: `rate-limiter.ts` - Prevents API abuse

### Prompt Engineering

- **System Prompt**: `src/ai/system-prompt.md` - Defines Rob Chen's personality, consultation style, and ethical guidelines
- **Profession Metaphors**: `src/ai/profession-metaphors.ts` - Context-aware metaphors tailored to user's work background
- **Sanitization**: Comprehensive input sanitization to prevent prompt injection
- **Context Management**: Dynamic context building based on user profile, block history, and conversation state

## Feature Flagging

### Environment-Based Feature Control

- **File**: `src/lib/featureFlags.ts`
- **Purpose**: Control feature availability between development and production
- **Key Flag**: `VITE_ENABLE_WAITLIST` - Controls authentication features

### Deployment Modes

1. **Development Mode** (`VITE_ENABLE_WAITLIST=true`)
   - Full authentication and user features
   - Complete app functionality
2. **Marketing Mode** (`VITE_ENABLE_WAITLIST=false`)
   - Logged-out views only (Landing, Pricing, Features, Cards)
   - "Join Waitlist" CTAs instead of authentication
   - No sign-in functionality

## Build Configuration

### Vite Configuration

- **Path Aliases**: `@` points to project root for clean imports
- **SWC Compilation**: Fast builds and Hot Module Replacement
- **Environment Variables**: Prefixed with `VITE_` for client-side access

### Code Quality

- **ESLint + Prettier**: Automated code formatting and linting
- **Husky Pre-commit Hooks**: Ensures code quality before commits
- **TypeScript Strict Mode**: Strong type safety throughout the codebase

## Security Considerations

### Authentication & Authorization

- Supabase handles authentication with email/password and social logins
- Row Level Security (RLS) policies protect all user data
- JWT tokens for secure API access with automatic refresh
- hCaptcha integration for bot protection during registration
- Session management with automatic logout on token expiration

### Environment Variables

- Sensitive keys (service role, DB passwords) excluded from client builds
- Public keys only for client-side operations
- Production environment uses minimal required variables

### Data Privacy & Encryption

- **AES-256-GCM Encryption**: All sensitive user data encrypted at rest
- **Encrypted Fields**: User names, emails, birthdays, birth places, reflection text, chat messages, block notes
- **Key Derivation**: PBKDF2 with 100,000 iterations for secure key generation
- **Privacy Controls**: User-configurable data retention periods and analytics opt-in
- **Chat Privacy**: Automatic message cleanup based on user preferences
- **GDPR Compliance**: Full data export capabilities and deletion on account closure
- **No Cross-User Data Sharing**: Strict user isolation with RLS policies

## Performance Optimizations

### Caching Strategy

- **Card Cache** (`lib/cards/cardCache.ts`): In-memory caching of card definitions with intelligent preloading
- **Context Optimization**: React Context providers use memoization to prevent unnecessary re-renders
- **Query Caching**: Database queries cached at the adapter level for frequently accessed data
- **Session Tracking**: Advertisement session management with local storage
- **Static Assets**: Optimized images, GIFs, and SVGs with compression and lazy loading

### Bundle Optimization

- **Code Splitting**: Dynamic imports for large components
- **Tree Shaking**: Removes unused code in production builds
- **Asset Optimization**: Vite handles image compression and bundling

## Development Workflow

### Environment Setup

```bash
npm install              # Install dependencies
npm run dev             # Start development server with SSL
npm run db:studio       # Open Drizzle Studio for database management
npm run supabase:seed   # Seed development database
npm run supabase:restart # Restart local Supabase instance
```

### Code Quality

```bash
npm run lint            # Check code quality with ESLint
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting without changes
npm run test            # Run test suite with Vitest
npm run test:ui         # Open Vitest UI for interactive testing
npm run test:run        # Run tests once in CI mode
npm run build           # Build for production with TypeScript check
```

### Database Management

```bash
npm run db:generate     # Generate new Drizzle migrations
npm run db:push         # Push schema changes to database
npm run db:migrate      # Apply pending migrations
npm run supabase:seed   # Seed database with cards and block types
npm run convert-gifs    # Optimize GIF assets for web
```

## Deployment Architecture

### Static Site Generation

- Builds to static files in `dist/` directory
- Can be deployed to any static hosting service
- Environment variables control feature availability

### Recommended Hosting

- **Vercel/Netlify**: Automatic deployments with environment variable management
- **GitHub Pages**: Simple static hosting for marketing mode
- **Any CDN**: Distribution of static assets for global performance

## Future Considerations

### Scalability

- Database queries optimized with proper indexing
- Caching layer ready for Redis integration
- API rate limiting through Supabase

### Monitoring

- Error tracking integration ready
- Performance monitoring hooks in place
- User analytics events structured for implementation

### Extensions

- Plugin architecture for new card types
- API endpoints ready for mobile app integration
- Multi-language support structure in place
