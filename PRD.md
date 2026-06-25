# Support Ticket System · Product Requirements Document

## 1. Product Overview

A multi-tenant customer support ticket management platform that enables clients to submit and track support requests while agents and administrators manage, assign, and resolve tickets efficiently.

### 1.1 Problem Statement

Organizations need a centralized system to receive, track, and resolve customer support requests with role-based access, real-time communication, and accountability through activity logging.

### 1.2 Target Users

| Role | Description |
|---|---|
| **Client** | End users who submit and track their own support tickets |
| **Agent** | Support staff who triage, respond to, and resolve tickets |
| **Super Admin** | Administrators who manage users, categories, and system settings |

---

## 2. Functional Requirements

### 2.1 Authentication & Authorization

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | Users register with email + password (min 8 chars) | P0 |
| AUTH-02 | Users log in with email + password | P0 |
| AUTH-03 | Session persisted via httpOnly cookie (5-day expiry) | P0 |
| AUTH-04 | Passwords hashed with Node.js `crypto.scryptSync` | P0 |
| AUTH-05 | Role-based access control (RBAC) enforced on all API routes | P0 |
| AUTH-06 | Middleware redirects unauthenticated users to login | P0 |
| AUTH-07 | Admin routes require `agent` or `super_admin` role | P0 |

### 2.2 Ticket Management

| ID | Requirement | Priority |
|---|---|---|
| TKT-01 | Clients create tickets with subject, description, priority, category | P0 |
| TKT-02 | Auto-generate ticket number (`TKT-XXXX`) | P0 |
| TKT-03 | Ticket statuses: `open`, `in_progress`, `waiting_on_client`, `waiting_on_agent`, `resolved`, `closed` | P0 |
| TKT-04 | Ticket priorities: `low`, `medium`, `high`, `urgent` | P0 |
| TKT-05 | Agents can update ticket status within allowed transitions | P0 |
| TKT-06 | Agents can assign tickets to specific users | P0 |
| TKT-07 | Clients can close their own tickets | P0 |
| TKT-08 | Agents/admins can reopen closed tickets | P0 |
| TKT-09 | Filter tickets by status and priority | P0 |
| TKT-10 | Clients see only their tickets; agents/admins see all | P0 |
| TKT-11 | Ticket list sorted by last activity (descending) | P0 |
| TKT-12 | Tags support on tickets | P1 |
| TKT-13 | Category assignment on tickets | P1 |
| TKT-14 | Ticket archiving | P2 |

### 2.3 Real-Time Messaging

| ID | Requirement | Priority |
|---|---|---|
| MSG-01 | Clients and agents can reply to tickets with text messages | P0 |
| MSG-02 | Public messages visible to all participants | P0 |
| MSG-03 | Internal notes visible only to agents/admins | P0 |
| MSG-04 | Messages delivered in real-time via Pusher WebSocket | P0 |
| MSG-05 | Optimistic UI: sent message appears instantly before server confirms | P0 |
| MSG-06 | Messages sorted chronologically within a ticket | P0 |
| MSG-07 | Sending a public message auto-changes status: client → `waiting_on_agent`, agent → `waiting_on_client` | P0 |
| MSG-08 | Message preview + sender info stored on ticket for list view | P1 |
| MSG-09 | File attachments on messages | P2 |

### 2.4 Real-Time Notifications

| ID | Requirement | Priority |
|---|---|---|
| NOT-01 | Notification created when a new ticket is submitted (notify agents) | P0 |
| NOT-02 | Notification created when a ticket is assigned | P0 |
| NOT-03 | Notification created when ticket status changes | P0 |
| NOT-04 | Notification created when a new public message is added | P0 |
| NOT-05 | Notifications delivered instantly via Pusher | P0 |
| NOT-06 | Unread notification badge in sidebar (real-time count) | P0 |
| NOT-07 | Mark individual notification as read | P0 |
| NOT-08 | Mark all notifications as read | P0 |
| NOT-09 | Notifications link directly to the relevant ticket | P0 |
| NOT-10 | Notification types: `ticket.created`, `ticket.assigned`, `ticket.status_changed`, `message.added`, `message.internal_note`, `user.mentioned`, `ticket.reopened`, `ticket.priority_changed` | P1 |

