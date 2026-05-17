from pydantic import BaseModel, Field

from app.schemas.testcase import Testcase


class TestcaseVersionSaveRequest(BaseModel):
    version_name: str = Field(..., min_length=2)
    requirement_text: str = Field(..., min_length=5)
    case_types: list[str] = Field(default_factory=list)
    case_count: int = Field(default=0, ge=0)
    notes: str = ""
    testcases: list[Testcase] = Field(default_factory=list)


class TestcaseVersionUpdateRequest(BaseModel):
    version_name: str = Field(..., min_length=2)
    notes: str = ""


class TestcaseVersionSummary(BaseModel):
    id: int
    version_name: str
    notes: str
    testcase_count: int
    created_at: str


class TestcaseVersionListResponse(BaseModel):
    versions: list[TestcaseVersionSummary]


class TestcaseVersionDetailResponse(BaseModel):
    id: int
    version_name: str
    requirement_text: str
    case_types: list[str]
    case_count: int
    notes: str
    testcases: list[Testcase]
    created_at: str
