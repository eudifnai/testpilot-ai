import json

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.testcase_version import TestcaseVersion
from app.schemas.testcase import Testcase
from app.schemas.testcase_version import (
    TestcaseVersionDetailResponse,
    TestcaseVersionListResponse,
    TestcaseVersionSaveRequest,
    TestcaseVersionSummary,
)


class TestcaseVersionService:
    def save_version(self, db: Session, payload: TestcaseVersionSaveRequest) -> TestcaseVersionDetailResponse:
        record = TestcaseVersion(
            version_name=payload.version_name,
            requirement_text=payload.requirement_text,
            case_types=json.dumps(payload.case_types, ensure_ascii=False),
            case_count=payload.case_count,
            notes=payload.notes,
            testcases_json=json.dumps([item.model_dump() for item in payload.testcases], ensure_ascii=False),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return self._to_detail(record)

    def list_versions(self, db: Session, limit: int = 20) -> TestcaseVersionListResponse:
        records = (
            db.query(TestcaseVersion)
            .order_by(desc(TestcaseVersion.created_at), desc(TestcaseVersion.id))
            .limit(limit)
            .all()
        )
        return TestcaseVersionListResponse(
            versions=[
                TestcaseVersionSummary(
                    id=record.id,
                    version_name=record.version_name,
                    notes=record.notes,
                    testcase_count=len(self._parse_testcases(record.testcases_json)),
                    created_at=record.created_at.isoformat() if record.created_at else "",
                )
                for record in records
            ]
        )

    def get_version(self, db: Session, version_id: int) -> TestcaseVersionDetailResponse | None:
        record = db.query(TestcaseVersion).filter(TestcaseVersion.id == version_id).first()
        if record is None:
            return None
        return self._to_detail(record)

    def _to_detail(self, record: TestcaseVersion) -> TestcaseVersionDetailResponse:
        return TestcaseVersionDetailResponse(
            id=record.id,
            version_name=record.version_name,
            requirement_text=record.requirement_text,
            case_types=self._parse_case_types(record.case_types),
            case_count=record.case_count,
            notes=record.notes,
            testcases=self._parse_testcases(record.testcases_json),
            created_at=record.created_at.isoformat() if record.created_at else "",
        )

    def _parse_case_types(self, raw: str) -> list[str]:
        try:
            return json.loads(raw)
        except Exception:
            return []

    def _parse_testcases(self, raw: str) -> list[Testcase]:
        try:
            data = json.loads(raw)
            return [Testcase.model_validate(item) for item in data]
        except Exception:
            return []
