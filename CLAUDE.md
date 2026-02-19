# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Adobe AEM Edge Delivery Services (EDS) project for AT&T. It uses a block-based architecture with dynamic JSON2HTML content transformation capabilities.

## Architecture

### Block-Based EDS Architecture

The site uses AEM Edge Delivery Services with a modular block system:

- **Blocks** (`/blocks/`): Self-contained UI components (cards, columns, footer, fragment, header, hero). Each block has its own CSS and JS that load on-demand.
- **Scripts** (`/scripts/`): Core initialization and utilities
  - `scripts.js`: Main entry point with page lifecycle (eager, lazy, delayed loading)
  - `aem.js`: Block decoration, loading utilities, RUM (Real User Monitoring), and helper functions
  - `delayed.js`: Deferred loading for non-critical resources
- **Styles** (`/styles/`): Global styles and lazy-loaded styles
- **Templates** (`/templates/`): Mustache templates for JSON2HTML transformation

### Loading Strategy

The page loading follows a three-phase strategy defined in `scripts/scripts.js`:

1. **Eager** (`loadEager`): Critical above-the-fold content (LCP optimization)
   - Template/theme decoration
   - Main content decoration
   - First section load
   - Font loading on desktop or cached fonts

2. **Lazy** (`loadLazy`): Content that doesn't need to be immediate
   - Header and footer
   - Remaining sections
   - Hash navigation

3. **Delayed** (`loadDelayed`): Non-critical resources loaded 3+ seconds after page load

### JSON2HTML Integration

The project uses Adobe's JSON2HTML worker to transform AT&T API responses into EDS-friendly HTML:

- **Configuration**: Defined in `json2html.rest` (path patterns, endpoints, templates)
- **Template**: `templates/support-center.html` (Mustache template)
- **Data Flow**: URL request → Path match → API fetch → Template render → HTML response
- **Use Case**: Dynamic content from AT&T KMServices API (e.g., support center topics)

For architectural details, see `JSON2HTML_ARCHITECTURE.md`. For implementation details, see `JSON2HTML_IMPLEMENTATION.md`.

### Auto-Blocking

The `buildAutoBlocks` function in `scripts/scripts.js` automatically creates blocks:
- **Hero blocks**: Auto-generated when h1 precedes a picture
- **Fragments**: Auto-loaded from `/fragments/` paths

### Block Loading

Blocks are lazily loaded:
1. Block detected and decorated with `decorateBlock`
2. CSS and JS fetched on-demand via `loadBlock`
3. Block's default export function executed
4. Block marked as loaded

## Development Commands

### Installation
```sh
npm i
```

### Linting
```sh
npm run lint          # Run all linters (JS + CSS)
npm run lint:js       # ESLint only
npm run lint:css      # Stylelint only
npm run lint:fix      # Auto-fix linting issues
```

### Local Development

1. Install AEM CLI: `npm install -g @adobe/aem-cli`
2. Start AEM Proxy: `aem up`
3. Opens browser at `http://localhost:3000`

The AEM CLI proxies requests to the EDS infrastructure while serving local changes.

## Skills-Based Workflow

**IMPORTANT**: This project uses a skills-based development workflow. Skills are in `.skills/` and provide specialized workflows for common tasks.

### Discovering Skills

Run `./.agents/discover-skills` to list available skills without loading full context.

### Using Skills

1. Read the full `SKILL.md` file for the relevant skill
2. Announce usage: "Using Skill: {Skill Name}"
3. Follow instructions exactly as written
4. Skills may reference other skills - apply them in sequence

### Primary Skill

**For ALL development work involving blocks, core scripts, or functionality, you MUST start with the `content-driven-development` skill.** It orchestrates other skills throughout the development workflow.

### Available Skills

- `content-driven-development`: Primary workflow for development
- `block-collection-and-party`: Search and discover existing blocks
- `code-review`: Capture and review screenshots
- `scrape-webpage`: Analyze and import webpage content
- `docs-search`: Search AEM documentation
- Additional skills in `.skills/` directory

## Key Conventions

### Block Structure

Each block follows this pattern:
```
blocks/{block-name}/
  {block-name}.js    # Block logic (default export function)
  {block-name}.css   # Block styles
```

Block JS must export a default async function that takes the block element as parameter.

### Decoration Functions

Core decoration functions from `aem.js`:
- `decorateButtons`: Auto-converts single-link paragraphs to buttons (strong → primary, em → secondary)
- `decorateIcons`: Converts `<span class="icon icon-*">` to SVG images
- `decorateSections`: Wraps content in section containers with metadata support
- `decorateBlocks`: Adds block classes and wrappers

### Utility Functions

- `toClassName(name)`: Sanitizes strings for CSS class names
- `toCamelCase(name)`: Converts to camelCase for JS properties
- `readBlockConfig(block)`: Extracts configuration from block table structure
- `createOptimizedPicture(src, alt, eager, breakpoints)`: Creates responsive picture elements with WebP
- `getMetadata(name)`: Retrieves metadata from `<meta>` tags

### Performance

- Use `sampleRUM(checkpoint, data)` for Real User Monitoring
- First section waits for first image (`waitForFirstImage`) for LCP optimization
- Fonts load conditionally (desktop/cached only) to avoid layout shift

## Documentation Files

The repository contains several solution design documents for specific features:
- `JSON2HTML_*.md`: JSON2HTML architecture, implementation, and reference
- `*_EDS_SOLUTION*.md`: Various EDS solution designs (lead forms, SEO, YouTube embeds, etc.)
- `AGENTS.md`: Skills workflow documentation
