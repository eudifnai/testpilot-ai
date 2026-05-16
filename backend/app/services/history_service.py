import json

from sqlalchemy import desc, delete
from sqlalchemy.orm import Session

from app.models.generation import GenerationRecord
from app.models.testcase import TestcaseRecord
from app.schemas.history import HistoryListResponse, HistoryRecord
from app.schemas.testcase import Testcase


class HistoryService:
    def save_generation(
        self,
        db: Session,
        record_type: str,
        input_text: str,
        output_payload: dict,
    ) -> GenerationRecord:
        record = GenerationRecord(
            type=record_type,
            input_text=input_text,
            output_json=json.dumps(output_payload, ensure_ascii=False),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    def replace_testcases(self, db: Session, testcases: list[Testcase]) -> None:
        db.execute(delete(TestcaseRecord))
        for testcase in testcases:
            db.add(
                TestcaseRecord(
                    case_id=testcase.case_id,
                    module=testcase.module,
                    title=testcase.title,
                    precondition=testcase.precondition,
                    steps=json.dumps(testcase.steps, ensure_ascii=False),
                    test_data=testcase.test_data,
                    expected_result=testcase.expected_result,
                    priority=testcase.priority,
                    case_type=testcase.case_type,
                    remark=testcase.remark,
                )
            )
        db.commit()

    def list_recent_records(self, db: Session, limit: int = 10) -> HistoryListResponse:
        records = (
            db.query(GenerationRecord)
            .order_by(desc(GenerationRecord.created_at), desc(GenerationRecord.id))
            .limit(limit)
            .all()
        )
        return HistoryListResponse(
            records=[
                HistoryRecord(
                    id=record.id,
                    type=record.type,
                    input_preview=self._preview(record.input_text),
                    output_preview=self._preview(record.output_json),
                    created_at=record.created_at.isoformat() if record.created_at else "",
                )
                for record in records
            ]
        )

    def _preview(self, value: str, limit: int = 140) -> str:
        cleaned = " ".join(value.split())
        return cleaned[:limit] + ("..." if len(cleaned) > limit else "")
