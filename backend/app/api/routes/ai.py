from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException

from app.core.database import get_db
from app.core.config import Settings, get_settings
from app.schemas.api_test import APITestGenerationRequest, APITestGenerationResponse
from app.schemas.bug import BugAnalysisRequest, BugAnalysisResponse
from app.schemas.history import HistoryDetailResponse, HistoryListResponse
from app.schemas.report import TestReportRequest, TestReportResponse
from app.schemas.requirement import RequirementAnalysisRequest, RequirementAnalysisResponse
from app.schemas.testcase import TestcaseGenerationRequest, TestcaseGenerationResponse
from app.services.ai_service import AIService
from app.services.history_service import HistoryService

router = APIRouter(prefix="/ai", tags=["AI"])


def get_ai_service(settings: Settings = Depends(get_settings)) -> AIService:
    return AIService(settings)


def get_history_service() -> HistoryService:
    return HistoryService()


@router.post("/analyze-requirement", response_model=RequirementAnalysisResponse)
def analyze_requirement(
    payload: RequirementAnalysisRequest,
    service: AIService = Depends(get_ai_service),
    history: HistoryService = Depends(get_history_service),
    db: Session = Depends(get_db),
) -> RequirementAnalysisResponse:
    result = service.analyze_requirement(payload.requirement_text)
    history.save_generation(
        db,
        record_type="requirement_analysis",
        input_text=payload.requirement_text,
        output_payload=result.model_dump(),
    )
    return result


@router.post("/generate-testcases", response_model=TestcaseGenerationResponse)
def generate_testcases(
    payload: TestcaseGenerationRequest,
    service: AIService = Depends(get_ai_service),
    history: HistoryService = Depends(get_history_service),
    db: Session = Depends(get_db),
) -> TestcaseGenerationResponse:
    result = service.generate_testcases(
        requirement_text=payload.requirement_text,
        case_types=payload.case_types,
        case_count=payload.case_count,
    )
    history.save_generation(
        db,
        record_type="testcase_generation",
        input_text=payload.requirement_text,
        output_payload=result.model_dump(),
    )
    history.replace_testcases(db, result.testcases)
    return result


@router.post("/generate-api-tests", response_model=APITestGenerationResponse)
def generate_api_tests(
    payload: APITestGenerationRequest,
    service: AIService = Depends(get_ai_service),
    history: HistoryService = Depends(get_history_service),
    db: Session = Depends(get_db),
) -> APITestGenerationResponse:
    result = service.generate_api_tests(payload.api_doc)
    history.save_generation(
        db,
        record_type="api_test_generation",
        input_text=payload.api_doc,
        output_payload=result.model_dump(),
    )
    return result


@router.post("/analyze-bug", response_model=BugAnalysisResponse)
def analyze_bug(
    payload: BugAnalysisRequest,
    service: AIService = Depends(get_ai_service),
    history: HistoryService = Depends(get_history_service),
    db: Session = Depends(get_db),
) -> BugAnalysisResponse:
    result = service.analyze_bug(payload.model_dump())
    history.save_generation(
        db,
        record_type="bug_analysis",
        input_text=payload.model_dump_json(),
        output_payload=result.model_dump(),
    )
    return result


@router.post("/generate-report", response_model=TestReportResponse)
def generate_report(
    payload: TestReportRequest,
    service: AIService = Depends(get_ai_service),
    history: HistoryService = Depends(get_history_service),
    db: Session = Depends(get_db),
) -> TestReportResponse:
    result = service.generate_report(payload.model_dump())
    history.save_generation(
        db,
        record_type="test_report",
        input_text=payload.model_dump_json(),
        output_payload=result.model_dump(),
    )
    return result


@router.get("/history/recent", response_model=HistoryListResponse)
def list_recent_history(
    limit: int = 10,
    history: HistoryService = Depends(get_history_service),
    db: Session = Depends(get_db),
) -> HistoryListResponse:
    return history.list_recent_records(db, limit=limit)


@router.get("/history/{record_id}", response_model=HistoryDetailResponse)
def get_history_detail(
    record_id: int,
    history: HistoryService = Depends(get_history_service),
    db: Session = Depends(get_db),
) -> HistoryDetailResponse:
    result = history.get_record_detail(db, record_id)
    if result is None:
        raise HTTPException(status_code=404, detail="History record not found")
    return result
