from pydantic import BaseModel, Field


class TestReportRequest(BaseModel):
    project_name: str = Field(..., min_length=2)
    version: str = Field(..., min_length=1)
    test_scope: str = Field(..., min_length=5)
    test_result: str = Field(..., min_length=5)
    bug_summary: str = Field(..., min_length=3)
    risk_notes: str = ""
    test_environment: str = ""


class TestReportResponse(BaseModel):
    report_markdown: str
