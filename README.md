# ApplyFlow 🎓

A backend-focused Student Placement & Job Application Tracker built with FastAPI and PostgreSQL.

ApplyFlow is designed to help students manage their placement and job applications in one place — from tracking companies and application stages to managing interviews, deadlines, resumes, and placement analytics.

## 🚧 Project Status

**Currently in development**

The initial backend and database foundation has been completed. Authentication, application management, analytics, and other features will be added progressively.

## 🎯 Planned Features

- 🔐 JWT-based authentication
- 👤 Multi-user support
- 🏢 Company management
- 💼 Job application tracking
- 📌 Application stages
- 📅 Interview and deadline tracking
- 📄 Resume version tracking
- 🔎 Search, filtering, and sorting
- 📊 Placement and application analytics
- 🔔 Deadline reminders
- 👑 Admin capabilities
- 📥 CSV import/export

## 🛠️ Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy 2.0
- asyncpg

### Database
- PostgreSQL
- Alembic

### Authentication
- JWT
- Password hashing
- Role-based authorization

### Deployment
- Docker
- Docker Compose

## 📁 Project Structure

```text
ApplyFlow/
│
├── app/
│   ├── main.py
│   │
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   │
│   └── models/
│       ├── __init__.py
│       └── user.py
│
├── .env
├── .gitignore
├── pyproject.toml
└── README.md