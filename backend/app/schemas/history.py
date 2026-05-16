from pydantic import BaseModel


class HistoryRecord(BaseModel):
    id: int
    type: str
    input_preview: str
    output_preview: str
    created_at: str


class HistoryListResponse(BaseModel):
    records: list[HistoryRecord]


class HistoryDetailResponse(BaseModel):
    id: int
    type: str
    input_text: str
    output_json: str
    created_at: str
