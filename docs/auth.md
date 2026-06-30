# Auth Flow

JWT-based authentication using Pinia for in-memory state. Tokens are lost on page refresh by design — the store is structured so persistence can be added later with minimal changes.

## Files

| File | Purpose |
|------|---------|
| `stores/auth.ts` | Pinia store — holds `user`, `accessToken`, `refreshToken` |
| `composables/useAuth.ts` | Actions: `login`, `register`, `logout`, `forgotPassword`, `resetPassword` |
| `composables/useApiFetch.ts` | `$fetch` wrapper that auto-attaches `Authorization: Bearer` header |
| `middleware/auth.ts` | Route guard — redirects unauthenticated users to `/auth/login` |
| `layouts/blank.vue` | Centered card layout used by all auth pages |
| `pages/auth/login.vue` | Email + password login form |
| `pages/auth/register.vue` | Name, email, password, confirm password |
| `pages/auth/forgot-password.vue` | Email input → success state |
| `pages/auth/reset-password.vue` | New password form, reads `?token=` from query string |

## Environment

Copy `.env.example` to `.env` and set your API base URL:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

This value is exposed via `useRuntimeConfig().public.apiBaseUrl` and used by `useApiFetch`.

## API Endpoints Expected

The composable calls these endpoints on your backend:

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `POST` | `/auth/register` | `{ name, email, password }` | `{ accessToken, refreshToken, user }` |
| `POST` | `/auth/forgot-password` | `{ email }` | any |
| `POST` | `/auth/reset-password` | `{ token, password }` | any |

`user` shape: `{ id: string, name: string, email: string }`

## Protecting Routes

Add the `auth` middleware to any page that requires authentication:

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
```

Unauthenticated users are redirected to `/auth/login?redirect=<original-path>`. The `redirect` query param is preserved for use after login if needed.

## Making Authenticated API Calls

Use `useApiFetch` instead of `$fetch` directly — it handles the auth header automatically:

```ts
const data = await useApiFetch<MyType>('/some/protected/endpoint')

// With options
const result = await useApiFetch<MyType>('/items', {
  method: 'POST',
  body: { name: 'new item' },
})
```

## Accessing Auth State

```ts
const { user, isAuthenticated, logout } = useAuth()
```

Both `user` and `isAuthenticated` are reactive computed refs.

## Adding Token Persistence

The store is in-memory by default. To persist across page refreshes, replace the `state` fields in `stores/auth.ts` with VueUse's `useLocalStorage`:

```ts
import { useLocalStorage } from '@vueuse/core'

state: () => ({
  user: useLocalStorage<User | null>('auth:user', null),
  accessToken: useLocalStorage<string | null>('auth:access-token', null),
  refreshToken: useLocalStorage<string | null>('auth:refresh-token', null),
}),
```
