from typing import Dict
import asyncio

from fastapi import WebSocket


class ConnectionManager:
    """
    In-memory WebSocket room manager.
    For production you may want to back this with Redis for multi-instance deployments.
    """

    def __init__(self) -> None:
        # board_id -> {user_id: websocket}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

        # board_id -> {user_id: {x, y, color, name}}
        self.cursors: Dict[str, Dict[str, dict]] = {}

        # board_id -> {elements: [], version: int}
        self.board_states: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, board_id: str, user_id: str, user_name: str):
        """Handle new user connection."""
        await websocket.accept()

        if board_id not in self.active_connections:
            self.active_connections[board_id] = {}
            self.cursors[board_id] = {}
            self.board_states[board_id] = {"elements": [], "version": 0}

        self.active_connections[board_id][user_id] = websocket

        user_color = self._get_user_color(board_id, user_id)
        self.cursors[board_id][user_id] = {
            "x": 0,
            "y": 0,
            "color": user_color,
            "name": user_name,
        }

        await self._send_initial_state(websocket, board_id)

        await self.broadcast_to_room(
            board_id,
            {
                "type": "user_joined",
                "userId": user_id,
                "userName": user_name,
                "userColor": user_color,
                "activeUsers": list(self.active_connections[board_id].keys()),
            },
            exclude_user=user_id,
        )

    def disconnect(self, board_id: str, user_id: str) -> None:
        """Handle user disconnection."""
        if board_id in self.active_connections:
            self.active_connections[board_id].pop(user_id, None)

            if board_id in self.cursors:
                self.cursors[board_id].pop(user_id, None)

            if not self.active_connections[board_id]:
                self.active_connections.pop(board_id, None)
                self.cursors.pop(board_id, None)
                self.board_states.pop(board_id, None)

    async def broadcast_to_room(
        self, board_id: str, message: dict, exclude_user: str | None = None
    ) -> None:
        """Send message to all users in room except one."""
        if board_id not in self.active_connections:
            return

        dead_connections = []

        for user_id, websocket in self.active_connections[board_id].items():
            if exclude_user and user_id == exclude_user:
                continue

            try:
                await websocket.send_json(message)
            except Exception:
                dead_connections.append(user_id)

        for uid in dead_connections:
            self.disconnect(board_id, uid)

    async def handle_message(self, board_id: str, user_id: str, message: dict) -> None:
        """Route incoming WebSocket messages."""
        msg_type = message.get("type")

        if msg_type == "cursor_move":
            await self._handle_cursor_move(board_id, user_id, message)
        elif msg_type in {"draw_start", "draw_move", "draw_end"}:
            # For now we just broadcast raw drawing events.
            await self.broadcast_to_room(board_id, message, exclude_user=user_id)
        elif msg_type == "add_element":
            await self._handle_add_element(board_id, user_id, message)
        elif msg_type == "update_element":
            await self._handle_update_element(board_id, user_id, message)
        elif msg_type == "delete_element":
            await self._handle_delete_element(board_id, user_id, message)
        elif msg_type == "chat_message":
            # Add user info to chat message and broadcast to others (not sender - they already showed it locally)
            message["userId"] = user_id
            await self.broadcast_to_room(board_id, message, exclude_user=user_id)

    async def _handle_cursor_move(self, board_id: str, user_id: str, message: dict) -> None:
        """Update and broadcast cursor position."""
        if board_id in self.cursors and user_id in self.cursors[board_id]:
            self.cursors[board_id][user_id]["x"] = message.get("x", 0)
            self.cursors[board_id][user_id]["y"] = message.get("y", 0)

            await self.broadcast_to_room(
                board_id,
                {
                    "type": "cursor_update",
                    "userId": user_id,
                    "x": message.get("x", 0),
                    "y": message.get("y", 0),
                },
                exclude_user=user_id,
            )

    async def _handle_add_element(self, board_id: str, user_id: str, message: dict) -> None:
        """Add new element to in-memory board state and broadcast."""
        element = message.get("element") or {}
        # Use the client's element ID - don't overwrite it!
        # This ensures the same ID is used everywhere for updates
        if not element.get("id"):
            element["id"] = f"{user_id}_{int(asyncio.get_event_loop().time() * 1000)}"
        element["userId"] = user_id

        self.board_states[board_id]["elements"].append(element)
        self.board_states[board_id]["version"] += 1

        # Broadcast to other users (not the sender - they already added it locally)
        await self.broadcast_to_room(
            board_id,
            {
                "type": "element_added",
                "element": element,
            },
            exclude_user=user_id,
        )

    async def _handle_update_element(self, board_id: str, user_id: str, message: dict) -> None:
        element = message.get("element") or {}
        element_id = element.get("id")
        if not element_id:
            return

        elements = self.board_states.get(board_id, {}).get("elements", [])
        for idx, existing in enumerate(elements):
            if existing.get("id") == element_id:
                elements[idx] = element
                break

        self.board_states[board_id]["version"] += 1

        await self.broadcast_to_room(
            board_id,
            {
                "type": "element_updated",
                "element": element,
            },
            exclude_user=user_id,
        )

    async def _handle_delete_element(self, board_id: str, user_id: str, message: dict) -> None:
        element_id = message.get("elementId")
        if not element_id:
            return

        elements = self.board_states.get(board_id, {}).get("elements", [])
        self.board_states[board_id]["elements"] = [
            e for e in elements if e.get("id") != element_id
        ]
        self.board_states[board_id]["version"] += 1

        await self.broadcast_to_room(
            board_id,
            {
                "type": "element_deleted",
                "elementId": element_id,
            },
            exclude_user=user_id,
        )

    async def _send_initial_state(self, websocket: WebSocket, board_id: str) -> None:
        await websocket.send_json(
            {
                "type": "initial_state",
                "elements": self.board_states[board_id]["elements"],
                "cursors": self.cursors[board_id],
                "version": self.board_states[board_id]["version"],
            }
        )

    def _get_user_color(self, board_id: str, user_id: str) -> str:
        colors = [
            "#3B82F6",
            "#8B5CF6",
            "#EF4444",
            "#10B981",
            "#F59E0B",
            "#EC4899",
            "#6366F1",
            "#14B8A6",
        ]
        user_count = len(self.cursors.get(board_id, {}))
        return colors[user_count % len(colors)]


manager = ConnectionManager()

