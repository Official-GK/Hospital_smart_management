# Smart Hospital QMS — Phase 1 Prototype

A professional admin portal for the Smart Hospital Appointment & Queue Management System.

---

## Quick Start

### 1. Backend (FastAPI)
```bash
cd backend
pip3 install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```
Backend runs at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## Login Credentials (Prototype)

| Field    | Value    |
|----------|----------|
| User ID  | admin    |
| Password | abc@123  |

---

## Features Implemented

- **Admin Login** — `/login`
- **Admin Dashboard** — `/admin/dashboard` (5 placeholder sections)
- **User Management** — `/admin/users` (Create, List, Delete users)
- **Role Assignment** — Staff / Management / Admin
- **Sidebar Navigation** — Dashboard, Create Users, Logout
- **Protected Routes** — Unauthenticated access redirects to login

## Features NOT Implemented (Future Phases)

- Patient registration & profiles
- Appointment booking / modification / cancellation
- Doctor scheduling & allocation
- Token & queue management
- MongoDB Atlas integration
- Role-based permission matrices
- Advanced analytics & reporting
