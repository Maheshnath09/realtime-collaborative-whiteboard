from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON


from database import Base


class Element(Base):
    __tablename__ = "board_elements"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    board_id = Column(String, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    type = Column(
        String(50), nullable=False
    )  # pencil, rectangle, circle, text, sticky_note, line, arrow, image

    # geometry / content
    x = Column(Float, nullable=False, default=0)
    y = Column(Float, nullable=False, default=0)
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    radius = Column(Float, nullable=True)
    text = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    points = Column(JSON, nullable=True)  # list of {x, y} for pencil/line/arrow

    # style
    color = Column(String(20), nullable=False, default="#000000")
    stroke_width = Column(Integer, nullable=False, default=2)
    fill = Column(Boolean, nullable=False, default=False)
    opacity = Column(Float, nullable=False, default=1.0)
    z_index = Column(Integer, nullable=False, default=0)
    locked = Column(Boolean, nullable=False, default=False)
    tags = Column(JSON, nullable=True)  # list of string tags

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

