# Agent Instructions

> This file is read automatically by AI agents. It describes the project, design language, conventions, and available skills.

---

## Project Overview

**Project:** `to do web`
**Stack:** [Astro](https://astro.build) (static-site generator, basics template)
**Location:** `./retrograde-remnant/`
**Dev server:** `npm run dev` → `http://localhost:4321`

This is an Astro-based web project styled after an **Apple-inspired design language** — photography-first, minimal chrome, single-accent-color interactive system. The full design specification lives in [`DESIGN.md`](./DESIGN.md).

---

## Project Structure

```
/
├── retrograde-remnant/       # Main Astro project
│   ├── public/               # Static assets (favicon, etc.)
│   ├── src/
│   │   ├── assets/           # Images and SVGs
│   │   ├── components/       # Reusable .astro components
│   │   ├── layouts/          # Page layout wrappers
│   │   └── pages/            # File-based routing (.astro pages)
│   ├── astro.config.mjs
│   └── package.json
├── .agents/skills/           # Installed agent skills (see below)
├── DESIGN.md                 # Full design-system specification (YAML frontmatter + docs)
├── skills-lock.json          # Skill lockfile
└── agent.md                  # ← You are here
```

---

## Design System

The design system is fully documented in [`DESIGN.md`](./DESIGN.md). **Always read it before writing any UI code.** Key principles:

### Philosophy
- **Photography-first.** UI chrome recedes — the product or content is the hero.
- **Single accent color.** `#0066cc` (Action Blue) is the only interactive color. No second brand color.
- **No decorative gradients, no shadows on chrome.** The only drop-shadow is on product imagery: `rgba(0,0,0,0.22) 3px 5px 30px`.
- **Tile-based rhythm.** Alternating full-bleed light (`#ffffff` / `#f5f5f7`) and dark (`#272729`) sections — the color change *is* the divider.

### Core Tokens (quick reference)

| Token | Value | Use |
|---|---|---|
| `primary` | `#0066cc` | All links, CTAs, focus rings |
| `primary-on-dark` | `#2997ff` | Links on dark tiles only |
| `ink` | `#1d1d1f` | All body text on light surfaces |
| `canvas` | `#ffffff` | Main light surface |
| `canvas-parchment` | `#f5f5f7` | Alternating light surface, footer |
| `surface-tile-1` | `#272729` | Primary dark tile |
| `surface-black` | `#000000` | Global nav bar only |

### Typography
- **Display headlines:** SF Pro Display → substitute with `Inter` (variable, weight 600, `letter-spacing: -0.01em`).
- **Body:** SF Pro Text → substitute with `Inter` at 17px / 400 / line-height 1.47.
- **Body is always 17px, not 16px.**
- Weight ladder: **300 / 400 / 600 / 700** — weight 500 is deliberately absent.

### Buttons
- **Primary CTA:** `border-radius: 9999px` (full pill), `background: #0066cc`, `padding: 11px 22px`.
- **Active state:** `transform: scale(0.95)` on every button — no color change.
- **Never** use shadows on buttons or cards.

### Spacing
Base unit is **8px**. Section vertical padding is **80px**. Card padding is **24px**.

---

## Available Skills

The following agent skills are installed under `.agents/skills/`. Invoke the appropriate skill when working on related tasks.

| Skill | Trigger | Description |
|---|---|---|
| [`astro`](./.agents/skills/astro/SKILL.md) | Working with `.astro` files, SSR, content collections, routing | Astro framework patterns and CLI |
| [`design-taste-frontend`](./.agents/skills/design-taste-frontend/SKILL.md) | Landing pages, portfolios, redesigns, "make it look good" | Anti-template frontend design system |
| [`grill-me`](./.agents/skills/grill-me/SKILL.md) | Stress-testing a plan, "grill me on this" | Relentless interview to resolve design decisions |
| [`shadcn`](./.agents/skills/shadcn/SKILL.md) | shadcn/ui components, `components.json`, component registry | shadcn component management |
| [`ui-ux-pro-max`](./.agents/skills/ui-ux-pro-max/SKILL.md) | UI/UX design, color palettes, font pairings, dashboards | Comprehensive UI/UX intelligence |
| [`web-design-guidelines`](./.agents/skills/web-design-guidelines/SKILL.md) | "Review my UI", accessibility audit, best-practices check | Web interface guidelines compliance |

> **Rule:** Before writing UI code, check if a relevant skill exists and read its `SKILL.md`.

---

## Development Commands

All commands run from `./retrograde-remnant/`:

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro ...` | Run Astro CLI commands |

---

## Coding Conventions

1. **Components** go in `src/components/` as `.astro` files.
2. **Layouts** go in `src/layouts/` — wrap pages with `<Layout>` from `Layout.astro`.
3. **Pages** go in `src/pages/` — file name = route (e.g., `src/pages/about.astro` → `/about`).
4. **No inline hex values** — always reference the design token name in a comment or CSS variable.
5. **CSS:** Vanilla CSS or `<style>` blocks inside `.astro` files. Scoped styles are preferred.
6. **Images:** Place in `src/assets/` and import them for Astro's image optimization pipeline. Use `srcset` for responsive images.
7. **No Tailwind** unless explicitly requested by the user.
8. **Accessibility:** Every interactive element needs a unique, descriptive `id`. Minimum touch target is 44×44px.
9. **SEO:** Every page needs a `<title>`, `<meta name="description">`, a single `<h1>`, and semantic HTML5 elements.

---

## Design Do's and Don'ts

### ✅ Do
- Use `#0066cc` for every interactive element — and nothing else.
- Set body text at **17px**, not 16px.
- Alternate light and dark full-bleed tile sections for rhythm.
- Use `transform: scale(0.95)` as the universal press/active state.
- Apply `border-radius: 9999px` (pill) to primary CTAs and search inputs.
- Reserve the product shadow (`rgba(0,0,0,0.22) 3px 5px 30px`) for imagery only.

### ❌ Don't
- Don't introduce a second accent color.
- Don't add shadows to cards, buttons, or text.
- Don't use CSS gradients as decorative backgrounds.
- Don't use `font-weight: 500` — the ladder is 300/400/600/700.
- Don't set body `line-height` below 1.47.
- Don't round full-bleed tile sections — tiles are edge-to-edge rectangles.

---

## Responsive Breakpoints

| Name | Width | Notes |
|---|---|---|
| Wide desktop | ≥ 1441px | Content locks at 1440px max-width |
| Desktop | 1069–1440px | Full layout, 4–5 col grids |
| Small desktop | 1024–1068px | 2/3 width tiles, margins |
| Tablet landscape | 834–1023px | Full nav, 2–3 col grids |
| Tablet portrait | 736–833px | Hamburger nav, sub-nav simplified |
| Large phone | 641–735px | Tighter padding (48px vertical) |
| Phone | 420–640px | Single-column, hero h1 → 34px |
| Small phone | ≤ 419px | Single-column, hero h1 → 28px |
