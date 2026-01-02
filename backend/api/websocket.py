from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query

from ..services.auth_service import get_current_user_ws
from ..websocket_manager import manager


router = APIRouter()


@router.websocket("/ws/{board_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    board_id: str,
    token: str = Query(..., description="JWT access token"),
):
    # Verify user from JWT token
    from sqlalchemy.orm import Session  # local import to avoid circular
    from ..database import get_db

    db_gen = get_db()
    db: Session = next(db_gen)
    try:
        user = await get_current_user_ws(token, db=db)
        user_id = str(user.id)
        user_name = user.username
    except Exception:
        await websocket.close(code=1008)
        db_gen.close()
        return

    await manager.connect(websocket, board_id, user_id, user_name)

    try:
        while True:
            data = await websocket.receive_json()
            await manager.handle_message(board_id, user_id, data)
    except WebSocketDisconnect:
        manager.disconnect(board_id, user_id)
        await manager.broadcast_to_room(
            board_id,
            {
                "type": "user_left",
                "userId": user_id,
                "activeUsers": list(manager.active_connections.get(board_id, {}).keys()),
            },
        )
    finally:
        db_gen.close()

