# Phase 1: Project Initialization & Core Setup

**Duration**: 3-4 hours  
**Difficulty**: Easy  
**Prerequisites**: Node.js 18+, npm/yarn, code editor

## Overview

This phase establishes the project foundation with proper tooling, configuration, and project structure. We'll use Vite for fast development and optimized builds.

## Objectives

- [ ] Initialize React + TypeScript project with Vite
- [ ] Configure TypeScript for strict type checking
- [ ] Set up SCSS with proper architecture
- [ ] Configure ESLint and Prettier
- [ ] Create project folder structure
- [ ] Set up environment variables
- [ ] Configure Git and .gitignore

## Step-by-Step Instructions

### Step 1: Create Vite Project

```bash
# Navigate to your workspace
cd /path/to/workspace

# Create new Vite project
npm create vite@latest elotus-movies -- --template react-ts

# Navigate into project
cd elotus-movies

# Install dependencies
npm install
```

**Expected Output**: A new React + TypeScript project with Vite configuration.

### Step 2: Install Additional Dependencies

```bash
# SCSS support
npm install -D sass

# React Router for navigation
npm install react-router-dom
npm install -D @types/react-router-dom

# ESLint and Prettier
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Optional: for environment variable type safety
npm install -D @types/node
```

### Step 3: Configure TypeScript

