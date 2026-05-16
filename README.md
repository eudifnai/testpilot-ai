# TestPilot AI

TestPilot AI is an AI-assisted testing workbench for QA engineers and small delivery teams. This MVP focuses on requirement analysis, structured testcase generation, and Excel export.

## P0 Features

- Requirement analysis from plain-text product requirements
- Structured testcase generation with configurable case types and case count
- Testcase table preview in the web UI
- Excel export for generated testcases
- Unified backend AI service wrapper with local fallback output

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios
- Backend: FastAPI, Pydantic, SQLAlchemy, SQLite, OpenAI-compatible API
- Export: openpyxl

## Project Structure

```text
testpilot-ai/
  frontend/
  backend/
  docs/
```

## Getting Started

Startup steps will be completed as modules are implemented in this repository.

## Roadmap

- P1: API testcase generation, bug analysis, test report generation
- P1: generation history and SQLite persistence
- P2: integrations, project management, and automation enhancements
