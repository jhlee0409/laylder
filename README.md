# Laylder MVP

[![codecov](https://codecov.io/gh/jhlee0409/laylder/branch/main/graph/badge.svg)](https://codecov.io/gh/jhlee0409/laylder)

Visual layout builder for AI-powered code generation.

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
