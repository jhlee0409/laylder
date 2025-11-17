# Laylder MVP

[![codecov](https://codecov.io/gh/jhlee0409/laylder/branch/main/graph/badge.svg)](https://codecov.io/gh/jhlee0409/laylder)

Visual layout builder for AI-powered code generation.

## Migration Notice - v1.0.0 Breaking Changes

**IMPORTANT**: Version 1.0.0 introduces breaking changes. If you're upgrading from v0.x, please read the [Migration Guide](./MIGRATION.md).

**Key Changes**:
- All theme colors removed from component library (layout-only philosophy)
- Component library now generates pure structural layouts without styling defaults
- ARIA attributes validation system added for accessibility compliance

See [MIGRATION.md](./MIGRATION.md) for detailed upgrade instructions and migration strategies.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **DnD**: @dnd-kit
- **Validation**: Zod
- **Package Manager**: pnpm

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
/app              # Next.js App Router pages
/components       # React components
/lib              # Utility functions
/store            # Zustand state management
/types            # TypeScript type definitions
/templates        # AI prompt templates
```

## Architecture

This project follows PRD 0.3 specifications for building a visual layout design tool that generates AI-optimized prompts and JSON schemas.
