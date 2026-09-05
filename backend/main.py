"""
Smart Hospital Queue Management System — Backend API
Phase 1 Prototype: Admin Auth + User Management
"""

import json
import os
import secrets
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─── App Setup ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="Smart Hospital Queue Management API",
    description="Phase 1 Prototype API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Paths ───────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
USERS_FILE = DATA_DIR / "users.json"

DATA_DIR.mkdir(exist_ok=True)
if not USERS_FILE.exists():
    USERS_FILE.write_text("[]")

# ─── Hardcoded Admin Credentials (Prototype Only) ────────────────────────────

ADMIN_USER_ID = "admin"
ADMIN_PASSWORD = "abc@123"

# In-memory token store: { token: user_id }
active_sessions: dict[str, str] = {}

# ─── Helpers ─────────────────────────────────────────────────────────────────


def read_users() -> list[dict]:
    try:
        return json.loads(USERS_FILE.read_text())
    except Exception:
        return []


def write_users(users: list[dict]) -> None:
    USERS_FILE.write_text(json.dumps(users, indent=2))


def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """Dependency: validates bearer token, returns user_id."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    user_id = active_sessions.get(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return user_id


# ─── Schemas ─────────────────────────────────────────────────────────────────


class LoginRequest(BaseModel):
    user_id: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user_id: str
    full_name: str
    role: str


class CreateUserRequest(BaseModel):
    user_id: str
    full_name: str
    password: str
    role: str  # Staff | Management | Admin


class UserResponse(BaseModel):
    user_id: str
    full_name: str
    role: str
    created_at: str


# ─── Routes ──────────────────────────────────────────────────────────────────


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Smart Hospital API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


# ── Auth ──────────────────────────────────────────────────────────────────────


@app.post("/api/auth/login", response_model=LoginResponse, tags=["Auth"])
def login(body: LoginRequest):
    """Authenticate admin or created users."""
    # Check hardcoded admin first
    if body.user_id == ADMIN_USER_ID and body.password == ADMIN_PASSWORD:
        token = secrets.token_hex(32)
        active_sessions[token] = ADMIN_USER_ID
        return LoginResponse(
            token=token,
            user_id=ADMIN_USER_ID,
            full_name="Administrator",
            role="Admin",
        )

    # Check created users
    users = read_users()
    for user in users:
        if user["user_id"] == body.user_id and user["password"] == body.password:
            token = secrets.token_hex(32)
            active_sessions[token] = user["user_id"]
            return LoginResponse(
                token=token,
                user_id=user["user_id"],
                full_name=user["full_name"],
                role=user["role"],
            )

    raise HTTPException(status_code=401, detail="Invalid User ID or Password")


@app.post("/api/auth/logout", tags=["Auth"])
def logout(current_user: str = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """Invalidate the current session token."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        active_sessions.pop(token, None)
    return {"message": "Logged out successfully"}


# ── Users ─────────────────────────────────────────────────────────────────────

VALID_ROLES = {"Staff", "Management", "Admin"}


@app.get("/api/users", response_model=list[UserResponse], tags=["Users"])
def list_users(current_user: str = Depends(get_current_user)):
    """Return all created users (excluding hardcoded admin)."""
    users = read_users()
    return [
        UserResponse(
            user_id=u["user_id"],
            full_name=u["full_name"],
            role=u["role"],
            created_at=u.get("created_at", ""),
        )
        for u in users
    ]


@app.post("/api/users", response_model=UserResponse, status_code=201, tags=["Users"])
def create_user(body: CreateUserRequest, current_user: str = Depends(get_current_user)):
    """Create a new user."""
    # Validate role
    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")

    # Prevent duplicate user_id
    if body.user_id.lower() == ADMIN_USER_ID:
        raise HTTPException(status_code=409, detail="User ID 'admin' is reserved")

    users = read_users()
    existing_ids = {u["user_id"].lower() for u in users}
    if body.user_id.lower() in existing_ids:
        raise HTTPException(status_code=409, detail=f"User ID '{body.user_id}' already exists")

    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    new_user = {
        "user_id": body.user_id,
        "full_name": body.full_name,
        "password": body.password,  # plaintext for prototype only
        "role": body.role,
        "created_at": now,
    }
    users.append(new_user)
    write_users(users)

    return UserResponse(
        user_id=new_user["user_id"],
        full_name=new_user["full_name"],
        role=new_user["role"],
        created_at=new_user["created_at"],
    )


@app.delete("/api/users/{user_id}", tags=["Users"])
def delete_user(user_id: str, current_user: str = Depends(get_current_user)):
    """Delete a user by user_id."""
    if user_id.lower() == ADMIN_USER_ID:
        raise HTTPException(status_code=403, detail="Cannot delete the admin account")

    users = read_users()
    filtered = [u for u in users if u["user_id"] != user_id]

    if len(filtered) == len(users):
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")

    write_users(filtered)
    return {"message": f"User '{user_id}' deleted successfully"}
