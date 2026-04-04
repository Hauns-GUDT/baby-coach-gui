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