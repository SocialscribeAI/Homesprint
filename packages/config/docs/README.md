# Config Package ⚙️

Shared configuration presets for TypeScript, ESLint, and Tailwind CSS across the HomeSprint monorepo.

## Overview

This package provides centralized configuration for development tools used across all HomeSprint packages and applications. It ensures consistent code quality, styling, and TypeScript settings throughout the monorepo.

## Configurations

### TypeScript (`tsconfig`)

Base TypeScript configuration with:
- ES2020 target for modern JavaScript features
- Strict type checking enabled
- JSON module resolution
- Base URL configuration for monorepo paths

### ESLint

Code quality and consistency rules:
- TypeScript-specific linting rules
- Import/export validation
- Code style enforcement
- Accessibility checks

### Tailwind CSS

Design system integration:
- Custom color tokens (cloud, sandstone, midnight, mint, apricot)
- Typography settings (Manrope, Inter fonts)
- Border radius scales (2xl, 3xl, pill)
- Shadow utilities (float, glow)
- Responsive breakpoints

## Usage

### TypeScript

Extend the base configuration in your package's `tsconfig.json`:

```json
{
  "extends": "@homesprint/config/tsconfig",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "jsx": "preserve"
  }
}
```

### ESLint

In your package's `package.json`:

```json
{
  "eslintConfig": {
    "extends": ["@homesprint/config/eslint"]
  }
}
```

### Tailwind CSS

In your `tailwind.config.ts`:

```typescript
import { config } from '@homesprint/config/tailwind'

export default config({
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Your custom extensions
    }
  }
})
```

## Development

### Setting up Configurations

1. Create configuration files in respective directories:
   ```
   packages/config/
   ├── eslint/
   │   └── index.js
   ├── tailwind/
   │   └── index.ts
   └── tsconfig/
       └── base.json
   ```

2. Export configurations for consumption by other packages

3. Update package.json exports to include config paths

### ESLint Configuration Example

```javascript
// packages/config/eslint/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    // Custom rules for HomeSprint
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/order': ['error', { 'newlines-between': 'always' }]
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true
    }
  }
}
```

### Tailwind Configuration Example

```typescript
// packages/config/tailwind/index.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        cloud: '#FAFAFA',
        sandstone: '#F3EDE4',
        midnight: '#0F172A',
        mint: '#2AD5C1',
        apricot: '#FFBCA9'
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif']
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        pill: '9999px'
      },
      boxShadow: {
        float: '0 20px 40px -12px rgba(15, 23, 42, 0.1)',
        glow: '0 0 20px rgba(42, 213, 193, 0.3)'
      }
    }
  }
}

export default config
```

## Integration

This package is imported by all other packages and applications in the monorepo. Each package extends these base configurations to maintain consistency while allowing for package-specific customizations.

### Current Status

This package is currently a placeholder. To fully implement:

1. Create the actual configuration files
2. Set up proper exports in package.json
3. Test integration across packages
4. Document specific configuration options

## Benefits

- **Consistency**: Unified development standards across teams
- **Maintainability**: Single source of truth for configurations
- **Scalability**: Easy to update rules across the entire monorepo
- **Developer Experience**: Standardized tooling and editor support
