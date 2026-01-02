from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BoardBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False


class BoardCreate(BoardBase):
    password: Optional[str] = None


class BoardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    password: Optional[str] = None


class BoardResponse(BoardBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

