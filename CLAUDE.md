# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server on http://localhost:3000
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm generate` - Generate static site

### Package Management
- This project uses **pnpm** as the package manager
- `pnpm install` - Install dependencies
- `pnpm postinstall` - Runs automatically after install to prepare Nuxt

### Linting
- ESLint is configured via `eslint.config.mjs` extending `.nuxt/eslint.config.mjs`
- No explicit lint script in package.json - linting is handled by Nuxt's built-in ESLint integration

## Architecture Overview

This is a Nuxt 3 application with the following structure:

### Framework Stack
- **Nuxt 3.17.6** with Vue 3.5.17
- **TypeScript** support extending `.nuxt/tsconfig.json`
- **UnoCSS** for atomic CSS with custom theme configuration
- **Sass** for additional styling with custom base styles

### Key Modules & Configuration
- `@nuxt/eslint` - ESLint integration
- `@nuxt/image` - Image optimization
- `@unocss/nuxt` - Atomic CSS framework
- Custom UnoCSS theme with predefined color palette (primary, secondary, third, grayscale)
- Custom shortcuts for buttons and layout components

### Project Structure
- **`pages/`** - File-based routing with Vue components
  - `index.vue` - Homepage 
  - `ai-resume-detect.vue` - AI resume detection page
  - `bc.vue` - Business card page
- **`assets/`** - Static assets and global styles
  - `styles/base.scss` - Global SCSS styles with custom font and base styling
  - `images/ai/` - AI-related images and icons
- **`server/`** - Server-side code with separate TypeScript config
- **`public/`** - Static public assets (favicon, robots.txt)

### Styling Architecture
- **UnoCSS** with Wind preset for utility-first CSS
- Custom color system with primary (orange tones), secondary (teal/green), and third (blue/purple) palettes
- Predefined button components with variants (primary/secondary) and sizes (sm/md/lg)
- Custom shortcuts for common patterns like `layout-card` and `prefix-icon-*`
- Global SCSS for font loading (Microsoft JhengHei) and base element styles

### Development Notes
- Uses Nuxt's auto-generated configurations in `.nuxt/` directory
- File-based routing through the `pages/` directory
- TypeScript configurations extend Nuxt's generated configs
- Server-side code has separate TypeScript configuration
- Custom font loading for Microsoft JhengHei with fallbacks