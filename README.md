# LeadFlow CRM

A modern, full-stack B2B Customer Relationship Management (CRM) platform designed for managing sales pipelines, team performance, customer accounts, and intelligent deal tracking.

> **Project Status**: Under active development (~70% complete). Core workflows, multi-tenant database layer, authentication, role-based controls, deal pipeline, and AI-assisted scoring services are operational.

---

## Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Data Visualization**: Recharts
- **State & HTTP**: Axios, React hooks

### Backend
- **Runtime**: Node.js & Express
- **Database Layer**: PostgreSQL via Prisma ORM (v6)
- **Authentication**: JWT with Role-Based Access Control (`ADMIN`, `MANAGER`, `SALES_AGENT`)
- **Security**: Password hashing with `bcryptjs`, CORS, isolated tenant boundaries (`organizationId`)
- **Validation**: Strict schema constraints, foreign keys with referential rules (`onDelete: SetNull` for users/companies, `onDelete: Cascade` for timeline logs)

### AI Features (Sales Copilot)
- **Lead Scoring Engine**: Intelligent heuristics evaluating deal size, contact completeness, activity signals, and velocity.
- **Deal Risk Analyzer**: Real-time risk detection highlighting stalled deals and velocity drops.
- **Google Gemini Integration (Optional)**: Can optionally connect to Gemini 1.5 Flash API for automated executive summaries and follow-up drafts.

---

## Key Implemented Features

- **Multi-Tenant SaaS Architecture**: Tenant data isolation enforced across organizations, users, leads, deals, companies, and contacts.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Organization profile, system settings, executive dashboard, and manager management.
  - **Manager**: Team oversight, sales agent performance tracking, deal approvals, and quota metrics.
  - **Sales Agent**: Assigned leads, deal pipeline stages, dynamic follow-up scheduling, and customer timeline logs.
- **Deal Pipeline & Funnel**: Visual pipeline across deal stages (`QUALIFIED`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`) with exact currency calculation using `@db.Decimal(15, 2)`.
- **Company & Contact Directory**: Account hierarchy linking contacts to enterprise companies and assigned account executives.
- **Follow-up & Activity Tracking**: Automated daily follow-up categorization (`TODAY`, `UPCOMING`, `OVERDUE`, `COMPLETED`).
- **Comprehensive Test Suite**: Automated integration and multi-tenancy tests built on Node.js native test runner.

---

## Getting Started

### Prerequisites
- Node.js (v18 or v20+ recommended)
- PostgreSQL database (Local instance or Cloud provider such as Neon, Supabase, AWS RDS)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/vivekanand6062/Lead_flow_CRM.git
cd Lead_flow_CRM
```

### 2. Environment Configuration

Copy the example environment files for both backend and frontend:

#### Backend:
```bash
cp backend/.env.example backend/.env
```
Configure the variables inside `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="your_secure_jwt_secret"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY="your_optional_gemini_api_key"
```

#### Frontend:
```bash
cp frontend/.env.example frontend/.env.local
```
Configure `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Installation

Install dependencies across the project:
```bash
# From repository root
npm run install:all
```
Or install each individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Database Setup & Migrations

Deploy database migrations and populate seed data:
```bash
cd backend

# Apply Prisma migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed sample data (Organization, Demo users, Leads, Deals)
npm run seed
```

### 5. Running the Application

#### Run Backend:
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Run Frontend:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

#### Run Both Concurrently:
```bash
# From root directory
npm run dev
```

---

## Running Tests

Run the automated integration and multi-tenancy test suite:
```bash
cd backend
npm test
```

---

## Demo Accounts

For local testing after running `npm run seed`:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@leadflow.com` | `Admin@123` | Executive leadership, organization settings, manager management |
| **Manager** | `rahul@leadflow.com` | `Manager@123` | Enterprise team manager, pipeline review, agent assignments |
| **Sales Agent** | `amit@leadflow.com` | `Agent@123` | Account executive, assigned leads, deal tracking, follow-ups |

---

## License

This project is proprietary and confidential. All rights reserved.
