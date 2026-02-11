# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIKit (`@thenamespace/ens-components`) is a React component library for ENS (Ethereum Name Service) domain registration and management. Published to npm with ES modules, CommonJS, and TypeScript declarations.

## Commands

```bash
# Development
npm run dev           # Start dev mode with tsup watch
npm run storybook     # Start Storybook on port 6006
npm run test-app      # Vite dev server on port 4000

# Build
npm run build         # Production build (clean, types, rollup)
npm run build:types   # TypeScript declarations only
npm run build-storybook

# Code Quality
npm run lint          # ESLint
npm run format        # Prettier format
npm run format:check  # Prettier check

# Docker (Storybook container)
npm run docker:up     # Docker compose with rebuild
npm run docker:build  # Build Docker image
```

## Architecture

### Component Structure (Atomic Design)

```
src/components/
├── atoms/      # Basic UI: Button, Input, Textarea, Text, Icon, Card, Tooltip
├── molecules/  # Compound: Dropdown, Modal, Alert, ProfileHeader, Accordion
└── organisms/  # Complex forms: EnsNameRegistrationForm, EnsRecordsForm,
                # SelectRecordsForm, SubnameMintForm, OffchainSubnameForm
```

### Key Directories

- `src/hooks/` - Web3/ENS hooks: useRegisterENS, useWaitTransaction, useENSResolver, useMintSubname
- `src/utils/` - Helpers by domain: strings, coins, records, numbers, resolver, ens, blockExplorer
- `src/web3/` - Resolver ABI, wallet-connect config
- `src/providers/` - React context (TransactionProvider)
- `src/theme/` - ThemeProvider for styling
- `src/types/` - TypeScript definitions for records, transactions, listings, chains

### Path Aliases

```typescript
@/           → src/
@/components → src/components
@/atoms      → src/components/atoms
@/molecules  → src/components/molecules
@/constants  → src/constants
@/utils      → src/utils
@/types      → src/types
@/web3       → src/web3
```

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Web3:** wagmi, viem (externalized as peer dependencies)
- **Build:** Rollup (production), Vite (development), esbuild (transpilation)
- **Styling:** PostCSS with autoprefixer, cssnano
- **Documentation:** Storybook 8
- **Icons:** lucide-react

## Code Style

Prettier enforced: double quotes, semicolons, trailing commas (ES5), 80 char line width, 2-space indent.

## Package Exports

The library exports components, constants, types, utils, hooks, web3 utilities, and theme. Styles are exported separately via `@thenamespace/ens-components/styles`.
