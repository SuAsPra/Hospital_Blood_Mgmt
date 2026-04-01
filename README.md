# Smart Hospital and Blood Bank Management System

A full-stack MERN application for hospital operations, patient services, blood bank workflows, and pharmacy order management.

**Made by `24BRS1009` for a Web Development course project.**

## GitHub Description (Use This)
Smart Hospital and Blood Bank Management System (MERN stack) with role-based dashboards for Admin, Doctor, and Patient, including appointments, blood stock workflows, and pharmacy ordering.

## Features
- JWT authentication with role-based authorization
- Separate login and dashboards for Admin, Doctor, and Patient/Public user
- Doctor discovery with specialization and availability
- Appointment booking and role-based appointment updates
- Blood stock visibility, donation/request flow, and admin stock controls
- Medicine listing, cart, and checkout flow (Patient + Doctor)
- Admin operations:
  - View doctor profiles
  - Edit patient medical history
  - Manage appointments
  - Manage order statuses
  - Reduce/close blood supply by blood group

## Tech Stack
- Frontend: React + Vite + Axios
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs

## Project Structure
```text
HOSPITAL_BANK_MERN/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── seed.js
│   │   └── createAdmin.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── styles.css
│   └── package.json
└── README.md
```

## Setup Instructions

### 1) Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:5173
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@medicare.com
ADMIN_PASSWORD=ChangeThisStrongPassword
ADMIN_REGISTER_KEY=OptionalInviteKeyForAdminSignup
```

Run backend:
```bash
npm run dev
```

Optional:
```bash
npm run seed
npm run create-admin
```

### 2) Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```

Build frontend:
```bash
npm run build
```

## Main API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Admin
- `POST /api/admin/login`
- `GET /api/admin/doctors`
- `GET /api/admin/doctors/:id`
- `GET /api/admin/patients`
- `PUT /api/admin/patients/:id/medical-history`
- `GET /api/admin/appointments`
- `PUT /api/admin/appointments/:id`
- `GET /api/admin/blood`
- `PATCH /api/admin/blood/:id/reduce`
- `PATCH /api/admin/blood/:id/close`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/:id`

### Doctors
- `GET /api/doctors`
- `GET /api/doctors/me`
- `PUT /api/doctors/me`
- `GET /api/doctors/:id`
- `POST /api/doctors` (admin)
- `PUT /api/doctors/:id` (admin)

### Patients
- `POST /api/patients`
- `GET /api/patients/me`
- `GET /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `PATCH /api/patients/:id/admit`
- `PATCH /api/patients/:id/discharge`

### Appointments
- `POST /api/appointments`
- `GET /api/appointments`
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id`

### Blood Bank
- `GET /api/blood`
- `POST /api/blood`
- `POST /api/blood/donation`
- `POST /api/blood/requests`
- `GET /api/blood/requests/me`
- `GET /api/blood/requests`

### Medicines
- `GET /api/medicines`
- `POST /api/medicines`
- `PUT /api/medicines/:id`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `PUT /api/orders/:id`

## Notes
- If you use MongoDB Atlas, whitelist your current IP in Network Access.
- Keep `JWT_SECRET` strong and never commit `.env` files.
- This project is course-focused and can be extended with payments, notifications, and audit logs.
