from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Board, BoardMember
from ..schemas.board import BoardCreate, BoardResponse, BoardUpdate
from ..services.auth_service import get_current_user
from ..utils.security import get_password_hash, verify_password


router = APIRouter(prefix="/api/boards", tags=["boards"])


@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    payload: BoardCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    board = Board(
        name=payload.name,
        description=payload.description,
        owner_id=current_user.id,
        is_public=payload.is_public,
        password_hash=get_password_hash(payload.password) if payload.password else None,
    )
    db.add(board)
    db.flush()

    membership = BoardMember(board_id=board.id, user_id=current_user.id, role="owner")
    db.add(membership)
    db.commit()
    db.refresh(board)
    return board


@router.get("/", response_model=List[BoardResponse])
def get_user_boards(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    boards = (
        db.query(Board)
        .join(BoardMember, BoardMember.board_id == Board.id)
        .filter(BoardMember.user_id == current_user.id)
        .all()
    )
    return boards


@router.get("/{board_id}", response_model=BoardResponse)
def get_board(
    board_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")

    member = (
        db.query(BoardMember)
        .filter(BoardMember.board_id == board.id, BoardMember.user_id == current_user.id)
        .first()
    )
    if not member and not board.is_public:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return board


@router.put("/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: str,
    payload: BoardUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    if board.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not board owner")

    if payload.name is not None:
        board.name = payload.name
    if payload.description is not None:
        board.description = payload.description
    if payload.is_public is not None:
        board.is_public = payload.is_public
    if payload.password is not None:
        board.password_hash = get_password_hash(payload.password) if payload.password else None

    db.commit()
    db.refresh(board)
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    if board.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not board owner")

    db.delete(board)
    db.commit()
    return

