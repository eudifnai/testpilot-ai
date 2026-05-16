from pydantic import BaseModel, Field


class BugAnalysisRequest(BaseModel):
    title: str = Field(..., min_length=3)
    steps: str = Field(..., min_length=5)
    actual_result: str = Field(..., min_length=3)
    expected_result: str = Field(..., min_length=3)
    logs: str = ""
    environment: str = ""
    api_response: str = ""
    console_error: str = ""


class BugAnalysisResponse(BaseModel):
    standard_bug_report: str
    possible_causes: list[str]
    severity: str
    priority: str
    impact_scope: str
    developer_checklist: list[str]
    suggested_additional_info: list[str] = Field(default_factory=list)
