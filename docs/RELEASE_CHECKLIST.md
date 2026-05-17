# Release Checklist

Use this checklist before handing the project to another engineer, demoing externally, or packaging a release candidate.

## Environment

- Confirm backend environment variables are set from `backend/.env.production.example`
- Confirm frontend environment variables are set from `frontend/.env.production.example`
- Confirm production database path or external database is writable and persistent
- Confirm no real secrets are committed in the repository

## Backend

- Install dependencies with `pip install -r requirements.txt`
- Run automated tests with `pytest`
- Start API locally with `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Verify `/health` returns `{"status":"ok"}`
- Verify fallback mode still works when no model credentials are provided

## Frontend

- Install dependencies with `npm install`
- Build production assets with `npm run build`
- Verify the built app can reach the configured API base URL
- Smoke-test dashboard, requirement analysis, testcase generation, version loading, and report export flows

## Functional Smoke Checks

- Requirement analysis returns structured sections
- Testcase generation returns a table and exports Excel
- API test generation returns parsed endpoint details and cases
- Bug analyzer returns report, severity, and checklist
- Test report page generates markdown and exports `.md`
- History panel loads recent items and opens structured details
- Testcase versions can be save/load/update/delete

## Handoff

- README reflects the current feature set and startup flow
- `docs/DEMO_DATA.md` is ready for demo runs
- `docs/API_SPEC.md` matches the current backend routes
- Current git worktree is clean before release tagging or archive