### 2.5 User Management (Admin)

| ID | Requirement | Priority |
|---|---|---|
| USR-01 | Super admin can list all users | P0 |
| USR-02 | Super admin can change user roles (client/agent/super_admin) | P0 |
| USR-03 | Super admin can activate/deactivate users | P1 |

### 2.6 Category Management (Admin)

| ID | Requirement | Priority |
|---|---|---|
| CAT-01 | Super admin can create categories | P1 |
| CAT-02 | Tickets can be assigned a category | P1 |
| CAT-03 | Categories can be activated/deactivated | P1 |

### 2.7 Activity Logging

| ID | Requirement | Priority |
|---|---|---|
| LOG-01 | All ticket actions logged: create, assign, status change, message | P1 |
| LOG-02 | Activity log includes actor, action, timestamp, and metadata | P1 |

---

## 3. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Real-time message delivery latency | < 500ms (Pusher WebSocket) |
| NFR-02 | Page load time (initial) | < 2s (Turbopack HMR) |
| NFR-03 | Session expiry | 5 days |
| NFR-04 | Password hashing | scrypt (NIST recommended) |
| NFR-05 | API auth | httpOnly cookie, server-verified |
| NFR-06 | Multi-tenant isolation | All queries scoped by `tenantId` |
| NFR-07 | Database | MariaDB (MySQL-compatible) |
| NFR-08 | TypeScript strict mode | Enabled across codebase |

---

## 4. Data Model

### Entity Relationship Summary

```
Organization 1──* User
Organization 1──* Ticket
Organization 1──* Notification
Organization 1──* ActivityLog
Organization 1──* TicketCategory
User 1──* Ticket (created)
User 1──* TicketMessage (created)
User 1──* Notification (received)
User 1──* Session
Ticket 1──* TicketMessage
Ticket 1──* Notification
```

### Key Fields

**User**: `id`, `email` (unique), `passwordHash`, `displayName`, `role` (client/agent/super_admin), `tenantId`
**Ticket**: `id`, `ticketNumber` (unique), `subject`, `description`, `status`, `priority`, `assignedTo`, `createdBy`, `messageCount`, `lastActivityAt`
**TicketMessage**: `id`, `ticketId`, `body`, `messageType` (public/internal_note), `createdBy`, `createdByRole`
**Notification**: `id`, `userId`, `type`, `title`, `body`, `ticketId`, `ticketNumber`, `isRead`
**Session**: `id`, `userId`, `token` (unique), `expiresAt`

---

## 5. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | Radix UI (`@radix-ui/react-slot`) |
| ORM | Prisma 7 |
| Database | MariaDB (MySQL) |
| Auth | Session-based (httpOnly cookies, `crypto.scryptSync`) |
| State (client) | Zustand |
| Forms | React Hook Form + Zod 3.24 |
| Real-time | Pusher (server SDK + client SDK) |
| Linting | ESLint 9 (`eslint-config-next`) |

---

## 6. Real-Time Architecture

### Channels

| Channel | Type | Subscriber |
|---|---|---|
| `private-user-{userId}` | Private (auth required via `/api/pusher/auth`) | Each authenticated user's browser |

### Events

| Event | Trigger | Direction | Payload |
|---|---|---|---|
| `notification.created` | Notification created in DB | Server → Client | `{ notification }` |
| `notification.marked-read` | Single notification marked read | Server → Client | `{ notificationId }` |
| `notification.all-read` | All notifications marked read | Server → Client | `{ userId }` |
| `ticket.new-message` | New message created on a ticket | Server → Client | `{ ticketId, message }` |

### Pusher Auth

- Endpoint: `POST /api/pusher/auth`
- Reads `session` cookie, verifies against DB
- Only allows subscription to the caller's own `private-user-{uid}` channel

---

## 7. Status Transition Rules

```
open ──────────→ in_progress ──→ resolved ──→ closed
  │                                    ↑         │
  ├──→ waiting_on_agent ──→ in_progress           │
  └──→ closed                                     │
       ↑───────────────────────────────────────────┘
```

- **Clients** can only transition: any status → `closed`
- **Agents/Admins** can transition per the full state machine above

---

## 8. Permission Matrix

