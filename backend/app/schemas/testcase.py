from pydantic import BaseModel, Field, field_validator


class Testcase(BaseModel):
    case_id: str
    module: str
    title: str
    precondition: str
    steps: list[str]
    test_data: str
    expected_result: str
    priority: str
    case_type: str
    remark: str = ""


class TestcaseGenerationRequest(BaseModel):
    requirement_text: str = Field(..., min_length=10)
    case_types: list[str] = Field(default_factory=lambda: ["functional", "boundary", "exception"])
    case_count: int = Field(default=12, ge=1, le=100)

    @field_validator("case_types")
    @classmethod
    def validate_case_types(cls, value: list[str]) -> list[str]:
        if not value:
            raise ValueError("case_types cannot be empty")
        return value


class TestcaseGenerationResponse(BaseModel):
    testcases: list[Testcase]


class ExportTestcasesRequest(BaseModel):
    testcases: list[Testcase]
