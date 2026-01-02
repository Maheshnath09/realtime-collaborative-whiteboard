import { useEffect, useRef, useCallback } from "react";
import { useCanvasStore } from "../store/canvasStore";
import { useUserStore } from "../store/userStore";
import { useChatStore } from "../store/chatStore";
import { wsUrl } from "../config/api";

export const useWebSocket = (boardId: string, token: string | null) => {
  const ws = useRef<WebSocket | null>(null);
  const { addElement, updateElement, deleteElement, setElements } = useCanvasStore();
  const { addUser, removeUser, updateCursor, setUsers } = useUserStore();
  const { addMessage } = useChatStore();

  useEffect(() => {
    if (!token) return;

    const websocketUrl = wsUrl(boardId, token);
    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "initial_state":
          setElements(message.elements || []);
          setUsers(message.cursors || {});
          break;

        case "user_joined":
          addUser(message.userId, message.userName, message.userColor);
          break;

        case "user_left":
          removeUser(message.userId);
          break;

        case "cursor_update":
          updateCursor(message.userId, message.x, message.y);
          break;

        case "element_added":
          addElement(message.element);
          break;

        case "element_updated":
          updateElement(message.element);
          break;

        case "element_deleted":
          deleteElement(message.elementId);
          break;

        case "chat_message":
          addMessage({
            id: `${Date.now()}_${message.userId}`,
            userId: message.userId || "",
            userName: message.userName || "Anonymous",
            text: message.text || "",
            timestamp: Date.now(),
          });
          break;

        case "draw_start":
        case "draw_move":
        case "draw_end":
          // These are handled locally in Canvas component
          break;

        default:
          break;
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, [boardId, token, addElement, updateElement, deleteElement, setElements, addUser, removeUser, updateCursor, setUsers, addMessage]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  return { sendMessage };
};

