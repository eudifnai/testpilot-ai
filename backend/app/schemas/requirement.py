from pydantic import BaseModel, Field


class RequirementAnalysisRequest(BaseModel):
    requirement_text: str = Field(..., min_length=10, description="Plain-text requirement input")


class RequirementAnalysisResponse(BaseModel):
    summary: str
    features: list[str]
    business_flow: list[str]
    test_points: list[str]
    risks: list[str]
    questions: list[str]
