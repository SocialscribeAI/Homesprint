# UI Package 🎨

Shared design system components, tokens, and utilities for HomeSprint's user interface.

## Overview

This package provides a cohesive design system for HomeSprint, featuring a warm and futuristic aesthetic. It includes design tokens, reusable components, and styling utilities built with Tailwind CSS and Radix UI primitives.

## Design Philosophy

HomeSprint's design combines:
- **Warm colors**: Sandstone, cloud, and apricot tones for approachability
- **Futuristic elements**: Mint accents and subtle glows for modern feel
- **Clean typography**: Manrope for headings, Inter for body text
- **Accessible components**: Built on Radix UI primitives

## Design Tokens

### Colors

```typescript
colors: {
  cloud: "#FAFAFA",      // Backgrounds, cards
  sandstone: "#F3EDE4",  // Secondary backgrounds
  midnight: "#0F172A",   // Text, dark elements
  mint: "#2AD5C1",       // Primary actions, accents
  apricot: "#FFBCA9",    // Secondary accents
}
```

### Typography

- **Sans**: Manrope (headings, UI elements)
- **Body**: Inter (paragraphs, labels)

### Border Radius

```typescript
radius: {
  "2xl": "1rem",     // Cards, inputs
  "3xl": "1.5rem",   // Large elements
  pill: "9999px",    // Buttons, badges
}
```

### Shadows

```typescript
shadows: {
  float: "0 20px 40px -12px rgba(15, 23, 42, 0.1)",  // Cards, modals
  glow: "0 0 20px rgba(42, 213, 193, 0.3)",          // Interactive elements
}
```

## Components

### Button Component

```typescript
import { Button } from '@homesprint/ui'

// Basic usage
<Button>Click me</Button>

// With props
<Button type="submit" disabled>Submit</Button>
```

## Usage

### Importing Components

```typescript
import { Button } from '@homesprint/ui'
```

### Importing Design Tokens

```typescript
import { tokens } from '@homesprint/ui/theme'
```

### In Tailwind CSS

Use the design tokens in your Tailwind classes:

```jsx
<div className="bg-cloud text-midnight shadow-float rounded-2xl">
  Content
</div>
```

## Development Guidelines

### Component Patterns

1. **Use TypeScript** for all components
2. **Extend native props** using `React.ComponentProps`
3. **Support ref forwarding** with `React.forwardRef`
4. **Use design tokens** instead of hardcoded values
5. **Follow accessibility guidelines** with Radix UI primitives

### Component Structure

```typescript
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'clsx'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-pill font-sans font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-mint text-midnight hover:bg-mint/90 shadow-glow',
        secondary: 'bg-sandstone text-midnight hover:bg-sandstone/80',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
```

### Adding New Components

1. Create component in `src/components/`
2. Export from `src/index.ts`
3. Add TypeScript types
4. Follow existing naming conventions
5. Include variants using `class-variance-authority`
6. Test accessibility

### Design System Updates

When updating the design system:

1. Update tokens in `src/theme/tokens.ts`
2. Update Tailwind config if needed
3. Update component variants
4. Update documentation
5. Test across all apps

## Integration

This package is used by all HomeSprint applications. Import components and tokens as needed:

```typescript
// Components
import { Button } from '@homesprint/ui'

// Design tokens
import { tokens } from '@homesprint/ui/theme'
```

The package is built with TypeScript and exports both ESM and CJS formats for maximum compatibility.
