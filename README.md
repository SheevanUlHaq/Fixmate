# FixMate

FixMate is a production-style internal service-request and maintenance management platform built with the MERN stack.

## Features

- JWT + bcrypt authentication
- Role-based access for employees, technicians and admins
- Service request CRUD
- Single-image Cloudinary upload
- Request lifecycle: Reported → Assigned → In Progress → Resolved → Closed
- Comments
- In-app notifications
- Employee ratings
- Technician profiles and workload
- Admin analytics and request management
- Responsive SaaS dashboard UI
- Demo seed data
- Environment-based configuration

## Tech Stack

Frontend: React, Vite, Tailwind CSS, Axios, React Router, Lucide React, Recharts  
Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Multer, Cloudinary

## Architecture

```text
React + Vite
     |
   Axios
     |
Express REST API
     |
Controllers / Middleware / Models
     |
MongoDB Atlas
     |
Cloudinary (single request image)
```

## Roles

### Employee
Create requests, track status, comment, close resolved requests and rate completed requests.

### Technician
See assigned work, update status, add comments/resolution notes and manage their profile.

### Admin
Manage requests, assign technicians, change priorities, manage technicians/users and view analytics.

## Application Flow

```text
Employee creates request
        ↓
      REPORTED
        ↓
Admin assigns technician
        ↓
      ASSIGNED
        ↓
Technician starts work
        ↓
    IN_PROGRESS
        ↓
Technician resolves
        ↓
      RESOLVED
        ↓
Employee closes
        ↓
       CLOSED
        ↓
      Rating
```

## Database Models

- User
- ServiceRequest
- TechnicianProfile
- Comment
- Notification
- Rating

`ServiceRequest` stores one Cloudinary URL and one `imagePublicId`; it intentionally does not support image arrays or multiple attachments.

## API Overview

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Requests
- POST `/api/requests`
- GET `/api/requests/my`
- GET `/api/requests/:id`
- PUT `/api/requests/:id`
- DELETE `/api/requests/:id`
- PUT `/api/requests/:id/close`

### Technician
- GET `/api/technician/dashboard`
- GET `/api/technician/requests`
- PUT `/api/technician/requests/:id/status`
- PUT `/api/technician/requests/:id/resolve`
- GET `/api/technician/profile`
- PUT `/api/technician/profile`

### Admin
- GET `/api/admin/dashboard`
- GET `/api/admin/requests`
- GET `/api/admin/users`
- GET `/api/admin/technicians`
- PUT `/api/admin/requests/:id/assign`
- PUT `/api/admin/requests/:id/priority`
- PUT `/api/admin/technicians/:id/status`

### Comments
- POST `/api/requests/:id/comments`
- GET `/api/requests/:id/comments`

### Notifications
- GET `/api/notifications`
- PUT `/api/notifications/:id/read`
- PUT `/api/notifications/read-all`

### Ratings
- POST `/api/requests/:id/rating`
- GET `/api/requests/:id/rating`

## Environment Variables

Backend `.env`:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:5173
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Demo Credentials

The seed script creates:

```text
Admin:
admin@fixmate.local
Admin@123

Technician:
tech@fixmate.local
Tech@123

Employee:
employee@fixmate.local
Employee@123
```

These are for local development only.

## Project Structure

```text
fixmate/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seed.js
│   └── server.js
├── frontend/
│   └── src/
├── .gitignore
└── README.md
```

## Future DevOps Setup

The project is intentionally deployment-friendly but does not implement CI/CD yet.

```text
GitHub
   ↓
Jenkins
   ↓
Tests
   ↓
Docker Build
   ↓
Docker Hub
   ↓
AWS EC2
```

Future deployment can place Nginx in front of the frontend/API and inject production environment variables at runtime.

## Notes

- Backend uses straightforward controllers and middleware rather than service/repository layers.
- JWT payload contains only `userId` and `role`.
- Cloudinary secrets never reach the frontend.
- Request status transitions are validated server-side.
