# JWT Authentication — Frontend Design

**Date:** 2026-03-31
**Status:** Approved

## Overview

Add JWT authentication to the Baby Coach GUI. Users log in with email/username + password. The access token lives in-memory (Zustand), the refresh token lives in an httpOnly cookie managed by the backend. Axios handles token attachment and silent refresh. All routes are protected.

---

## Backend Contract (summary)

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/login` | POST | `{ login, password }` → `{ accessToken }` + sets httpOnly refresh cookie |
| `/auth/refresh` | POST | Reads cookie → `{ accessToken }` + rotates refresh cookie |
| `/auth/logout` | POST | Protected — deletes refresh token row, clears cookie |

- Access token: JWT, 15min lifetime, payload `{ sub: userId, username }`
- Refresh token: httpOnly cookie, `sameSite: strict`, 7d lifetime, rotated on every use

---

## Architecture

### New files

| File | Purpose |
|---|---|
| `src/api/axiosClient.js` | Axios instance + request/response interceptors |
| `src/store/useAuthStore.js` | Zustand store for auth state |
| `src/pages/Login.jsx` | Login form page |
| `src/pages/Profile.jsx` | Profile/settings page with logout |
| `src/components/ProtectedRoute.jsx` | Route guard component |

### Modified files

| File | Change |
|---|---|
| `src/App.jsx` | Add `/login`, `/profile` routes; wrap existing routes in `ProtectedRoute`; silent refresh on mount |
| `src/components/Navigation.jsx` | Add Profile link; hide nav when unauthenticated |
| `src/i18n/locales/en/translation.json` | Add `auth` and `profile` i18n keys |
| `src/i18n/locales/de/translation.json` | Same in German |
| `CLAUDE.md` | Document auth pattern |

---

## Zustand Auth Store (`useAuthStore`)

```js
{
  accessToken: null,       // string | null — in-memory only
  username: null,          // string | null
  isAuthenticated: false,  // derived from accessToken !== null
  setAuth(accessToken, username),  // called after login or refresh
  clearAuth(),             // called on logout or failed refresh
}
```

---

## Axios Client (`axiosClient`)

- `baseURL`: `import.meta.env.VITE_API_URL` (fallback: `http://localhost:3000`)
- `withCredentials: true` — browser sends httpOnly refresh cookie automatically

**Request interceptor:**
- Reads `accessToken` from `useAuthStore`
- Attaches `Authorization: Bearer <token>` if present

**Response interceptor:**
- On 401: calls `POST /auth/refresh` once
  - Success → updates `useAuthStore`, retries original request
  - Failure → calls `clearAuth()`, redirects to `/login`
- Does not retry refresh requests (avoids infinite loops)

---

## Data Flow

### App load
1. `App.jsx` mounts → calls `POST /auth/refresh`
2. Cookie present → receives `accessToken` → `setAuth()` → renders app
3. No cookie / expired → `clearAuth()` → `ProtectedRoute` redirects to `/login`
4. Loading state shown while refresh is in-flight

### Login
1. User submits form → `POST /auth/login`
2. Response: `{ accessToken }` → `setAuth(accessToken, username)` from JWT payload
3. Redirect to `/`

### Mid-session token expiry (transparent to user)
1. API call returns 401
2. Interceptor calls `POST /auth/refresh`
3. New `accessToken` stored in Zustand
4. Original request retried automatically

### Logout
1. User clicks logout on Profile page
2. `POST /auth/logout` (sends Bearer token + cookie)
3. `clearAuth()` → redirect to `/login`

---

## Components

### `ProtectedRoute`
- Reads `isAuthenticated` from `useAuthStore`
- `false` → `<Navigate to="/login" replace />`
- `true` → renders `children`

### `Login.jsx`
- Mobile-first centered card
- Fields: `login` (email or username), `password`
- No nav bar rendered on this page
- Inline error on 401, generic error on network failure

### `Profile.jsx`
- Shows logged-in `username`
- Single Logout button
- Protected route

### `Navigation.jsx` updates
- Add Profile nav link (before language toggle)
- Nav bar hidden on `/login` (unauthenticated layout)

---

## i18n Keys

### English
```json
"auth": {
  "title": "Sign In",
  "loginLabel": "Email or username",
  "passwordLabel": "Password",
  "submit": "Sign In",
  "submitting": "Signing in...",
  "error": {
    "invalid": "Invalid credentials. Please try again.",
    "generic": "Something went wrong. Please try again."
  }
},
"profile": {
  "title": "Profile",
  "loggedInAs": "Logged in as",
  "logout": "Logout"
},
"nav": {
  "profile": "Profile"
}
```

### German (same keys, translated)

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Wrong credentials | Inline error below form |
| Network error on login | Generic inline error |
| Access token expired mid-session | Interceptor silently refreshes + retries |
| Refresh token expired or missing | `clearAuth()` + redirect to `/login` |
| Logout API fails | Still clears local state + redirects |

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Backend base URL |
