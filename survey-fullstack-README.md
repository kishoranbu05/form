# SurveyVault — Full Stack Application

A complete full-stack Survey Records Management system.

## Project Structure

```
survey-api/         ← Node.js + Express + MongoDB backend
survey-frontend/    ← React + Vite frontend
```

---

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd survey-api
npm install
cp .env.example .env    # Edit with your MongoDB URI + JWT secret
npm run dev             # Runs on http://localhost:5000
```

### 2. Start the Frontend

```bash
cd survey-frontend
npm install
npm run dev             # Runs on http://localhost:3000
```

> The frontend is pre-configured to proxy `/api/*` requests to `http://localhost:5000` via Vite.

---

## 🔑 Default Roles

When registering, select **Admin** or **User** role.

| Role  | Capabilities |
|-------|-------------|
| User  | Create, view, edit, delete **their own** surveys |
| Admin | Full access to all surveys, approve/reject, export CSV/Excel, view dashboard stats |

---

## 📡 Backend API

- **Base URL:** `http://localhost:5000/api`
- **Swagger Docs:** `http://localhost:5000/api-docs`

## 🖥 Frontend Routes

| Route            | Access | Description |
|------------------|--------|-------------|
| `/login`         | Public | Sign in |
| `/register`      | Public | Create account |
| `/dashboard`     | User   | Personal overview |
| `/surveys`       | User   | CRUD own surveys |
| `/admin`         | Admin  | Platform stats + charts |
| `/admin/surveys` | Admin  | All records + export |

