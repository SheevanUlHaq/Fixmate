# FixMate 🛠️

FixMate is a modern, enterprise-ready internal service-request and facilities maintenance management platform built with the **MERN** stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

It streamlines issue reporting, technician dispatching, status tracking, resolution verification, and employee feedback across an organization.

---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Core Workflows](#-core-workflows)
  - [1. Service Request Lifecycle](#1-service-request-lifecycle)
  - [2. Staged Email OTP Verification Flow](#2-staged-email-otp-verification-flow)
- [Role-Based Access Control](#-role-based-access-control)
- [Tech Stack](#-tech-stack)
- [Database Schema & Models](#-database-schema--models)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Demo Accounts](#demo-accounts)
- [Docker & Containerization](#-docker--containerization)
- [CI/CD Pipeline (Jenkins & AWS)](#-cicd-pipeline-jenkins--aws)

---

## ✨ Key Features

- **Enterprise Email Domain Restriction**: Allows employee registrations strictly restricted to authorized company domains (e.g. `@fixmate.com`).
- **Staged OTP Verification (Zero-Orphan Database Pattern)**:
  - Pending registrations are held in a temporary staging collection.
  - Actual `User` documents are created **only after** OTP confirmation.
  - Integrated with **MongoDB TTL (Time-to-Live) indexes** for automatic 10-minute cleanup of expired attempts.
  - UI includes a **live `MM:SS` countdown timer**, reload persistence via `sessionStorage`, route guards, and one-click code resend.
- **Service Request Management**:
  - Employees create, view, comment on, and track service tickets.
  - Single-image attachment upload powered by **Cloudinary**.
  - Structured state machine: `REPORTED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`.
- **Technician Dispatch & Workload Management**:
  - Admins assign tickets to specialized technicians.
  - Technicians manage workload, update progress in real time, and submit resolution notes.
- **Feedback & Rating System**:
  - Employees can officially close resolved tickets and submit star ratings and performance reviews.
- **In-App Notification Center**:
  - Real-time alerts for ticket assignments, status transitions, and employee email verifications.
- **Admin Dashboard & Analytics**:
  - High-level KPIs, request breakdown charts via **Recharts**, and staff management.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React + Vite (SPA)                   │
│        Tailwind CSS · React Router · Lucide React      │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST (Axios)
┌──────────────────────────▼─────────────────────────────┐
│                   Express API Gateway                  │
│       JWT Auth · Multer · Rate Limiters · Morgan       │
├──────────────────────────┬─────────────────────────────┤
│                          │                             │
▼                          ▼                             ▼
┌───────────────┐  ┌────────────────┐         ┌────────────────────┐
│ MongoDB Atlas │  │ Cloudinary API │         │  SMTP Mail Server  │
│  (Data & TTL) │  │ (Image Assets) │         │ (Nodemailer / OTP) │
└───────────────┘  └────────────────┘         └────────────────────┘
```

---

## 🔄 Core Workflows

### 1. Service Request Lifecycle

```text
[Employee] ── Creates Issue ──► ( REPORTED )
                                     │
[Admin]    ── Assigns Tech  ──► ( ASSIGNED )
                                     │
[Tech]     ── Starts Work   ──► ( IN_PROGRESS )
                                     │
[Tech]     ── Submits Fix   ──► ( RESOLVED )
                                     │
[Employee] ── Confirms & Rates ► ( CLOSED )
```

### 2. Staged Email OTP Verification Flow

```text
1. Employee submits registration (@company.com)
   │
   ├── Password hashed (bcrypt) & 6-digit OTP generated
   └── Saved in temporary 'EmailVerification' collection (10-min TTL)
   │
2. Verification Email dispatched via Nodemailer
   │
3. Frontend redirects to /verify-email
   ├── Reads expiry timestamp into persistent sessionStorage
   └── Starts synchronized MM:SS countdown timer
   │
4. Employee submits 6-digit OTP
   ├── Valid OTP: Permanent 'User' created, staging record purged, JWT issued
   ├── Expired OTP: UI disables submit, prompts "Resend code", MongoDB TTL removes record
   └── Resend: Issues fresh code and resets countdown timer to 10:00
```

---

## 👥 Role-Based Access Control

| Capability | Employee | Technician | Administrator |
| :--- | :---: | :---: | :---: |
| Self-Registration with Company Email | ✅ | ❌ *(Admin Created)* | ❌ *(Seed / Direct)* |
| Submit Service Requests with Image | ✅ | ❌ | ❌ |
| View Assigned Work Orders | ❌ | ✅ | ✅ |
| Update Status (`In Progress` / `Resolved`) | ❌ | ✅ | ✅ |
| Assign Technicians & Set Priority | ❌ | ❌ | ✅ |
| Manage Staff & View System Analytics | ❌ | ❌ | ✅ |
| Comment on Tickets | ✅ | ✅ | ✅ |
| Close Ticket & Submit Rating | ✅ | ❌ | ❌ |

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Feedback**: React Hot Toast
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **File Uploads**: Multer & Cloudinary SDK
- **Email Service**: Nodemailer (SMTP)

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (reverse proxy for frontend)
- **CI/CD**: Jenkins Pipeline
- **Cloud Hosting**: AWS EC2 & MongoDB Atlas

---

## 🗄️ Database Schema & Models

- **`User`**: Core user entity storing name, email, password hash, role (`employee`, `technician`, `admin`), active status, and phone.
- **`EmailVerification`**: Temporary staging collection for employee registrations with TTL indexing (`expiresAt` index with `expireAfterSeconds: 0`).
- **`ServiceRequest`**: Service ticket containing category, title, description, priority, lifecycle status, reporter reference, assigned technician reference, resolution summary, and Cloudinary media details.
- **`TechnicianProfile`**: Specialization, active workload counter, and availability status.
- **`Comment`**: Threaded discussion entries linked to specific service requests.
- **`Notification`**: Activity and status alert logs linked to individual users.
- **`Rating`**: Post-resolution evaluation score (1-5 stars) and review notes.

---

## 🔌 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new employee (sends OTP)
- `POST /api/auth/verify-email` — Validate OTP and activate user account
- `POST /api/auth/resend-verification` — Issue fresh OTP and extend timer
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Retrieve current authenticated user profile

### Service Requests (`/api/requests`)
- `POST /api/requests` — Create a new ticket (supports single file upload)
- `GET /api/requests/my` — Fetch tickets submitted by current employee
- `GET /api/requests/:id` — Retrieve full ticket details
- `PUT /api/requests/:id` — Edit an open ticket
- `DELETE /api/requests/:id` — Cancel / delete an open ticket
- `PUT /api/requests/:id/close` — Mark resolved ticket as closed

### Technician Endpoints (`/api/technician`)
- `GET /api/technician/dashboard` — View assigned queue and metrics
- `GET /api/technician/requests` — List active assigned tasks
- `PUT /api/technician/requests/:id/status` — Move status to `IN_PROGRESS`
- `PUT /api/technician/requests/:id/resolve` — Submit fix notes and mark `RESOLVED`
- `GET /api/technician/profile` — View personal specialization details
- `PUT /api/technician/profile` — Update availability / skills

### Admin Management (`/api/admin`)
- `GET /api/admin/dashboard` — Overall metrics, KPIs, and status charts
- `GET /api/admin/requests` — Master list of all requests across company
- `GET /api/admin/employees` — List registered company employees
- `GET /api/admin/technicians` — List all registered service technicians
- `POST /api/admin/technicians` — Register and provision a new technician
- `PUT /api/admin/requests/:id/assign` — Assign technician to ticket
- `PUT /api/admin/requests/:id/priority` — Update ticket priority
- `PUT /api/admin/technicians/:id/status` — Toggle technician active status

### Comments, Notifications & Ratings
- `POST /api/requests/:id/comments` / `GET /api/requests/:id/comments` — Ticket discussion
- `GET /api/notifications` — Fetch user alerts
- `PUT /api/notifications/:id/read` — Mark single notification as read
- `PUT /api/notifications/read-all` — Mark all alerts as read
- `POST /api/requests/:id/rating` / `GET /api/requests/:id/rating` — Ticket feedback

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Server listener port | `5000` |
| `MONGODB_URI` | MongoDB Atlas or local connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `your_jwt_secret` |
| `CLIENT_URL` | Allowed CORS origin for frontend | `http://localhost:5173` |
| `COMPANY_EMAIL_DOMAIN`| Allowed domain for employee registrations | `fixmate.com` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret | `your_api_secret` |
| `SMTP_HOST` | Outgoing SMTP mail server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port (`587` for TLS / `465` for SSL) | `587` |
| `SMTP_SECURE` | Use SSL/TLS directly | `false` |
| `SMTP_USER` | SMTP username / email address | `notifications@fixmate.com` |
| `SMTP_PASS` | SMTP application password | `app_specific_password` |
| `SMTP_FROM` | Sender display name and email address | `FixMate <notifications@fixmate.com>`|

### Frontend (`frontend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of backend REST API | `http://localhost:5000/api` |
| `VITE_COMPANY_EMAIL_DOMAIN` | Company domain displayed on register screen | `fixmate.com` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or later
- **npm**: v9.x or later
- **MongoDB**: Running instance locally or a MongoDB Atlas cluster URI
- **Cloudinary Account**: For ticket image attachments

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Cloudinary, and SMTP credentials

# Seed demo users, technicians, and sample tickets
npm run seed

# Start development server
npm run dev
```
Backend will start on `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start Vite development server
npm run dev
```
Frontend will open on `http://localhost:5173`.

---

## 🔑 Demo Accounts

When you run `npm run seed` in the backend, the following accounts are provisioned for testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `alex.admin@fixmate.com` | `Admin@123` |
| **Technician** | `rohan.tech@fixmate.com` | `Tech@123` |
| **Employee** | `sara@fixmate.com` | `Employee@123` |

*(These accounts are intended for local development and testing only).*

---

## 🐳 Docker & Containerization

FixMate includes production Dockerfiles for both services and an orchestration configuration via `docker-compose.yml`.

### Running with Docker Compose:

```bash
# Ensure backend/.env exists with valid credentials
docker compose up --build -d
```

- **Frontend** accessible at `http://localhost:5173` (served via Nginx with `/api` proxy).
- **Backend** running containerized with built-in `/api/health` healthcheck.

---

## 🔄 CI/CD Pipeline (Jenkins & AWS)

The repository includes a production-grade [`Jenkinsfile`](./Jenkinsfile) configured for automated continuous integration and deployment:

```text
GitHub Push ──► Jenkins Webhook
                    │
                    ├── Checkout SCM & inject production credentials
                    ├── Docker container & image cache pruning
                    ├── Multi-stage backend & frontend image builds
                    ├── Docker Hub image push (`sheevanulhaq/fixmate-*`)
                    └── Deployment to AWS EC2 via `docker compose pull && up`
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
