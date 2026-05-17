# TestPilot AI

TestPilot AI is an AI-assisted testing workbench for QA engineers and small delivery teams. This MVP focuses on requirement analysis, structured testcase generation, and Excel export.

## Features

- Requirement analysis from plain-text product requirements
- Structured testcase generation with configurable case types and case count
- Testcase table preview in the web UI
- Excel export for generated testcases
- API testcase generation from API documents or curl snippets
- Bug analysis with structured report, causes, and developer checklist
- Markdown test report generation
- Recent generation history backed by SQLite
- Editable testcase review before copy or Excel export
- History detail view with workflow replay into generation pages
- Saved testcase version snapshots with reload support
- Testcase version rename and delete actions
- Structured JSON preview inside history detail
- Field-level copy actions in history detail
- One-click single testcase copy from the testcase table
- Markdown report export to `.md`
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
- `POST /api/ai/generate-api-tests`
- `POST /api/ai/analyze-bug`
- `POST /api/ai/generate-report`
- `GET /api/ai/history/recent`
- `GET /api/ai/history/{id}`
- `POST /api/testcase-versions`
- `GET /api/testcase-versions`
- `GET /api/testcase-versions/{id}`
- `PUT /api/testcase-versions/{id}`
- `DELETE /api/testcase-versions/{id}`
- `POST /api/export/testcases`

## Testing

Backend automated tests:

```bash
cd backend
.venv\Scripts\activate
pytest
```

Current coverage focus:

- requirement analysis API
- testcase generation API
- Excel export API
- API test generation, bug analysis, and report generation APIs
- history detail API
- testcase version save, load, update, and delete

## Deployment Notes

### Backend

- run with `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- set `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `MODEL_NAME`, and `DATABASE_URL` in the runtime environment
- use a persistent database path or external database instead of ephemeral local storage in production
- start from [backend/.env.production.example](E:\ai_project\testpilot-ai\backend\.env.production.example) when preparing a production deployment

### Frontend

- build with `npm run build`
- serve `frontend/dist/` with any static file server or reverse proxy
- point `VITE_API_BASE_URL` to the deployed backend API when not using a local proxy
- start from [frontend/.env.production.example](E:\ai_project\testpilot-ai\frontend\.env.production.example) for production environment variables

## Demo Assets

- Demo walkthrough data: [docs/DEMO_DATA.md](E:\ai_project\testpilot-ai\docs\DEMO_DATA.md)
- API reference: [docs/API_SPEC.md](E:\ai_project\testpilot-ai\docs\API_SPEC.md)
- Prompt notes: [docs/PROMPTS.md](E:\ai_project\testpilot-ai\docs\PROMPTS.md)
- Release checklist: [docs/RELEASE_CHECKLIST.md](E:\ai_project\testpilot-ai\docs\RELEASE_CHECKLIST.md)

## Local Workflow

1. Open the dashboard
2. Paste a requirement into `Requirement Analysis` or `Testcase Generator`
3. Generate results from the backend
4. Review cases in the table or copy the generated content
5. Click any generated testcase row to edit it before export
6. Export generated testcases to Excel when needed
7. Use `API Test Generator`, `Bug Analyzer`, and `Test Report` for the broader QA workflow
8. Review recent generation results from the dashboard history panel and replay them back into the relevant page
9. Save important testcase snapshots as named versions and reload them later

## Delivery Status

- Done: project scaffold
- Done: backend AI wrapper and export APIs
- Done: dashboard, requirement analysis page, testcase generation page
- Done: API testcase generation page and endpoint
- Done: bug analysis page and endpoint
- Done: test report page and endpoint
- Done: SQLite-backed generation history
- Done: testcase editing, replay, and snapshot version management
- Done: backend regression tests and production env templates
- Done: demo data and release checklist documentation
- Done: startup documentation

## Roadmap

- Next: refine prompts and add richer structured editing workflows
- Next: Jira and collaboration-tool integrations
- Later: automation generation, project management workflows, and deeper reporting
