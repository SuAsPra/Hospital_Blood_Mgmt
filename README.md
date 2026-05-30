# Smart Hospital and Blood Bank Management System

A full-stack MERN application for managing hospital services, blood bank operations, appointments, doctors, patients, medicines, and orders.

Made by `24BRS1009` for a Web Development course project.

## GitHub Description

Smart Hospital and Blood Bank Management System built with the MERN stack, featuring role-based dashboards for admins, doctors, and patients, plus appointment booking, blood stock workflows, and medicine ordering.

## Features

- JWT authentication with role-based access.
- Public, patient, doctor, and admin-facing workflows.
- Doctor listing with specialization and availability details.
- Appointment booking and appointment status management.
- Blood stock visibility, donation requests, blood requests, and admin blood stock controls.
- Medicine catalog, cart-style ordering, and order status updates.
- Admin dashboard for doctors, patients, appointments, blood stock, and orders.

## Tech Stack

- Frontend: React, Vite, Axios, React Router
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT and bcryptjs

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
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas or a local MongoDB server

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:5173
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@medicare.com
ADMIN_PASSWORD=ChangeThisStrongPassword
ADMIN_REGISTER_KEY=OptionalInviteKeyForAdminSignup
```

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Do not commit `.env` files. Keep real database URLs, JWT secrets, and passwords local.

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Running Locally

Start the backend API:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Useful Scripts

Backend:

```bash
npm run dev
npm start
npm run seed
npm run create-admin
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

## API Overview

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Admin:

- `POST /api/admin/login`
- `GET /api/admin/doctors`
- `GET /api/admin/patients`
- `GET /api/admin/appointments`
- `GET /api/admin/blood`
- `GET /api/admin/orders`

Doctors:

- `GET /api/doctors`
- `GET /api/doctors/me`
- `PUT /api/doctors/me`
- `GET /api/doctors/:id`
- `POST /api/doctors`
- `PUT /api/doctors/:id`

Patients:

- `POST /api/patients`
- `GET /api/patients/me`
- `GET /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`

Appointments:

- `POST /api/appointments`
- `GET /api/appointments`
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id`

Blood Bank:

- `GET /api/blood`
- `POST /api/blood`
- `POST /api/blood/donation`
- `POST /api/blood/requests`
- `GET /api/blood/requests/me`
- `GET /api/blood/requests`

Medicines:

- `GET /api/medicines`
- `POST /api/medicines`
- `PUT /api/medicines/:id`

Orders:

- `POST /api/orders`
- `GET /api/orders`
- `PUT /api/orders/:id`

## Deployment Notes

- Set `MONGO_URI`, `JWT_SECRET`, and admin credentials in the backend hosting environment.
- Set `VITE_API_BASE_URL` to the deployed backend URL before building the frontend.
- Add the deployed frontend URL to `CORS_ORIGIN`.
- If using MongoDB Atlas, allow the deployment server IP address in Network Access.

## Repository Hygiene

The repository should track source files, package manifests, lock files, public assets, and example environment files. It should not track:

- `node_modules/`
- `dist/`
- `.env`
- logs or local machine files
