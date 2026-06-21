# Odoo Cafe POS — Full Stack Restaurant Point of Sale System

A production-grade Restaurant POS system with Admin, Cashier, Kitchen Staff, and Customer Self-Ordering workflows.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | NestJS, Socket.IO, JWT Auth, RBAC, Swagger |
| Database | PostgreSQL, Prisma ORM |
| Deployment | Frontend → Vercel, Backend + DB → Railway |

## Repository Layout

- `frontend/` contains the Next.js app for POS, admin, kitchen, and customer displays.
- `backend/` contains the NestJS API, Prisma schema, and realtime socket gateway.
- `start.ps1` provides a convenience startup script for the full stack workspace.

## Features

- **Auth** — JWT + Refresh Tokens, bcrypt, RBAC (Admin/Cashier/Kitchen)
- **POS Terminal** — Product grid, cart, category filter, search
- **Kitchen Display** — Real-time Socket.IO order flow (TO_COOK → PREPARING → COMPLETED)
- **Payment System** — Cash, Card, UPI with QR generation
- **Receipt** — Print or download PDF
- **Customer Display** — Real-time order status screen
- **QR Self-Ordering** — Unique QR per table, customers browse + order
- **Dashboard** — Revenue trends, top products, category sales (Recharts)
- **Admin Panel** — Full CRUD for products, categories, floors, tables, employees, coupons

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Backend

```bash
cd backend

# Configure environment
cp .env.example .env  
# Edit DATABASE_URL to your PostgreSQL connection string

# Install & setup
npm install
npx prisma generate
npx prisma db push  # or: npx prisma migrate dev
npm run db:seed

# Run
npm run start:dev
```

Backend: http://localhost:3001  
Swagger docs: http://localhost:3001/api/docs

### Frontend

```bash
cd frontend

# Configure
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Install & run
npm install
npm run dev
```

Frontend: http://localhost:3000

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cafe.com | password123 |
| Cashier | cashier@cafe.com | password123 |
| Kitchen | kitchen@cafe.com | password123 |

## Application URLs

| URL | Description |
|-----|-------------|
| `/login` | Login page |
| `/admin/dashboard` | Admin analytics dashboard |
| `/admin/products` | Product management |
| `/admin/categories` | Category management |
| `/admin/floors` | Floor & table management |
| `/admin/floors/qr` | QR code generator for tables |
| `/admin/employees` | Employee management |
| `/admin/coupons` | Coupon management |
| `/admin/orders` | Order history |
| `/pos` | Cashier POS terminal |
| `/kitchen` | Kitchen display system |
| `/customer-display` | Customer-facing display |
| `/table/:token` | Customer self-ordering (scan QR) |
| `/api/docs` | Swagger API documentation |

## Deployment

### Frontend → Vercel
1. Import the `frontend` folder to Vercel
2. Set env var: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

### Backend + DB → Railway
1. Create a new Railway project
2. Add PostgreSQL plugin
3. Deploy the `backend` folder
4. Set env vars:
   - `DATABASE_URL` — auto-provided by Railway PostgreSQL
   - `JWT_SECRET` — a random secret string
   - `JWT_REFRESH_SECRET` — another random secret string
   - `FRONTEND_URL` — your Vercel URL
5. After deploy: run the seed via Railway shell: `npm run db:seed`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login |
| POST | /auth/register | Register |
| GET | /products | List products |
| POST | /products | Create product |
| GET | /categories | List categories |
| POST | /categories | Create category |
| GET | /floors | List floors with tables |
| GET | /tables | List tables |
| GET | /tables/by-token/:token | Get table by QR token |
| GET | /orders | List orders |
| POST | /orders | Create order |
| PATCH | /orders/:id/status | Update order status |
| POST | /payments | Process payment |
| GET | /coupons/validate/:code | Validate coupon |
| GET | /dashboard | Dashboard stats |
| GET | /users | List employees (Admin only) |

## Socket.IO Events

| Event | Description |
|-------|-------------|
| `order.created` | New order sent to kitchen |
| `order.preparing` | Kitchen started preparing |
| `order.completed` | Order ready to serve |
| `payment.completed` | Payment processed |

Connect to: `ws://localhost:3001/pos`
