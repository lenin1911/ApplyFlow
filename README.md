# ApplyFlow (Placement Tracker)

**ApplyFlow** is a modern full-stack job application and placement tracking system. It provides job seekers with a streamlined workspace to manage job applications, track interview stages, view pipeline analytics, and store application notes with multi-user security and data isolation.

---

## Features

- **User Authentication & Authorization**:
  - Secure registration, login, and profile retrieval via FastAPI JWT tokens (Argon2 password hashing).
  - OAuth and Magic Link authentication support via Firebase in the React frontend.
  - Multi-user data isolation—users only see and manage their own applications.

- **Job Application Management (CRUD)**:
  - Create, view, update, and delete job applications.
  - Track application attributes: Company Name, Job Title, Status (`Applied`, `Interview`, `Offer`, `Rejected`), Job URL, Notes, and Applied Date.

- **Search, Filter, Pagination & Sorting**:
  - Filter applications by status (`Applied`, `Interview`, `Offer`, `Rejected`).
  - Search applications by company name (case-insensitive partial match).
  - Configurable pagination (`page`, `limit`) and automatic sorting (newest applied date first).

- **Pipeline Statistics & Analytics**:
  - Get real-time application metrics (total count, breakdown by application status).

- **Database Migrations**:
  - Asynchronous database operations powered by Async SQLAlchemy 2.0 and Alembic database migrations.

---

## Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (AsyncIO)
- **Database Driver**: `asyncpg` (PostgreSQL) / `aiosqlite` (SQLite for testing/development)
- **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Authentication**: `PyJWT` & `pwdlib` (Argon2 password hashing)
- **Package Management**: [`uv`](https://github.com/astral-sh/uv)

### Frontend
- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) (Google, GitHub, Email Link)

---

## Project Structure

```
├── alembic/                # Alembic database migration scripts
├── app/
│   ├── api/                # FastAPI API route handlers (auth, application)
│   ├── core/               # App configuration & security functions
│   ├── db/                 # Database engine and session setup
│   ├── models/             # SQLAlchemy ORM database models (User, Application)
│   ├── schemas/            # Pydantic schemas for request validation & responses
│   └── main.py             # FastAPI main application entry point
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/                # React source code (components, services)
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite build configuration
├── tests/
│   └── test_backend.py     # End-to-end backend integration tests
├── alembic.ini             # Alembic configuration
├── pyproject.toml          # Python project specification and dependencies
└── README.md               # Project documentation
```

---

## Environment Variables

Create a `.env` file in the project root directory with the following configuration:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/placement
SECURITY_KEY=your-super-secret-key-at-least-32-bytes-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

---

## Getting Started

### Prerequisites

- **Python**: 3.12 or higher
- **uv**: Python package installer and dependency resolver (`pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **Node.js**: v18 or higher (with `npm`)
- **PostgreSQL** database (or SQLite for local development/testing)

---

### Backend Setup

1. **Install Dependencies**
   ```bash
   uv sync
   ```

2. **Run Database Migrations**
   Ensure your database specified in `DATABASE_URL` is accessible, then run:
   ```bash
   uv run alembic upgrade head
   ```

3. **Start the Backend API Server**
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at `http://127.0.0.1:8000`.
   Interactive API documentation (Swagger UI) is accessible at `http://127.0.0.1:8000/docs`.

---

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The frontend app will run locally (typically at `http://localhost:5173`).

---

## API Reference

### Health Checks
- `GET /` - Root status check.
- `GET /test-db` - Database connectivity verification.

### Authentication Endpoints (`/auth`)
- `POST /auth/register` - Register a new user (`username`, `email`, `password`).
- `POST /auth/login` - Authenticate user and receive a JWT access token.
- `GET /auth/me` - Retrieve current authenticated user details (requires `Authorization: Bearer <token>`).

### Application Endpoints (`/applications`)
*(Requires Bearer JWT Authentication)*
- `POST /applications/` - Create a new job application.
- `GET /applications/` - Retrieve applications for current user with optional query parameters:
  - `status`: Filter by status (`Applied`, `Interview`, `Offer`, `Rejected`).
  - `company`: Case-insensitive partial search by company name.
  - `page`: Page number (default: `1`).
  - `limit`: Items per page (default: `10`, max: `100`).
- `GET /applications/stats` - Retrieve application breakdown statistics for the authenticated user.
- `GET /applications/{id}` - Retrieve details of a specific application.
- `PUT /applications/{id}` - Update an application.
- `DELETE /applications/{id}` - Delete an application.

---

## Running Tests

To run the full backend integration test suite:

```bash
DATABASE_URL="sqlite+aiosqlite:///test.db" SECURITY_KEY="a_very_secret_key_that_is_32_bytes_long_!" uv run python3 -c "
import asyncio
from app.db.session import engine
from app.db.base import Base
from app.models.user import User
from app.models.application import Application

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(init())
"

DATABASE_URL="sqlite+aiosqlite:///test.db" SECURITY_KEY="a_very_secret_key_that_is_32_bytes_long_!" uv run pytest
```

---

## License

This project is licensed under the MIT License.
