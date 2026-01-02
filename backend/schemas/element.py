from typing import List, Optional

from pydantic import BaseModel


class Point(BaseModel):
    x: float
    y: float


class ElementBase(BaseModel):
    type: str
    x: float
    y: float
    width: Optional[float] = None
    height: Optional[float] = None
    radius: Optional[float] = None
    text: Optional[str] = None
    image_url: Optional[str] = None
    points: Optional[List[Point]] = None
    color: str = "#000000"
    stroke_width: int = 2
    fill: bool = False
    opacity: float = 1.0
    z_index: int = 0
    locked: bool = False


class ElementCreate(ElementBase):
    board_id: str


class ElementUpdate(BaseModel):
    type: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    radius: Optional[float] = None
    text: Optional[str] = None
    image_url: Optional[str] = None
    points: Optional[List[Point]] = None
    color: Optional[str] = None
    stroke_width: Optional[int] = None
    fill: Optional[bool] = None
    opacity: Optional[float] = None
    z_index: Optional[int] = None
    locked: Optional[bool] = None


class ElementResponse(ElementBase):
    id: str
    board_id: str
    user_id: str

    class Config:
        orm_mode = True

