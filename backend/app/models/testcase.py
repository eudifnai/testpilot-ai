from sqlalchemy import DateTime, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TestcaseRecord(Base):
    __tablename__ = "testcases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    case_id: Mapped[str] = mapped_column(Text)
    module: Mapped[str] = mapped_column(Text)
    title: Mapped[str] = mapped_column(Text)
    precondition: Mapped[str] = mapped_column(Text)
    steps: Mapped[str] = mapped_column(Text)
    test_data: Mapped[str] = mapped_column(Text)
    expected_result: Mapped[str] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(Text)
    case_type: Mapped[str] = mapped_column(Text)
    remark: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