| Action | client | agent | super_admin |
|---|---|---|---|
| ticket.create | ✓ | ✓ | ✓ |
| ticket.view | ✓ | ✓ | ✓ |
| ticket.list | ✓ | ✓ | ✓ |
| ticket.update_status | | ✓ | ✓ |
| ticket.assign | | ✓ | ✓ |
| ticket.close | ✓ | ✓ | ✓ |
| ticket.reopen | | ✓ | ✓ |
| ticket.delete | | | ✓ |
| message.reply_public | ✓ | ✓ | ✓ |
| message.reply_internal | | ✓ | ✓ |
| message.view_internal | | ✓ | ✓ |
| user.manage | | | ✓ |
| user.list | | | ✓ |
| category.manage | | | ✓ |
| settings.view | | | ✓ |
| dashboard.view | | ✓ | ✓ |

---

## 9. API Endpoints

| Method | Path | Auth | Permissions | Purpose |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | — | Register new user |
| POST | `/api/auth/session` | No | — | Login (create session) |
| DELETE | `/api/auth/session` | No | — | Logout (delete session) |
| GET | `/api/auth/verify` | Session | — | Verify session, return user |
| GET | `/api/tickets` | Session | — | List tickets (scoped by role) |
| POST | `/api/tickets` | Session | ticket.create | Create ticket |
| GET | `/api/tickets/:id` | Session | ticket.view | Get ticket detail |
| PATCH | `/api/tickets/:id` | Session | ticket.update_status | Update ticket (status, priority) |
| POST | `/api/tickets/:id/assign` | Session | ticket.assign | Assign ticket to user |
| GET | `/api/tickets/:id/messages` | Session | ticket.view | Get ticket messages |
| POST | `/api/tickets/:id/messages` | Session | message.create | Add message to ticket |
| GET | `/api/notifications` | Session | — | List user's notifications |
| POST | `/api/notifications` | Session | — | Mark all notifications read |
| PATCH | `/api/notifications/:id` | Session | — | Mark one notification read |
| GET | `/api/categories` | Session | — | List active categories |
| GET | `/api/users` | Session | user.list | List users (admin) |
| POST | `/api/pusher/auth` | Session | — | Authenticate Pusher private channel |

---

## 10. Routes & UI

| Path | Layout | Page | Access |
|---|---|---|---|
| `/auth/login` | None | Login form | Public |
| `/auth/register` | None | Registration form | Public |
| `/portal` | Portal (sidebar) | Client dashboard | Client |
| `/portal/tickets` | Portal (sidebar) | My tickets list | Client |
| `/portal/tickets/new` | Portal (sidebar) | Create ticket | Client |
| `/portal/tickets/[id]` | Portal (sidebar) | Ticket detail + messages | Client |
| `/portal/notifications` | Portal (sidebar) | Notifications list | Client |
| `/admin` | Admin (sidebar) | Admin dashboard | Agent/Admin |
| `/admin/tickets` | Admin (sidebar) | All tickets list | Agent/Admin |
| `/admin/tickets/[id]` | Admin (sidebar) | Ticket detail + messages | Agent/Admin |
| `/admin/users` | Admin (sidebar) | User management | Super Admin |
| `/admin/users/[id]` | Admin (sidebar) | User detail | Super Admin |
| `/admin/categories` | Admin (sidebar) | Category management | Super Admin |
| `/admin/notifications` | Admin (sidebar) | Notifications list | Agent/Admin |
| `/admin/settings` | Admin (sidebar) | System settings | Super Admin |

---

## 11. Seed Data

| Item | Details |
|---|---|
| Super admin | `admin@support.com` / `admin123` |
| Default org | `id: "default"`, `slug: "default"` |
| Ticket counter | starts at `0`, incremented per ticket |
| Ticket number format | `TKT-0001`, `TKT-0002`, ... |

---

## 12. Constraints & Assumptions

- Single-organization default (multi-tenant via `tenantId` scoping, but no org switching UI)
- File uploads not yet implemented (returns 501)
- No email/SMS notification delivery (in-app only via Pusher)
- No ticket merge/split functionality
- No SLA or escalation rules
- No public-facing knowledge base
- Search is filter-only (no full-text search)
