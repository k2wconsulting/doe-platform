# AI-Assisted DoE Platform

A production-grade Design of Experiments platform tailored for chemical formulation (paints & coatings).

## 🚀 Architecture
- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS
- **Backend**: FastAPI (Python), LangChain, FAISS
- **Database**: PostgreSQL
- **Reverse Proxy**: Nginx
- **Deployment**: Docker Compose

## 📁 Repository Structure
- `/frontend`: Next.js web application
- `/backend`: FastAPI Python server
- `/database`: SQL initialization scripts
- `docker-compose.yml`: Local orchestrator
- `nginx.conf`: Routing

## 🛠️ Quick Start
Make sure you have Docker and Docker Compose installed.

```bash
# 1. Clone the repo and navigate into the folder
cd DoE

# 2. Build and start the services
docker-compose up --build -d
```

### Services Map
- **Frontend:** `http://localhost:3000` or `http://localhost` (via Nginx)
- **Backend API:** `http://localhost:8000` or `http://localhost/api/`
- **PostgreSQL:** `localhost:5432`

## 🧪 CI/CD
This repository includes a GitHub Actions workflow `.github/workflows/ci.yml` that will:
1. Lint the Python backend.
2. Verify Next.js frontend builds correctly.
