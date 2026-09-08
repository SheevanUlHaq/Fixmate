# FixMate 🛠️

> **Internal Service Request & Maintenance Management System**

FixMate is a full-stack web application that helps organizations manage maintenance and service requests from **issue reporting to resolution**. Employees can raise and track requests, technicians can manage assigned work, and administrators can oversee users, priorities, assignments, and system activity.

## ✨ Features

- 🔐 JWT authentication with role-based access control
- 📧 OTP-based email verification
- 📝 Service request creation, tracking, and status management
- 👨‍🔧 Technician assignment and workload management
- 🖼️ Image uploads using Cloudinary
- 💬 Request comments and in-app notifications
- ⭐ Ratings and reviews for completed requests
- 📊 Admin dashboard with request analytics
- 👤 Employee, Technician, and Admin profiles
- 🐳 Docker & Docker Compose support
- 🔄 Jenkins CI/CD with Docker Hub and AWS EC2

## 👥 User Roles

| Role | Responsibilities |
|---|---|
| **Employee** | Create requests, track progress, comment, close resolved requests, and submit ratings |
| **Technician** | View assigned requests, update status, submit resolutions, and manage availability |
| **Admin** | Manage users and technicians, assign requests, change priorities, and monitor analytics |

### Request Flow

```text
REPORTED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
```

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Recharts

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs

**Services:** Cloudinary, Nodemailer

**DevOps:** Docker, Docker Compose, Nginx, Jenkins, Docker Hub, AWS EC2, MongoDB Atlas

## 🏗️ Architecture

```text
                    ┌──────────────┐
                    │   Browser    │
                    └──────┬───────┘
                           ↓
                    React / Vite
                           ↓
                       Nginx
                           ↓
                    Express API
                    ↙     ↓      ↘
             MongoDB   Cloudinary   SMTP
              Atlas
```

The frontend is served through Nginx, which proxies `/api` requests to the Express backend. MongoDB Atlas is used for application data, Cloudinary for uploaded images, and SMTP for email verification.

## 🚀 Getting Started

### Prerequisites

- Node.js
- MongoDB / MongoDB Atlas
- Cloudinary account
- SMTP credentials

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd FixMate
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Configure `backend/.env` using `backend/.env.example`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Configure `frontend/.env` using `frontend/.env.example`.

## 🐳 Docker

To run the application using Docker Compose:

```bash
docker compose up -d --build
```

Useful commands:

```bash
docker compose ps
docker compose logs -f
docker compose down
```

## 🔄 CI/CD

FixMate uses Jenkins to automate the deployment pipeline:

```text
GitHub
   ↓
Jenkins
   ↓
Docker Build
   ↓
Docker Hub
   ↓
AWS EC2
```

The application is deployed as Docker containers, with the frontend served by Nginx and the backend connected to MongoDB Atlas.

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- OTP verification
- Environment-based secrets
- Upload type and size validation
- Protected API routes

> **Never commit `.env` files, credentials, or private keys to the repository.**

## 📁 Project Structure

```text
FixMate/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── Dockerfile
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
└── Jenkinsfile
```

## 🚧 Future Improvements

- Real-time notifications
- Automated technician assignment
- SLA and escalation management
- Advanced reporting
- Automated testing in CI/CD

---

**FixMate — making internal service management simpler, faster, and more organized.**
