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
- Cards: `bg-white rounded-2xl border border-blue-grey-100` (no shadows on cards)
- Page backgrounds: `bg-blue-grey-50`
- Form inputs: `border border-blue-grey-200 rounded-xl focus:ring-2 focus:ring-twilight-indigo-300`

## State
- Use Zustand via existing hooks
- Avoid prop drilling

## Components
- Reuse existing components
- Keep components small and focused

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