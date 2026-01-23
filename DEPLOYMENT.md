# 🚀 Deployment Guide - Vercel + GitHub

This guide walks you through deploying the Crypto Recovery Dashboard to Vercel with GitHub integration.

## 📋 Prerequisites

1. **GitHub Account** - [Sign up here](https://github.com)
2. **Vercel Account** - [Sign up here](https://vercel.com) (use GitHub login)
3. **PostgreSQL Database** - Recommended: [Neon](https://neon.tech) (free tier available)

---

## 🗄️ Step 1: Set Up PostgreSQL Database

### Option A: Neon (Recommended - Free Tier)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy your connection string (looks like: `postgresql://user:pass@host/db?sslmode=require`)

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings → Database → Connection string → URI

### Option C: Vercel Postgres

1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the `POSTGRES_URL` from the dashboard

---

## 📤 Step 2: Push to GitHub

### If you don't have a GitHub repo yet:

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Crypto Recovery Dashboard"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/crypto-recovery-dashboard.git
git branch -M main
git push -u origin main
```

### If you already have a repo:

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push
```

---

## 🔗 Step 3: Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `crypto-recovery-dashboard` repository
4. Vercel will auto-detect the configuration

### Configure Build Settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Other |
| Root Directory | `./` |
| Build Command | `npm run vercel-build` |
| Output Directory | `frontend/dist` |
| Install Command | `npm install` |

---

## 🔐 Step 4: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables

Add these **required** variables:

### Database
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

### Authentication
```
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRATION=7d
```

### Application
```
NODE_ENV=production
API_PREFIX=api/v1
```

### Email (Optional - for notifications)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### Frontend
```
VITE_API_URL=/api/v1
```

---

## 🚀 Step 5: Deploy

1. Click **"Deploy"** in Vercel
2. Wait for the build to complete (~2-5 minutes)
3. Your app will be live at `https://your-project.vercel.app`

---

## 🔄 Automatic Deployments

Once connected, Vercel will automatically deploy:
- **Production**: When you push to `main` branch
- **Preview**: When you create a Pull Request

---

## 🧪 Step 6: Verify Deployment

1. Visit your Vercel URL
2. Check the API health: `https://your-project.vercel.app/api/v1/health`
3. Try logging in (default admin if seeded)

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Check logs in Vercel Dashboard → Deployments → View Build Logs
```

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure SSL is enabled (`?sslmode=require`)
- Check if your database allows external connections

### API Returns 500 Error

- Check Function Logs in Vercel Dashboard
- Verify all environment variables are set
- Ensure `JWT_SECRET` is set

### CORS Issues

The `vercel.json` includes CORS headers. If issues persist:
1. Check browser console for specific errors
2. Verify the API URL in frontend matches deployment

---

## 📁 Project Structure for Vercel

```
crypto-recovery-dashboard/
├── vercel.json           # Vercel configuration
├── package.json          # Root package.json
├── frontend/             # React frontend
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
└── backend/              # NestJS backend
    ├── package.json
    ├── src/
    │   ├── serverless.ts # Vercel serverless entry
    │   └── ...
    └── ...
```

---

## 🔧 Local Development

```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend
npm run dev

# Frontend only (http://localhost:5173)
npm run dev:frontend

# Backend only (http://localhost:3000)
npm run dev:backend
```

---

## 🌐 Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL is automatically provisioned

---

## 📊 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for JWT tokens (min 32 chars) |
| `JWT_EXPIRATION` | ❌ | Token expiration (default: 7d) |
| `NODE_ENV` | ❌ | Environment (production) |
| `SMTP_HOST` | ❌ | Email server host |
| `SMTP_PORT` | ❌ | Email server port |
| `SMTP_USER` | ❌ | Email username |
| `SMTP_PASS` | ❌ | Email password |
| `VITE_API_URL` | ❌ | API URL for frontend |

---

## 🎉 Done!

Your Crypto Recovery Dashboard is now live on Vercel!

**Next Steps:**
- Set up a custom domain
- Configure email notifications
- Enable Vercel Analytics
- Set up monitoring alerts
