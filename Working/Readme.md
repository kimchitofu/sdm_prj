# FundBridge – Working Notes

## Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0 (via MySQL Workbench or similar)

### Install dependencies
```bash
npm install
```

### Environment variables
Create a `.env` file in the `Working/` folder:
```env
DATABASE_URL="mysql://root:1234@localhost:3306/fundbridge"
JWT_SECRET="fundbridge-super-secret-jwt-key-change-this-in-production"
```

### Database setup
```bash
npx prisma db push
```

Then insert the admin account in MySQL Workbench:
```sql
INSERT INTO user (id, email, password, firstName, lastName, role, status, isVerified, createdAt, updatedAt)
VALUES (
  'admin-001',
  'admin@fundbridge.com',
  '$2b$10$<bcrypt_hash_of_Admin@1234>',
  'Super',
  'Admin',
  'admin',
  'active',
  1,
  NOW(),
  NOW()
);
```

### Run the dev server
```bash
npm run dev
```

---

## Change Log

### Authentication – Replaced Firebase with MySQL + JWT
- Removed Firebase client-side auth
- Added server-side JWT auth using Node.js built-in `crypto` (no extra packages)
- JWT stored in httpOnly cookie (`auth-token`, 7-day expiry)
- **`lib/auth.ts`** — `signToken()`, `verifyToken()`, `getSession()` helpers
- **`lib/prisma.ts`** — Prisma client singleton for MySQL
- **`prisma/schema.prisma`** — switched provider from SQLite to MySQL
- **`prisma.config.ts`** — emptied (not used in Prisma 5)
- **`.env`** — `DATABASE_URL` and `JWT_SECRET`

**API routes:**
- `POST /api/auth/login` — finds user in MySQL, verifies bcrypt password, sets JWT cookie
- `POST /api/auth/logout` — clears the auth cookie
- `GET /api/auth/me` — reads JWT cookie, returns current session user

**Pages updated:**
- `app/auth/sign-in/page.tsx` — calls `/api/auth/login`, saves user to localStorage for sidebar display, redirects by role
- `app/auth/register/page.tsx` — calls `/api/auth/register`, sets JWT cookie on success

**Providers:**
- `components/providers/session-provider.tsx` — replaced Firebase `onAuthStateChanged` with fetch to `/api/auth/me`

**Note:** Prisma was downgraded from v7 to v5 because Prisma 7 removed traditional MySQL connection support and `@prisma/adapter-mysql2` does not exist on npm.

---

### Role-Based Routing Fix
- `lib/user.ts` `getRedirectForRole()` maps roles to dashboard routes:
  - `admin` → `/dashboard/admin/users`
  - `fund_raiser` → `/dashboard/fund-raiser`
  - `donee` → `/dashboard/donee`
  - `platform_manager` → `/dashboard/platform`
- Fixed role string mismatch in sidebar: changed `"user_admin"` → `"admin"` and `"platform_management"` → `"platform_manager"` in `getNavItems()` and `getRoleLabel()`
- All 5 admin pages updated: `role="user_admin"` → `role="admin"` in `DashboardLayout`
- Logout now clears `localStorage.currentUser` so stale user info doesn't persist

---

### Admin Dashboard – MySQL Data

All admin pages now fetch real data from MySQL instead of mock data.

**New API routes:**

| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/users` | GET | List all users from MySQL |
| `/api/admin/users/[id]/audit-logs` | GET | Audit log history for a specific user |
| `/api/admin/campaigns` | GET | List all campaigns from MySQL |
| `/api/admin/campaigns` | PATCH | Update campaign status (approve/reject/hold) |
| `/api/admin/reports` | GET | List all campaign reports from MySQL |
| `/api/admin/reports` | PATCH | Resolve or dismiss a campaign report |

**Pages updated:**

- `app/dashboard/admin/users/page.tsx` — fetches users + flagged IDs from MySQL; audit log history fetched on demand per user; sidebar shows real logged-in admin name from JWT session
- `app/dashboard/admin/campaigns/page.tsx` — fetches campaigns from MySQL; approve/reject/hold writes status back to MySQL
- `app/dashboard/admin/reports-queue/page.tsx` — fetches campaign reports from MySQL; resolve/dismiss writes back to MySQL

**Note:** Message reports do not have a MySQL table yet, so they remain as mock data in the reports queue page.

---

## Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fundbridge.com | Admin@1234 |

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** MySQL 8.0
- **ORM:** Prisma 5
- **Auth:** JWT via Node.js `crypto`, httpOnly cookies, bcryptjs
- **UI:** Tailwind CSS, shadcn/ui
