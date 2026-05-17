from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, get_db
from app.main import app


@pytest.fixture
def client(tmp_path: Path) -> Generator[TestClient, None, None]:
    database_path = tmp_path / "test_api.db"
    engine = create_engine(
        f"sqlite:///{database_path}",
        connect_args={"check_same_thread": False},
    )
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_requirement_analysis_and_history(client: TestClient) -> None:
    response = client.post(
        "/api/ai/analyze-requirement",
        json={
            "requirement_text": "Users can log in with mobile number and password. Accounts lock after five failed attempts.",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["summary"]
    assert payload["features"]

    history = client.get("/api/ai/history/recent?limit=5")
    assert history.status_code == 200
    records = history.json()["records"]
    assert any(record["type"] == "requirement_analysis" for record in records)


def test_testcase_generation_and_excel_export(client: TestClient) -> None:
    generation = client.post(
        "/api/ai/generate-testcases",
        json={
            "requirement_text": "Users can log in with mobile number and password. Accounts lock after five failed attempts.",
            "case_types": ["functional", "boundary", "exception"],
            "case_count": 4,
        },
    )

    assert generation.status_code == 200
    testcases = generation.json()["testcases"]
    assert len(testcases) == 4
    assert testcases[0]["case_id"].startswith("TC")

    export = client.post("/api/export/testcases", json={"testcases": testcases})
    assert export.status_code == 200
    assert (
        export.headers["content-type"]
        == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    assert len(export.content) > 0


def test_api_bug_and_report_endpoints(client: TestClient) -> None:
    api_tests = client.post(
        "/api/ai/generate-api-tests",
        json={"api_doc": "POST /api/login accepts mobile and password and returns token."},
    )
    assert api_tests.status_code == 200
    assert api_tests.json()["testcases"]

    bug = client.post(
        "/api/ai/analyze-bug",
        json={
            "title": "Login returns 500",
            "steps": "Submit valid credentials",
            "actual_result": "Server returns 500",
            "expected_result": "User logs in successfully",
            "logs": "NullPointerException",
            "environment": "staging",
        },
    )
    assert bug.status_code == 200
    assert bug.json()["developer_checklist"]

    report = client.post(
        "/api/ai/generate-report",
        json={
            "project_name": "TestPilot AI",
            "version": "0.4.0",
            "test_scope": "Smoke coverage for main workflows",
            "test_result": "Primary workflows passed",
            "bug_summary": "1 medium issue remains",
            "risk_notes": "Prompt tuning is still in progress",
            "test_environment": "local",
        },
    )
    assert report.status_code == 200
    assert "# Test Report" in report.json()["report_markdown"]


def test_history_detail_endpoint(client: TestClient) -> None:
    client.post(
        "/api/ai/analyze-requirement",
        json={"requirement_text": "Users can reset passwords by SMS code."},
    )

    history = client.get("/api/ai/history/recent?limit=1")
    record_id = history.json()["records"][0]["id"]

    detail = client.get(f"/api/ai/history/{record_id}")
    assert detail.status_code == 200
    assert detail.json()["id"] == record_id
    assert detail.json()["input_text"]
    assert detail.json()["output_json"]


def test_testcase_version_crud(client: TestClient) -> None:
    create = client.post(
        "/api/testcase-versions",
        json={
            "version_name": "login-baseline",
            "requirement_text": "Users can log in with mobile number and password.",
            "case_types": ["functional", "boundary"],
            "case_count": 2,
            "notes": "Initial baseline",
            "testcases": [
                {
                    "case_id": "TC001",
                    "module": "Login",
                    "title": "Valid login succeeds",
                    "precondition": "Registered account exists",
                    "steps": ["Open login page", "Submit valid credentials"],
                    "test_data": "valid mobile and password",
                    "expected_result": "User enters dashboard",
                    "priority": "P1",
                    "case_type": "Functional",
                    "remark": "",
                }
            ],
        },
    )
    assert create.status_code == 200
    version_id = create.json()["id"]

    listing = client.get("/api/testcase-versions?limit=10")
    assert listing.status_code == 200
    assert any(version["id"] == version_id for version in listing.json()["versions"])

    detail = client.get(f"/api/testcase-versions/{version_id}")
    assert detail.status_code == 200
    assert detail.json()["version_name"] == "login-baseline"

    update = client.put(
        f"/api/testcase-versions/{version_id}",
        json={"version_name": "login-regression-v2", "notes": "Renamed snapshot"},
    )
    assert update.status_code == 200
    assert update.json()["version_name"] == "login-regression-v2"

    delete = client.delete(f"/api/testcase-versions/{version_id}")
    assert delete.status_code == 200
    assert delete.json()["message"] == "deleted"
