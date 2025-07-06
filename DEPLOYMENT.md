# Deployment Guide

## Quick Deploy (Logged-out Views Only)

This deployment mode shows only the landing page and pricing page, with signup buttons that say "Join Waitlist" instead of starting full consultations.

### Build for Production

```bash
# Build with auth disabled
VITE_ENABLE_WAITLIST=false npm run build
```

### Environment Variables

For production deployment, set:

```bash
VITE_ENABLE_WAITLIST=false
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can deploy the `dist/` folder to any static hosting service:

- **Vercel**: Connect your repo and set environment variables in the dashboard
- **Netlify**: Same as Vercel
- **GitHub Pages**: Use the `gh-pages` npm package to deploy the dist folder
- **Any static host**: Upload the contents of `dist/` folder

### Features Included

- ✅ Landing page with "Join Waitlist" CTA
- ✅ Pricing page with waitlist signup
- ✅ Card browsing (static content)
- ✅ Email signup for waitlist
- ❌ No sign-in functionality
- ❌ No dashboard/readings
- ❌ No user accounts

### Full Deployment (Development)

For development or full feature deployment:

```bash
# Build with all features
VITE_ENABLE_WAITLIST=true npm run build
```

Set all environment variables from `.env.example`.

## Switching Between Modes

The feature flag `VITE_ENABLE_WAITLIST` controls whether authentication features are shown:

- `true`: Full app with authentication, user accounts, readings
- `false`: Marketing site with waitlist signup only

This allows you to deploy the marketing site immediately while continuing development on the full app.
