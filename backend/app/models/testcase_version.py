from sqlalchemy import DateTime, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TestcaseVersion(Base):
    __tablename__ = "testcase_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    version_name: Mapped[str] = mapped_column(Text)
    requirement_text: Mapped[str] = mapped_column(Text)
    case_types: Mapped[str] = mapped_column(Text)
    case_count: Mapped[int] = mapped_column(Integer)
    notes: Mapped[str] = mapped_column(Text, default="")
    testcases_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
