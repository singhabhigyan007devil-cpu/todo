# Project Skills

This project uses custom agent skills located in `.claude/skills/`. Below is a reference for available skills and their purpose.

## Available Skills

### hyperframes
**Path:** `.claude/skills/hyperframes/`
**Description:** Video composition in HTML — create title cards, animations, overlays, captions, voiceovers, audio-reactive visuals, and scene transitions using GSAP timelines and `data-*` attributes. Covers the full video production workflow.

### astro
**Path:** `.claude/skills/astro/`
**Description:** Build with the Astro web framework — components, pages, SSR adapters, content collections, static site generation.

### design-taste-frontend
**Path:** `.claude/skills/design-taste-frontend/`
**Description:** Anti-slop frontend design for landing pages, portfolios, and redesigns with real design systems and pre-flight checks.

### grill-me
**Path:** `.claude/skills/grill-me/`
**Description:** Interview the user relentlessly about a plan or design until reaching shared understanding. Use when the user wants to stress-test a plan.

### shadcn
**Path:** `.claude/skills/shadcn/`
**Description:** Manage shadcn/ui components — add, search, fix, debug, style, and compose UI in projects with a `components.json` file.

### ui-ux-pro-max
**Path:** `.claude/skills/ui-ux-pro-max/`
**Description:** UI/UX design intelligence for web and mobile — 50+ styles, 161 color palettes, font pairings, UX guidelines, and chart types across 10 stacks.

### web-design-guidelines
**Path:** `.claude/skills/web-design-guidelines/`
**Description:** Review UI code for web interface guidelines compliance — accessibility, design audit, UX review.

## Usage Notes

- Skills are referenced by name in conversation. The agent loads the skill's SKILL.md for detailed instructions.
- The todo app (in `todo-app/`) uses React + Vite + TypeScript + Tailwind CSS v4.
