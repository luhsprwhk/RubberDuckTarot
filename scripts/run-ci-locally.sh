#!/bin/bash

# Local CI Runner Script
# This script simulates the GitHub Actions CI pipeline locally

set -e  # Exit on any error

echo "🚀 Running CI pipeline locally..."
echo ""

# Set CI environment variables (same as in .github/workflows/ci.yml)
export VITE_SUPABASE_URL=https://mock.supabase.co
export VITE_SUPABASE_ANON_KEY=mock-anon-key
export VITE_ANTHROPIC_API_KEY=mock-anthropic-key
export VITE_ENCRYPTION_MASTER_KEY=5500607ff009f88a605de68d6ddc06810c3c05372707d11cc7f6bfe0cb33b72d
export VITE_HCAPTCHA_SITE_KEY=mock-hcaptcha-key

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔍 Running lint job..."
echo "----------------------------------------"

echo "📝 Running linting..."
npm run lint

echo "✨ Checking formatting..."
npm run format:check

echo "🏗️  Verifying build..."
npm run build

echo ""
echo "🧪 Running test job..."
echo "----------------------------------------"

echo "🎯 Running tests..."
npm run test:run

echo ""
echo "✅ All CI checks passed! 🎉"
echo ""
echo "Your code is ready for CI/CD pipeline."