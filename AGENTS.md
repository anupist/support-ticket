# support-ticket · agent guide

## Stack

- **Next.js 16** (App Router, Turbopack for dev)
- **React 19**, TypeScript
- **Prisma 7** + **MariaDB** (MySQL), adapter `@prisma/adapter-mariadb`
- **Tailwind CSS v4**, **Radix UI** (`@radix-ui/react-slot`)
- **Zustand** state management
- **React Hook Form** + **Zod 3.24** validation
- **Pusher** real-time (notifications + ticket messages)

## Setup & run

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev          # http://localhost:3000
```

Prisma client is generated to `generated/prisma/`. The config file is `prisma.config.ts` (v7 config format). Schema at `prisma/schema.prisma`.

## Environment (`.env`)

```
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_NAME=support_portal
DATABASE_URL=mysql://root@localhost/support_portal
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_TENANT_ID=default
NEXT_PUBLIC_PUSHER_KEY=cc89305b97ef896f2744
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
PUSHER_APP_ID=2170540
PUSHER_SECRET=06dd20eca6a0b2774f00
```

Database URL is only needed for Prisma CLI; the app uses individual `DATABASE_*` vars with `PrismaMariaDb` adapter in `src/lib/prisma.ts`.

## Auth

Session-based with httpOnly cookies (no Firebase). Passwords hashed via Node `crypto.scryptSync`. Sessions stored in `sessions` table. Flow: register/login → create session → set `session` cookie. Verify via `POST /api/pusher/auth`.

- Login page: `src/app/auth/login/page.tsx`
- API: `src/app/api/auth/{register,session,verify}/route.ts`
- Guard: `src/lib/guards/auth.guard.ts` — reads `session` cookie, verifies against DB

## Project structure

```
src/
├── app/
│   ├── (admin)/admin/   — Admin layouts & pages (requires agent/super_admin)
│   ├── (client)/portal/ — Client portal layouts & pages
│   ├── api/             — Route handlers (auth, tickets, notifications, pusher, upload, categories, users)
│   ├── auth/            — Login & register pages
│   ├── layout.tsx       — Root layout
│   └── page.tsx         — Root page
├── components/          — Shared UI components (button, card, input, etc.)
├── hooks/               — useAuth, useTicket, useTickets, useTicketMessages, useNotifications, useUnreadCount
├── lib/
│   ├── guards/          — auth.guard, role.guard, permission.guard
│   ├── services/        — user.service, ticket.service, notification.service, activity.service
│   ├── pusher-server.ts — Server Pusher SDK
│   ├── pusher-client.ts — Client Pusher SDK
│   ├── prisma.ts        — Prisma client singleton
│   ├── auth.ts          — Password hashing & session token generation
│   ├── api-client.ts    — fetch wrapper (credentials: 'include')
│   ├── api-handler.ts   — Route handler wrapper (verifyAuth, role/permission guard)
│   ├── permissions.ts   — RBAC matrix (client/agent/super_admin)
│   ├── constants.ts     — Statuses, priorities, roles, transitions
│   └── errors.ts        — AppError, NotFoundError, ForbiddenError, etc.
├── providers/
│   ├── AuthProvider.tsx  — Session check on mount, login/register/logout
│   └── PusherProvider.tsx — Subscribes to private-user channel, handles events
├── stores/
│   ├── authStore.ts
│   ├── notificationStore.ts
│   └── messageStore.ts
└── types/               — common, user, ticket, message, notification
```

## Real-time (Pusher)

Every authenticated user subscribes to `private-user-{userId}`. Auth endpoint at `POST /api/pusher/auth` verifies session and only allows own channel.

### Events pushed to private-user-{userId}

| Event | When | Payload |
|---|---|---|
| `notification.created` | Notification created | `{ notification }` |
| `notification.marked-read` | Single notification read | `{ notificationId }` |
| `notification.all-read` | All notifications read | `{ userId }` |
| `ticket.new-message` | New message on a ticket | `{ ticketId, message }` |

### Key hooks
- `useNotifications()` — reads from `notificationStore` (hydrated via API on mount, real-time via Pusher)
- `useUnreadCount()` — reads `notificationStore.unreadCount` (reacts instantly)
- `useTicketMessages(ticketId)` — fetches via API, subscribes to `messageStore` for real-time incoming messages

## Notifications

Notification service (`src/lib/services/notification.service.ts`) handles:
- `createNotification(userId, data)` — single user notification + Pusher push
- `createNotificationForRole(role, data)` — all users with given role + batch Pusher push
- `markNotificationAsRead(id)` / `markAllNotificationsAsRead(userId)` — DB update + Pusher push

## Roles & permissions

Three roles: `client`, `agent`, `super_admin`. Matrix in `src/lib/permissions.ts`.

| Action | client | agent | super_admin |
|---|---|---|---|
| ticket.create/view/list | ✓ | ✓ | ✓ |
| ticket.update_status/assign | | ✓ | ✓ |
| ticket.close | ✓ | ✓ | ✓ |
| message.reply_public | ✓ | ✓ | ✓ |
| message.reply_internal/view_internal | | ✓ | ✓ |
| user.manage/list | | | ✓ |
| category.manage / settings.view | | | ✓ |

## Admin seed

```bash
node scripts/seed-admin.mjs   # creates admin@support.com / admin123 (super_admin)
node scripts/seed-data.mjs    # seeds default org + ticket counter
```

## Styles

Tailwind CSS v4 (no `tailwind.config.ts` needed — v4 uses CSS-based config). Classes via `cn()` utility (`clsx` + `tailwind-merge`).

## Tips

- `src/lib/api-client.ts` exports `apiFetch()` — use for all client-side API calls (it adds `credentials: 'include'`)
- `createHandler()` in `src/lib/api-handler.ts` wraps route handlers with auth check, role guard, and permission guard
- Error responses use `handleApiError()` from `src/lib/errors.ts`
- After schema changes: `npx prisma generate` then `npx prisma db push`
- The `middleware.ts` file shows a deprecation warning but still works — uses cookie-based session check for route protection
