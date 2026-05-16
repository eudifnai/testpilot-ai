from pydantic import BaseModel, Field


class APITestcase(BaseModel):
    case_id: str
    title: str
    request_data: dict[str, object] | list[object] | str
    expected_status: int
    expected_result: str
    case_type: str


class APITestGenerationRequest(BaseModel):
    api_doc: str = Field(..., min_length=10)


class APITestGenerationResponse(BaseModel):
    api_name: str
    method: str
    path: str
    testcases: list[APITestcase]
    script_suggestion: str
    missing_info: list[str] = Field(default_factory=list)
