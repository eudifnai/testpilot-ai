from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.schemas.testcase import ExportTestcasesRequest
from app.services.export_service import ExportService

router = APIRouter(prefix="/export", tags=["Export"])


def get_export_service() -> ExportService:
    return ExportService()


@router.post("/testcases")
def export_testcases(
    payload: ExportTestcasesRequest,
    service: ExportService = Depends(get_export_service),
) -> StreamingResponse:
    file_bytes = service.export_testcases(payload.testcases)
    headers = {"Content-Disposition": 'attachment; filename="testcases.xlsx"'}
    return StreamingResponse(
        iter([file_bytes]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )
