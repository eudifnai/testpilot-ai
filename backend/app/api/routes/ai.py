from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.schemas.requirement import RequirementAnalysisRequest, RequirementAnalysisResponse
from app.schemas.testcase import TestcaseGenerationRequest, TestcaseGenerationResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI"])


def get_ai_service(settings: Settings = Depends(get_settings)) -> AIService:
    return AIService(settings)


@router.post("/analyze-requirement", response_model=RequirementAnalysisResponse)
def analyze_requirement(
    payload: RequirementAnalysisRequest,
    service: AIService = Depends(get_ai_service),
) -> RequirementAnalysisResponse:
    return service.analyze_requirement(payload.requirement_text)


@router.post("/generate-testcases", response_model=TestcaseGenerationResponse)
def generate_testcases(
    payload: TestcaseGenerationRequest,
    service: AIService = Depends(get_ai_service),
) -> TestcaseGenerationResponse:
    return service.generate_testcases(
        requirement_text=payload.requirement_text,
        case_types=payload.case_types,
        case_count=payload.case_count,
    )