Update `tsconfig.json` with strict settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting - STRICT MODE */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/constants/*": ["./src/constants/*"],
      "@/contexts/*": ["./src/contexts/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 4: Configure Vite for Path Aliases

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/styles': path.resolve(__dirname, './src/styles')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/abstracts/variables"; @import "@/styles/abstracts/mixins";`
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
```

### Step 5: Create ESLint Configuration

Create `.eslintrc.cjs`:

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/prop-types': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
```

### Step 6: Create Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Create `.prettierignore`:

```
dist
build
coverage
node_modules
*.min.js
*.min.css
```

### Step 7: Create Project Folder Structure

```bash
# Create all directories at once
mkdir -p src/{components/{common,layout,features},pages,hooks,services,contexts,types,utils,constants,styles/{abstracts,base,layout,themes},assets/{images,icons}}
```

Detailed structure:
```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Loader/
│   │   ├── ErrorMessage/
│   │   └── Image/
│   ├── layout/              # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── TabBar/
│   │   └── Container/
│   └── features/            # Feature-specific components
│       ├── MovieCard/
│       ├── MovieList/
│       ├── MovieGrid/
│       ├── SearchBar/
│       └── MovieDetail/
├── pages/
│   ├── HomePage/
│   ├── MovieDetailPage/
│   └── NotFoundPage/
├── hooks/
│   ├── useMovies.ts
│   ├── useSearch.ts
│   ├── useDebounce.ts
│   ├── useLazyImage.ts
│   └── useIntersectionObserver.ts
├── services/
│   ├── api/
│   │   ├── client.ts        # Base API client
│   │   ├── movies.service.ts
│   │   └── search.service.ts
│   └── cache/
│       └── cache.service.ts
├── contexts/
│   ├── AppContext.tsx
│   └── ErrorBoundary.tsx
├── types/
│   ├── movie.types.ts
│   ├── api.types.ts
│   └── common.types.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
├── constants/
│   ├── api.constants.ts
│   ├── routes.constants.ts
│   └── app.constants.ts
├── styles/
│   ├── abstracts/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _functions.scss
│   │   └── _breakpoints.scss
│   ├── base/
│   │   ├── _reset.scss
│   │   ├── _typography.scss
│   │   └── _animations.scss
│   ├── layout/
│   │   ├── _grid.scss
│   │   └── _container.scss
│   └── themes/
│       └── _default.scss
├── assets/
│   ├── images/
│   └── icons/
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

### Step 8: Set Up Environment Variables

Create `.env.example`:

```bash
# TMDB API Configuration
VITE_TMDB_API_KEY=your_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# App Configuration
VITE_APP_TITLE=Movies App
VITE_CACHE_DURATION=300000
```

Create `.env.local` (add your actual API key):

```bash
VITE_TMDB_API_KEY=your_actual_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
VITE_APP_TITLE=Movies App
VITE_CACHE_DURATION=300000
```

Create `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_API_KEY: string
  readonly VITE_TMDB_BASE_URL: string
  readonly VITE_TMDB_IMAGE_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_CACHE_DURATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Step 9: Update .gitignore

Add to `.gitignore`:

```
# Environment variables
.env.local
.env.*.local
.env.production

# IDE
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build
dist
dist-ssr
*.local

# Dependencies
node_modules

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Testing
coverage
```

### Step 10: Update package.json Scripts

Add/update scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,scss,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,scss,css}\"",
    "type-check": "tsc --noEmit"
  }
}
```

### Step 11: Create Initial SCSS Files

Create `src/styles/abstracts/_variables.scss`:

```scss
// Colors
$primary-color: #e50914;
$secondary-color: #221f1f;
$background-color: #141414;
$surface-color: #1f1f1f;
$text-primary: #ffffff;
$text-secondary: #b3b3b3;
$error-color: #f44336;
$success-color: #4caf50;
$warning-color: #ff9800;

// Spacing
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
$spacing-2xl: 3rem;     // 48px

// Typography
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
$font-size-xs: 0.75rem;   // 12px
$font-size-sm: 0.875rem;  // 14px
$font-size-md: 1rem;      // 16px
$font-size-lg: 1.25rem;   // 20px
$font-size-xl: 1.5rem;    // 24px
$font-size-2xl: 2rem;     // 32px

// Breakpoints
$breakpoint-mobile: 320px;
$breakpoint-mobile-lg: 480px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;
$breakpoint-desktop-lg: 1440px;
$breakpoint-desktop-xl: 1920px;

// Z-index
$z-index-dropdown: 1000;
$z-index-sticky: 1020;
$z-index-fixed: 1030;
$z-index-modal-backdrop: 1040;
$z-index-modal: 1050;
$z-index-popover: 1060;
$z-index-tooltip: 1070;

// Transitions
$transition-fast: 150ms ease-in-out;
$transition-base: 300ms ease-in-out;
$transition-slow: 500ms ease-in-out;

// Border radius
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-xl: 16px;

// Shadows
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

Create `src/styles/abstracts/_mixins.scss`:

```scss
@use 'variables' as *;
@use 'breakpoints' as *;

// Responsive breakpoints
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// Flexbox shortcuts
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flex-column {
  display: flex;
  flex-direction: column;
}

// Text truncation
@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin line-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Positioning
@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// Transitions
@mixin transition($properties...) {
  transition-duration: $transition-base;
  transition-timing-function: ease-in-out;
  transition-property: $properties;
}

// Aspect ratio
@mixin aspect-ratio($width, $height) {
  position: relative;
  
  &::before {
    content: '';
    display: block;
    padding-top: calc(($height / $width) * 100%);
  }
  
  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

// Focus styles
@mixin focus-visible {
  &:focus-visible {
    outline: 2px solid $primary-color;
    outline-offset: 2px;
  }
}
```

Create `src/styles/abstracts/_breakpoints.scss`:

```scss
$breakpoints: (
  'mobile': 320px,
  'mobile-lg': 480px,
  'tablet': 768px,
  'desktop': 1024px,
  'desktop-lg': 1440px,
  'desktop-xl': 1920px
);
```

Create `src/styles/base/_reset.scss`:

```scss
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

ul,
ol {
  list-style: none;
}
```

### Step 12: Initialize Git Repository

```bash
git init
git add .
git commit -m "chore: initial project setup with React, TypeScript, and SCSS"
```

### Step 13: Verify Setup

```bash
# Run type check
npm run type-check

# Run linter
npm run lint

# Start dev server
npm run dev
```

## Verification Checklist

- [ ] Project builds without errors
- [ ] TypeScript strict mode is working
- [ ] Dev server starts on port 3000
- [ ] SCSS files compile correctly
- [ ] ESLint runs without errors
- [ ] Path aliases work correctly
- [ ] Environment variables are loaded
- [ ] Git repository is initialized

## Common Issues & Solutions

### Issue 1: Path Aliases Not Working
**Solution**: Restart the TypeScript server in your IDE and clear Vite cache:
```bash
rm -rf node_modules/.vite
npm run dev
```

### Issue 2: SCSS Import Errors
**Solution**: Ensure SCSS files use `@use` instead of `@import` and proper namespacing.

### Issue 3: TypeScript Errors on Path Imports
**Solution**: Check that `tsconfig.json` and `vite.config.ts` have matching path configurations.

## Next Steps

Proceed to **Phase 2: API Integration & Core Services** where we'll:
- Set up the TMDB API client
- Create service layer for movies
- Implement error handling
- Set up caching mechanism

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SCSS Documentation](https://sass-lang.com/documentation)
- [React Router](https://reactrouter.com/)

