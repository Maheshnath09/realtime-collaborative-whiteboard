import React, { useState, useRef, useEffect } from "react";
import { useChatStore, ChatMessage } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useWebSocket } from "../../hooks/useWebSocket";

interface ChatProps {
  boardId: string;
  onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({ boardId, onClose }) => {
  const { messages, addMessage } = useChatStore();
  const { token, username, userId } = useAuthStore();
  const { sendMessage } = useWebSocket(boardId, token);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token) return;

    const message: ChatMessage = {
      id: `${Date.now()}`,
      userId: userId || "",
      userName: username || "Anonymous",
      text: input,
      timestamp: Date.now(),
    };

    sendMessage({
      type: "chat_message",
      text: input,
      userName: username || "Anonymous",
      userId: userId || "",
    });

    addMessage(message);
    setInput("");
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with close button */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">Chat</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
          >
            <span className="text-xl">✕</span>
          </button>
        )}
      </div>

      {/* Messages area - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-700">
                  {msg.userName}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2">
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form - fixed at bottom with mobile safe area */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-gray-200 bg-white shrink-0 pb-20 sm:pb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
