from pydantic import BaseModel


class HistoryRecord(BaseModel):
    id: int
    type: str
    input_preview: str
    output_preview: str
    created_at: str


class HistoryListResponse(BaseModel):
    records: list[HistoryRecord]
