from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from database import Base


class Board(Base):
    __tablename__ = "boards"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    password_hash = Column(String(255), nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    owner = relationship("User", backref="boards")
    collaborators = relationship("BoardMember", back_populates="board", cascade="all, delete-orphan")



class BoardMember(Base):
    __tablename__ = "board_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    board_id = Column(String, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), default="editor", nullable=False)  # owner, editor, viewer
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    board = relationship("Board", back_populates="collaborators")
    user = relationship("User")


