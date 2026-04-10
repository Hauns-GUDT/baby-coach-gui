# Baby Coach GUI - Context Guide

## Core Rules
- Modify existing code instead of creating new structures
- Keep changes minimal and consistent
- Read the codebase before acting

## Comments (For Claude Understanding)
- Add short inline comments to explain non-obvious logic
- Comments are primarily for faster code scanning and understanding
- Do not comment obvious code

## UI & Responsiveness
- Mobile-first always
- Use Tailwind only (no inline styles)
- Ensure touch-friendly UI (min ~44px targets)
- Prefer simple, clean layouts

## Theme & Colors
- Always use the custom color palette — never default Tailwind colors (no `zinc`, `gray`, `slate`, `indigo`, `orange`, `amber`)
- Neutrals: `blue-grey-*` (replaces zinc/gray/slate)
- Primary: `twilight-indigo-*` (replaces indigo)
- Accent/warm: `light-apricot-*` (replaces orange/amber)
- Errors/danger: `rose-*` (keep as-is)
- Success: `emerald-*` (keep as-is, no custom equivalent)
- Cards: `bg-white rounded-2xl border border-blue-grey-100 dark:bg-navy-700 dark:border-navy-600` (no shadows on cards)
- Page backgrounds: `bg-blue-grey-50 dark:bg-navy-800`
- Form inputs: always import and use `inputClass` from `src/shared/utils/inputClass.js` — never write input styles manually

## Dark Mode
- Every component must support dark mode via Tailwind `dark:` variants
- Dark neutrals: `dark:bg-navy-*`, `dark:border-navy-*`, `dark:text-navy-*`
- Text on dark: `dark:text-navy-50` (primary), `dark:text-navy-200` (secondary/muted)
- Never hardcode light-only styles without a `dark:` counterpart

## State
- Use Zustand via existing hooks
- Avoid prop drilling

## Components
- Reuse existing components
- Keep components small and focused
- Form inputs: always use `inputClass` from `src/shared/utils/inputClass.js`
- Cards/panels: always use `panelClass` or `panelBase` from `src/shared/utils/inputClass.js`
- Check `src/shared/components/` before creating any new component

## i18n
- No hardcoded text
- Always use `t()`

## API
- Components → Hooks → Services
- No direct API calls in components

## Avoid
- Rewriting working code
- Overengineering
- Creating new patterns unnecessarily