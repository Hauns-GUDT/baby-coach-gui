# Baby Coach GUI - Context Guide

## Project Overview
React app for baby coaching with mobile-first responsive design using Tailwind CSS and Zustand for state management.

## Tech Stack
- **Framework**: React
- **Styling**: Tailwind CSS (utility-first, no inline styles)
- **State Management**: Zustand
- **Target**: Mobile phone and responsive web

## Key Guidelines

### Styling
- Use Tailwind CSS utility classes exclusively
- NO inline styles
- Mobile-first approach: design for mobile, then extend with responsive modifiers
- Use responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Leverage Tailwind's spacing, sizing, and color utilities

### State Management
- Use Zustand for global state
- Keep stores in separate files: `src/store/[storeName].ts`
- Use custom hooks to access store state: `useStore()`
- Minimize prop drilling

### Mobile Optimization
- Touch-friendly button sizes (min 44x44px)
- Readable font sizes on small screens
- Vertical layouts on mobile, horizontal on larger screens
- Safe spacing for mobile UI edges
- Optimized performance for mobile devices

### Component Structure
- Functional components with React hooks
- Reusable, modular components
- Props-based configuration
- Keep components focused and single-responsibility

### Code Standards
- Use TypeScript for type safety
- Import Tailwind styles globally in main entry
- Avoid CSS-in-JS solutions
- Keep file organization clean and organized
