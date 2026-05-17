from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.testcase_version import (
    TestcaseVersionDetailResponse,
    TestcaseVersionListResponse,
    TestcaseVersionSaveRequest,
    TestcaseVersionUpdateRequest,
)
from app.services.testcase_version_service import TestcaseVersionService

router = APIRouter(prefix="/testcase-versions", tags=["Testcase Versions"])


def get_testcase_version_service() -> TestcaseVersionService:
    return TestcaseVersionService()


@router.post("", response_model=TestcaseVersionDetailResponse)
def save_testcase_version(
    payload: TestcaseVersionSaveRequest,
    service: TestcaseVersionService = Depends(get_testcase_version_service),
    db: Session = Depends(get_db),
) -> TestcaseVersionDetailResponse:
    return service.save_version(db, payload)


@router.get("", response_model=TestcaseVersionListResponse)
def list_testcase_versions(
    limit: int = 20,
    service: TestcaseVersionService = Depends(get_testcase_version_service),
    db: Session = Depends(get_db),
) -> TestcaseVersionListResponse:
    return service.list_versions(db, limit=limit)


@router.get("/{version_id}", response_model=TestcaseVersionDetailResponse)
def get_testcase_version(
    version_id: int,
    service: TestcaseVersionService = Depends(get_testcase_version_service),
    db: Session = Depends(get_db),
) -> TestcaseVersionDetailResponse:
    result = service.get_version(db, version_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Testcase version not found")
    return result


@router.put("/{version_id}", response_model=TestcaseVersionDetailResponse)
def update_testcase_version(
    version_id: int,
    payload: TestcaseVersionUpdateRequest,
    service: TestcaseVersionService = Depends(get_testcase_version_service),
    db: Session = Depends(get_db),
) -> TestcaseVersionDetailResponse:
    result = service.update_version(db, version_id, payload)
    if result is None:
        raise HTTPException(status_code=404, detail="Testcase version not found")
    return result


@router.delete("/{version_id}")
def delete_testcase_version(
    version_id: int,
    service: TestcaseVersionService = Depends(get_testcase_version_service),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    deleted = service.delete_version(db, version_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Testcase version not found")
    return {"message": "deleted"}
