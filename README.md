# Crypto Recovery Dashboard

A complete production-level Crypto Recovery Platform with User, Admin, and Support Agent dashboards. Built with NestJS backend and React frontend.

## Features

### Core Features
- 🔐 **Secure Authentication** with JWT and TOTP-based 2FA
- 👛 **View-only Crypto Wallet Balances** - No private key management
- 📋 **Case Management System** - Track recovery cases
- 🎫 **Support Ticketing System** - User-agent communication
- 📧 **Email Communication Module** - Templated notifications
- 👥 **Role-based Access Control** (User, Support Agent, Admin)
- 📊 **Full Audit Logging** - Track all system activities

### User Dashboard
- Dashboard overview with case/ticket status
- Wallet management (view-only)
- Case submission and tracking
- Support ticket creation
- Profile management with 2FA setup

### Admin Dashboard
- Comprehensive analytics dashboard
- User management
- Case assignment and oversight
- Ticket management
- Wallet monitoring
- Audit log viewing
- Email template management
- Reports and analytics
- System settings

### Support Agent Dashboard
- Assigned case management
- Ticket handling with quick reply
- Performance metrics

## Tech Stack

### Backend
- **Framework:** NestJS 10.3.0
- **Database:** PostgreSQL (online via Neon/Supabase)
- **ORM:** TypeORM 0.3.19
- **Authentication:** JWT + Passport + TOTP (otplib)
- **Security:** bcrypt, Helmet, Rate Limiting
- **Email:** Nodemailer
- **Documentation:** Swagger/OpenAPI

### Frontend
- **Framework:** React 18.2.0 with TypeScript 5.4.2
- **Build Tool:** Vite 5.1.6
- **Styling:** Tailwind CSS 3.4.1
- **State Management:** Zustand 4.5.2
- **Data Fetching:** TanStack React Query 5.28.0
- **Routing:** React Router 6.22.3
- **UI Components:** Radix UI primitives
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts 2.12.3

## Quick Start

### 1. Get a Free PostgreSQL Database

Sign up for a free PostgreSQL database at [Neon](https://neon.tech) (recommended):
1. Create an account at https://neon.tech
2. Create a new project
3. Copy the connection string (looks like `postgresql://user:pass@host/db?sslmode=require`)

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
# Edit .env and paste your DATABASE_URL
notepad .env

# Start the server
npm run start:dev
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api/docs

## Environment Variables

### Backend (.env)
```env
# Database - Get free PostgreSQL from https://neon.tech
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
crypto-recovery-dashboard/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       # Authentication
│   │   │   ├── users/      # User management
│   │   │   ├── wallets/    # Wallet tracking
│   │   │   ├── cases/      # Case management
│   │   │   ├── tickets/    # Support tickets
│   │   │   ├── audit/      # Audit logging
│   │   │   ├── email/      # Email service
│   │   │   ├── admin/      # Admin endpoints
│   │   │   └── files/      # File uploads
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Login, Register, etc.
│   │   │   ├── user/       # User dashboard
│   │   │   ├── admin/      # Admin dashboard
│   │   │   └── agent/      # Agent dashboard
│   │   ├── layouts/        # Layout components
│   │   ├── stores/         # Zustand stores
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
│   └── package.json
└── README.md
```

## User Roles

| Role | Description | Access |
|------|-------------|--------|
| USER | Regular platform user | User dashboard, own cases/tickets |
| SUPPORT_AGENT | Support team member | Agent dashboard, assigned cases/tickets |
| ADMIN | Platform administrator | Full admin dashboard access |

## Free PostgreSQL Providers

| Provider | Free Tier | Link |
|----------|-----------|------|
| **Neon** | 512 MB, branching | https://neon.tech |
| **Supabase** | 500 MB, auth included | https://supabase.com |
| **ElephantSQL** | 20 MB | https://elephantsql.com |
| **Railway** | $5 credit/month | https://railway.app |

## License

MIT License
