# TestPilot AI

TestPilot AI is an AI-assisted testing workbench for QA engineers and small delivery teams. This MVP focuses on requirement analysis, structured testcase generation, and Excel export.

## Features

- Requirement analysis from plain-text product requirements
- Structured testcase generation with configurable case types and case count
- Testcase table preview in the web UI
- Excel export for generated testcases
- Unified backend AI service wrapper with local fallback output
- Local fallback mode when no OpenAI-compatible credentials are configured

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios
- Backend: FastAPI, Pydantic, SQLAlchemy, SQLite, OpenAI-compatible API
- Export: openpyxl

## Project Structure

```text
testpilot-ai/
  frontend/
    src/
      components/
      pages/
      services/
      types/
      utils/
  backend/
    app/
      api/routes/
      core/
      schemas/
      services/
  docs/
```

## Getting Started

### 1. Start the backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Backend default URL: `http://127.0.0.1:8000`

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://127.0.0.1:5173`

### 3. Optional frontend environment override

Create `frontend/.env.local` when you want the frontend to call a custom backend URL instead of the Vite proxy:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Environment Variables

Backend `.env`:

```text
OPENAI_API_KEY=
OPENAI_BASE_URL=
MODEL_NAME=gpt-4o-mini
DATABASE_URL=sqlite:///./testpilot.db
```

Notes:

- `OPENAI_API_KEY` is optional in local development
- if no AI credentials are configured, the backend returns deterministic fallback output
- frontend never calls the model provider directly

## Implemented API

- `POST /api/ai/analyze-requirement`
- `POST /api/ai/generate-testcases`
- `POST /api/export/testcases`

## Local Workflow

1. Open the dashboard
2. Paste a requirement into `Requirement Analysis` or `Testcase Generator`
3. Generate results from the backend
4. Review cases in the table
5. Export the generated testcases to Excel

## P0 Status

- Done: project scaffold
- Done: backend AI wrapper and export APIs
- Done: dashboard, requirement analysis page, testcase generation page
- Done: startup documentation

## Roadmap

- P1: API testcase generation, bug analysis, test report generation
- P1: generation history and SQLite persistence
- P2: integrations, project management, and automation enhancements
