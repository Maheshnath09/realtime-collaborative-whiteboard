from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from database import Base


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    board_id = Column(String, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False)
    role = Column(String(20), default="editor", nullable=False)  # editor, viewer
    token = Column(String(255), unique=True, nullable=False, default=lambda: str(uuid4()))
    status = Column(String(20), default="pending", nullable=False)  # pending, accepted, expired
    invited_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=7), nullable=False)

    # Relationships
    board = relationship("Board")
    inviter = relationship("User")
