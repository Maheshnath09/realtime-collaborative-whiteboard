// API configuration for the application
// In development: uses localhost:8000
// In Docker: uses relative URLs (proxied by nginx)

const isDocker = import.meta.env.VITE_API_URL !== undefined;

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// For WebSocket, we need the full URL
const getWebSocketUrl = () => {
    if (import.meta.env.VITE_WS_URL) {
        return import.meta.env.VITE_WS_URL;
    }
    // Default to localhost for development
    return 'ws://localhost:8000/ws';
};

export const WS_BASE_URL = getWebSocketUrl();

// Helper to build API URLs
export const apiUrl = (path: string) => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
};

// Helper to build WebSocket URLs
export const wsUrl = (boardId: string, token: string) => {
    return `${WS_BASE_URL}/${boardId}?token=${encodeURIComponent(token)}`;
};
