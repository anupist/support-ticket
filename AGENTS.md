# support-ticket · agent guide

## Critical Rules

- **NEVER break existing features.** Before changing or adding any feature, verify all previously working features still work. Every existing fix, filter, pagination, UI behavior must be preserved. Do not let anything go to waste.

## Stack

- **Next.js 16** (App Router, Turbopack for dev)
- **React 19**, TypeScript
- **Prisma 7** + **MariaDB** (MySQL), adapter `@prisma/adapter-mariadb`
- **Tailwind CSS v4**, **Radix UI** (`@radix-ui/react-slot`)
- **Zustand** state management
- **React Hook Form** + **Zod 3.24** validation
- **Pusher** real-time (notifications + ticket messages)
- **Nodemailer** SMTP (email notifications via Zoho)

## Setup & run

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev          # http://localhost:3000
node scripts/seed-admin.mjs   # creates admin@support.com / admin123 (super_admin)
node scripts/seed-data.mjs    # seeds default org + ticket counter
```

Prisma client is generated to `generated/prisma/`. Config file is `prisma.config.ts` (v7 format). Schema at `prisma/schema.prisma`.

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
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=no-reply@coder71.com
SMTP_PASS=Gi5nty&c
SMTP_FROM_ADDRESS=no-reply@coder71.com
SMTP_FROM_NAME=Coder71 Support
```

`DATABASE_URL` is only needed for Prisma CLI; the app uses individual `DATABASE_*` vars with `PrismaMariaDb` adapter in `src/lib/prisma.ts`.

## Auth

Session-based with httpOnly cookies (no Firebase). Passwords hashed via Node `crypto.scryptSync`. Sessions stored in `sessions` table.

- **Login**: `POST /api/auth/session` → creates session → sets `session` cookie
- **Register**: `POST /api/auth/register` → creates user + session
- **Verify**: `GET /api/auth/verify` → reads cookie, verifies against DB
- **Logout**: `DELETE /api/auth/session` → deletes session + clears cookie
- **Forgot password**: `POST /api/auth/forgot-password` → sends reset email
- **Reset password**: `POST /api/auth/reset-password` → validates token + updates password
- Guard: `src/lib/guards/auth.guard.ts` — `verifySession(token)` looks up DB session

**Root page** (`src/app/page.tsx`) is a server component that checks the session cookie and redirects to `/portal` or `/admin`. **Login page** checks session on mount and redirects if already authenticated. **Middleware** also handles authenticated users away from public paths.

## Project structure

```
src/
├── app/
│   ├── (admin)/admin/       — Admin layouts & pages (agent/super_admin)
│   ├── (client)/portal/     — Client portal layouts & pages
│   ├── api/
│   │   ├── auth/            — register, session, verify, forgot-password, reset-password
│   │   ├── tickets/         — CRUD, assign, messages
│   │   ├── notifications/   — list, mark-read, mark-all-read
│   │   ├── pusher/auth      — Pusher private channel auth
│   │   ├── media/upload     — File upload (user-isolated)
│   │   ├── media/[id]       — Serve file (ownership check)
│   │   ├── users/           — List users (admin)
│   │   ├── users/me         — Get/update profile
│   │   ├── users/me/password — Change password
│   │   ├── categories/
│   │   └── debug/
│   ├── auth/                — login, register, forgot-password, reset-password
│   └── profile/             — update profile, change password
├── components/
│   ├── ProfileDropdown.tsx   — Avatar + dropdown: update profile, change password, logout
│   └── ui/                  — avatar, badge, button, card, input
├── hooks/                   — useAuth, useTicket, useTickets, useTicketMessages, useNotifications, useUnreadCount
├── lib/
│   ├── guards/              — auth.guard, role.guard, permission.guard
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── ticket.service.ts
│   │   ├── notification.service.ts
│   │   ├── activity.service.ts
│   │   └── mail.service.ts  — Nodemailer with Zoho SMTP, 4 email templates
│   ├── pusher-server.ts     — Server Pusher SDK
│   ├── pusher-client.ts     — Client Pusher SDK
│   ├── prisma.ts            — Prisma client singleton (MariaDB adapter)
│   ├── auth.ts              — Password hashing (scrypt) + session token generation
│   ├── api-client.ts        — fetch wrapper (credentials: 'include')
│   ├── api-handler.ts       — Route handler wrapper (auth + role + permission guard)
│   ├── permissions.ts       — RBAC matrix
│   ├── constants.ts         — Statuses, priorities, roles, transitions, collection refs
│   └── errors.ts            — AppError, NotFoundError, ForbiddenError, etc.
├── providers/
│   ├── AuthProvider.tsx      — Session check on mount, login/register/logout
│   └── PusherProvider.tsx    — Subscribes to private-user channel, handles notification + message events
├── stores/
│   ├── authStore.ts         — Auth state (uid, email, displayName, role, tenantId, avatarUrl)
│   ├── notificationStore.ts  — Notifications + unreadCount, real-time updates
│   └── messageStore.ts       — Incoming real-time messages keyed by ticketId
└── types/                   — common, user, ticket, message, notification
```

## Real-time (Pusher)

Every authenticated user subscribes to `private-user-{userId}`. Auth at `POST /api/pusher/auth` verifies session cookie and only allows own channel.

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

## Profile system

- **Header**: every page shows avatar + display name in the top-right corner
- **ProfileDropdown**: click avatar → dropdown with Update Profile, Change Password, Sign Out
- **Profile page** (`/profile`): edit display name + upload profile photo
- **Change password** (`/profile/password`): requires current password, min 8 chars
- **Media upload**: `POST /api/media/upload` (multipart, 5MB limit), files stored in `private/uploads/{tenantId}/{userId}/`
- **Media serve**: `GET /api/media/{id}` — verifies session + ownership before serving file
- Files stored **outside** `public/`, served exclusively via auth-gated API

## Email notifications (via Zoho SMTP)

Mail service at `src/lib/services/mail.service.ts` with 4 templates:

| Trigger | Recipient | Template |
|---|---|---|
| Forgot password | Requesting user | Password reset link (1hr expiry) |
| Ticket created | All active agents | Ticket number + subject + view link |
| Status changed | Ticket creator (client) | Old status → new status + view link |
| New public message | Opposite role (client↔agent) | Sender name + message preview + view link |

Emails are best-effort — SMTP errors are caught silently to avoid breaking the primary action.

## Forgot password flow

1. User enters email on `/auth/forgot-password`
2. `POST /api/auth/forgot-password` — creates `PasswordResetToken` (1hr expiry) + sends email
3. User clicks link → `/auth/reset-password?token=xxx`
4. Enters new password → `POST /api/auth/reset-password` — validates token, updates password, marks token used

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

## Styles

Tailwind CSS v4 (no `tailwind.config.ts` — v4 uses CSS-based config). Classes via `cn()` utility (`clsx` + `tailwind-merge`).

## Tips

- `src/lib/api-client.ts` exports `apiFetch()` — use for all client-side API calls (adds `credentials: 'include'`)
- `createHandler()` in `src/lib/api-handler.ts` wraps route handlers with auth check, role guard, and permission guard
- Error responses use `handleApiError()` from `src/lib/errors.ts`
- After schema changes: `npx prisma generate` then `npx prisma db push`
- The `middleware.ts` file shows a deprecation warning but still works — uses cookie-based session check for route protection
- Auth store (`useAuthStore`) carries `avatarUrl` — after profile update, call `setUser()` on the store to refresh header immediately
