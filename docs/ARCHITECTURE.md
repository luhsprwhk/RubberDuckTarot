# Rubber Duck Tarot - Architecture Documentation

## Project Overview

**Rubber Duck Tarot** is a React-based web application that provides personalized tarot-style consultations for debugging life problems. The app features "Rob Chen," a fictional deceased developer who offers practical problem-solving advice through a rubber duck medium.

## Technology Stack

### Frontend

- **React 19.1.0** - Core UI framework
- **TypeScript** - Type safety and developer experience
- **Vite 6.3.5** - Build tool and development server
- **React Router DOM 7.6.2** - Client-side routing
- **Tailwind CSS 4.1.10** - Utility-first CSS framework
- **Lucide React** - Icon library
- **SWC** - Fast compilation via Vite React SWC plugin

### Backend & Database

- **Supabase** - Backend-as-a-Service (PostgreSQL database + Auth + API)
- **Drizzle ORM 0.44.2** - TypeScript ORM for database operations
- **PostgreSQL** - Primary database (via Supabase)

### AI Integration

- **Anthropic Claude API** - AI-powered consultation generation
- **@anthropic-ai/sdk 0.54.0** - Official Anthropic SDK

### Development Tools

- **ESLint 9.25.0** - Code linting
- **Prettier 3.5.3** - Code formatting
- **Husky 9.1.7** - Git hooks for pre-commit checks
- **Vitest 3.2.4** - Testing framework
- **TypeScript 5.8.3** - Static type checking

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Route-level page components
├── lib/                # Core application logic
│   ├── auth/           # Authentication context and providers
│   ├── database/       # Database adapters and queries
│   ├── supabase/       # Supabase-specific integrations
│   ├── cards/          # Card data management with caching
│   ├── insights/       # Reading/insight data queries
│   ├── blocks/         # User block tracking
│   ├── ai/             # AI prompt engineering and metaphors
│   └── hooks/          # Custom React hooks
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

Code is organized into **feature modules** under `src/lib/`:

- `auth/` - Authentication context and provider
- `cards/` - Card data management with caching layer
- `insights/` - Reading/insight data queries (renamed from "readings")
- `blocks/` - User block tracking functionality
- `userPreferences.ts` - User profile management

### Context Providers

The app uses **React Context** for global state management:

- `AuthContext` - User authentication state
- `CardsContext` - Card data with caching layer
- `InsightProvider` - Reading/insight state management
- `AlertProvider` - Global alert/notification system
- `BlockTypesProvider` - Block type categories

### Component Architecture

- **Page Components** (`pages/`) - Route-level components that handle data fetching
- **UI Components** (`components/`) - Reusable, presentational components
- **Context Providers** - Wrap the app to provide global state
- **Custom Hooks** (`lib/hooks/`) - Encapsulate complex stateful logic

## Database Schema

### Core Entities

- **`cards`** - Tarot card definitions with meanings, prompts, and block applications
- **`block_types`** - Categories for different reading contexts (creative, work, life, relationship)
- **`insights`** - User consultations/readings with AI-generated content
- **`users`** - User profiles with preferences and premium status
- **`user_blocks`** - User-tracked blocks with progress and resolution status

### Key Relationships

- Users have many insights (consultations)
- Insights reference card IDs and block types
- Users can track multiple blocks
- Blocks are categorized by block types

## AI Integration

### Claude API Integration

- **File**: `src/lib/claude-ai.ts`
- **Purpose**: Generate personalized tarot readings based on user context
- **Input**: User context, selected cards, block type
- **Output**: Structured reading with insights and action items

### Prompt Engineering

- **System Prompt**: `src/lib/ai/system-prompt.md` - Defines Rob's personality and consultation style
- **Profession Metaphors**: `src/lib/ai/profession-metaphors.ts` - Context-aware metaphors for different user backgrounds

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

### Authentication

- Supabase handles authentication and authorization
- Row Level Security (RLS) policies protect user data
- JWT tokens for secure API access

### Environment Variables

- Sensitive keys (service role, DB passwords) excluded from client builds
- Public keys only for client-side operations
- Production environment uses minimal required variables

### Data Privacy

- User consultation history encrypted and isolated
- No cross-user data sharing
- GDPR-compliant data handling through Supabase

## Performance Optimizations

### Caching Strategy

- **Card Cache** (`lib/cards/cardCache.ts`): In-memory caching of card definitions
- **React Context**: Prevents unnecessary re-renders with memoization
- **Static Assets**: Optimized images and GIFs with compression

### Bundle Optimization

- **Code Splitting**: Dynamic imports for large components
- **Tree Shaking**: Removes unused code in production builds
- **Asset Optimization**: Vite handles image compression and bundling

## Development Workflow

### Environment Setup

```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run db:studio       # Open database management UI
npm run supabase:seed   # Seed development database
```

### Code Quality

```bash
npm run lint            # Check code quality
npm run format          # Format code with Prettier
npm run test            # Run test suite
npm run build           # Build for production
```

### Database Management

```bash
npm run db:generate     # Generate new migrations
npm run db:migrate      # Apply migrations
npm run supabase:seed   # Seed database with sample data
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
