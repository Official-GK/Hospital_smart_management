# Smart Hospital QMS — Phase 1 Prototype

A professional admin portal for the Smart Hospital Appointment & Queue Management System.

🌐 **Live Demo (GitHub Pages)**: [https://official-gk.github.io/Hospital_smart_management/](https://official-gk.github.io/Hospital_smart_management/)

---

## 🚀 Live Demo on GitHub Pages

The frontend is ready to run on GitHub Pages!

To activate GitHub Pages in your repository:
1. Go to your repository on GitHub: [Official-GK/Hospital_smart_management](https://github.com/Official-GK/Hospital_smart_management)
2. Click **Settings** (top navigation tab)
3. In the left sidebar, click **Pages**
4. Under **Build and deployment** > **Source**:
   - Select **Deploy from a branch**
   - Branch: select **`gh-pages`** and folder **`/(root)`**
   - Click **Save**
5. Within 1-2 minutes, your live site is active at:
   👉 **`https://official-gk.github.io/Hospital_smart_management/`**

> **Note**: For the static GitHub Pages demo, login credentials (`admin` / `abc@123`) and user management run with a seamless in-browser client store so anyone can test the interface immediately without needing a local Python server!

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
