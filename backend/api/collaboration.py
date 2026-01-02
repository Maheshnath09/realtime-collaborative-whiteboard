from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import Invitation, BoardMember, Board, User
from ..services.auth_service import get_current_user
from ..schemas.collaboration import (
    InvitationCreate,
    InvitationResponse,
    CollaboratorResponse,
    CollaboratorUpdate
)

router = APIRouter(prefix="/api/boards", tags=["collaboration"])


@router.post("/{board_id}/invite", response_model=InvitationResponse)
async def invite_collaborator(
    board_id: str,
    invitation_data: InvitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send an invitation to collaborate on a board."""
    # Check if board exists and user is owner
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    if board.owner_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only board owner can invite collaborators")
    
    # Check if user is already a collaborator
    existing_member = db.query(BoardMember).filter(
        BoardMember.board_id == board_id,
        BoardMember.user_id == invitation_data.email  # This should check by email
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a collaborator")
    
    # Create invitation
    invitation = Invitation(
        board_id=board_id,
        email=invitation_data.email,
        role=invitation_data.role,
        invited_by=str(current_user.id)
    )
    
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    
    # TODO: Send email with invitation link
    # For now, we'll just return the invitation
    
    return invitation


@router.get("/{board_id}/invitations", response_model=List[InvitationResponse])
async def list_invitations(
    board_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all pending invitations for a board."""
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    if board.owner_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only board owner can view invitations")
    
    invitations = db.query(Invitation).filter(
        Invitation.board_id == board_id,
        Invitation.status == "pending"
    ).all()
    
    return invitations


@router.post("/invitations/{token}/accept")
async def accept_invitation(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Accept an invitation to collaborate on a board."""
    invitation = db.query(Invitation).filter(Invitation.token == token).first()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Invitation is no longer valid")
    
    if invitation.expires_at < datetime.utcnow():
        invitation.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="Invitation has expired")
    
    # Check if user's email matches invitation
    if current_user.email != invitation.email:
        raise HTTPException(status_code=403, detail="This invitation is for a different email")
    
    # Add user as collaborator
    member = BoardMember(
        board_id=invitation.board_id,
        user_id=str(current_user.id),
        role=invitation.role
    )
    
    db.add(member)
    invitation.status = "accepted"
    db.commit()
    
    return {"message": "Invitation accepted successfully", "board_id": invitation.board_id}


@router.get("/{board_id}/collaborators", response_model=List[CollaboratorResponse])
async def list_collaborators(
    board_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all collaborators for a board."""
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    # Check if user has access to this board
    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == board_id,
        BoardMember.user_id == str(current_user.id)
    ).first()
    
    if board.owner_id != str(current_user.id) and not is_member:
        raise HTTPException(status_code=403, detail="Access denied")
    
    collaborators = db.query(BoardMember).filter(BoardMember.board_id == board_id).all()
    
    # Format response with user details
    result = []
    for collab in collaborators:
        user = db.query(User).filter(User.id == collab.user_id).first()
        if user:
            result.append({
                "id": collab.id,
                "user_id": collab.user_id,
                "username": user.username,
                "email": user.email,
                "avatar_url": user.avatar_url,
                "role": collab.role,
                "joined_at": collab.joined_at
            })
    
    return result


@router.delete("/{board_id}/collaborators/{user_id}")
async def remove_collaborator(
    board_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a collaborator from a board."""
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    if board.owner_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only board owner can remove collaborators")
    
    member = db.query(BoardMember).filter(
        BoardMember.board_id == board_id,
        BoardMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Collaborator not found")
    
    db.delete(member)
    db.commit()
    
    return {"message": "Collaborator removed successfully"}


@router.patch("/{board_id}/collaborators/{user_id}", response_model=CollaboratorResponse)
async def update_collaborator_role(
    board_id: str,
    user_id: str,
    update_data: CollaboratorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a collaborator's role."""
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    if board.owner_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only board owner can update roles")
    
    member = db.query(BoardMember).filter(
        BoardMember.board_id == board_id,
        BoardMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Collaborator not found")
    
    member.role = update_data.role
    db.commit()
    db.refresh(member)
    
    user = db.query(User).filter(User.id == user_id).first()
    
    return {
        "id": member.id,
        "user_id": member.user_id,
        "username": user.username if user else "",
        "email": user.email if user else "",
        "avatar_url": user.avatar_url if user else None,
        "role": member.role,
        "joined_at": member.joined_at
    }
