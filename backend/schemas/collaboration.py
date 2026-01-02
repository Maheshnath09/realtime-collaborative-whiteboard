from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class InvitationCreate(BaseModel):
    email: EmailStr
    role: str = "editor"  # editor or viewer


class InvitationResponse(BaseModel):
    id: str
    board_id: str
    email: str
    role: str
    token: str
    status: str
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True


class CollaboratorResponse(BaseModel):
    id: str
    user_id: str
    username: str
    email: str
    avatar_url: Optional[str]
    role: str
    joined_at: datetime


class CollaboratorUpdate(BaseModel):
    role: str  # editor or viewer
