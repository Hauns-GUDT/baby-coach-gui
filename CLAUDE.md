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

## Git Workflow

For every change (feature, fix, refactor):
1. Create a new branch from `main` with a descriptive name (e.g. `feature/...`, `fix/...`, `refactor/...`)
2. Commit changes on that branch
3. Push the branch to origin
4. Open a pull request targeting `main`

Never commit directly to `main`.

## API Layer

### Service / Hook Pattern (mandatory)
- **Never call `axiosClient` directly from a component or page.** All API calls go through a service function, which is then wrapped in a custom hook.
- Services live in `src/api/[domain]Service.js` — plain async functions, no React, no store imports.
- Hooks live in `src/hooks/use[Domain].js` — call the service, handle loading/error state, update Zustand stores.
- Components only import hooks, never services or axiosClient directly.

```
src/api/axiosClient.js      ← shared axios instance (interceptors only)
src/api/authService.js      ← login(), logout(), refresh()
src/api/chatService.js      ← sendMessage()
src/api/sleepService.js     ← getSleepData()

src/hooks/useLogin.js       ← calls authService.login, updates store, navigates
src/hooks/useLogout.js      ← calls authService.logout, clears store, navigates
src/hooks/useSilentRefresh.js ← calls authService.refresh on app load
src/hooks/useChat.js        ← calls chatService.sendMessage, reads/writes useChatStore
src/hooks/useSleep.js       ← calls sleepService.getSleepData, reads/writes useSleepStore
```

- Use `axiosClient` for all HTTP calls — never raw `fetch`. Absolute URLs (e.g. `http://localhost:8000/...`) are supported and will bypass the configured baseURL.

## Authentication

- Auth state (accessToken, username, isAuthenticated) lives in `src/store/useAuthStore.js` — in-memory only, never persisted to localStorage
- All API calls must use `src/api/axiosClient.js` (not raw fetch or a new axios instance)
- The axiosClient attaches `Authorization: Bearer <token>` automatically and silently refreshes on 401
- The refresh token is an httpOnly cookie managed entirely by the backend — never read or written in frontend code
- All routes except `/login` are wrapped in `<ProtectedRoute>`
- On app load, `useSilentRefresh` hook (used in `App.jsx`) attempts a silent refresh before rendering routes
