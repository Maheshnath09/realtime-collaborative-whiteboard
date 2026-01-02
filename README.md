<div align="center">

# 🎨 Realtime Collaborative Whiteboard

### A Modern, Feature-Rich Whiteboard Application for Real-Time Collaboration

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

**Create • Collaborate • Design — All in Real-Time**

[Demo](#demo) • [Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#demo)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Docker Deployment](#-docker-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [WebSocket Events](#-websocket-events)
- [State Management](#-state-management)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

A **Miro-inspired** collaborative whiteboard application that enables teams to brainstorm, design, and collaborate in real-time. Built with a modern tech stack featuring **FastAPI** for the backend, **React** with **TypeScript** for the frontend, and **WebSockets** for instant synchronization across all connected users.

### Why This Project?

- 🚀 **Real-Time Collaboration**: See changes instantly as team members draw and edit
- 🎯 **Zero Latency**: WebSocket-based architecture for instant updates
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- 🐳 **Production Ready**: Containerized with Docker for easy deployment
- 🔐 **Secure**: JWT authentication with role-based access control

---

## ✨ Features

### 🖌️ Drawing Tools
| Tool | Shortcut | Description |
|------|----------|-------------|
| **Pointer** | `V` | Select and move elements |
| **Pencil** | `P` | Freehand drawing with adjustable width |
| **Rectangle** | `R` | Draw rectangles and squares |
| **Circle** | `O` | Draw circles and ellipses |
| **Line** | `L` | Draw straight lines |
| **Arrow** | `A` | Draw directional arrows |
| **Text** | `T` | Add text elements |
| **Sticky Note** | `N` | Add colorful sticky notes |
| **Eraser** | `E` | Remove elements |

### 🎨 Canvas Controls
- **Zoom**: 25% to 400% with smooth transitions
- **Pan**: Middle mouse button or Ctrl+Drag
- **Infinite Canvas**: 8000×8000 pixel workspace
- **Grid Background**: Snap-to-grid alignment support
- **Undo/Redo**: Full history with Ctrl+Z / Ctrl+Shift+Z

### 👥 Collaboration
- **Real-Time Sync**: All drawings synchronized instantly
- **Live Cursors**: See where other users are pointing
- **Presence Awareness**: Know who's online in real-time
- **Board Sharing**: Invite via email or shareable link
- **Live Chat**: Communicate without leaving the board
- **Role-Based Access**: Owner, Editor, Viewer permissions

### 🔐 Security
- JWT token-based authentication
- Password hashing with bcrypt
- CORS protection
- SQL injection prevention
- WebSocket authentication

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async Python framework |
| **SQLAlchemy** | ORM for database operations |
| **PostgreSQL** | Primary database (SQLite for development) |
| **WebSockets** | Real-time bidirectional communication |
| **Pydantic** | Data validation and serialization |
| **python-jose** | JWT token handling |
| **passlib** | Password hashing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI component library |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast build tool and dev server |
| **Zustand** | Lightweight state management |
| **Tailwind CSS** | Utility-first CSS framework |
| **React Router** | Client-side routing |
| **React Icons** | Icon library |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy and static serving |

---

## 🏗️ Architecture

### System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        B1[Browser - User 1]
        B2[Browser - User 2]
        B3[Browser - User N]
    end
    
    subgraph "Frontend - React/Vite"
        UI[React Components]
        ZS[Zustand Stores]
        WS_CLIENT[WebSocket Client]
        API_CLIENT[HTTP Client]
    end
    
    subgraph "Nginx Reverse Proxy"
        NG[Nginx :3000]
    end
    
    subgraph "Backend - FastAPI"
        API[REST API :8000]
        WS_SERVER[WebSocket Server]
        AUTH[Auth Service]
        BOARD[Board Service]
    end
    
    subgraph "Data Layer"
        WS_MGR[WebSocket Manager]
        DB[(PostgreSQL)]
    end
    
    B1 & B2 & B3 --> NG
    NG -->|/api/*| API
    NG -->|/ws/*| WS_SERVER
    NG -->|Static| UI
    
    UI --> ZS
    ZS --> WS_CLIENT
    ZS --> API_CLIENT
    
    API --> AUTH
    API --> BOARD
    AUTH --> DB
    BOARD --> DB
    
    WS_SERVER --> WS_MGR
    WS_MGR -->|Broadcast| WS_SERVER
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant U2 as User 2
    participant FE as Frontend
    participant WS as WebSocket Server
    participant MGR as WS Manager
    participant DB as Database
    
    Note over U1,DB: User Authentication
    U1->>FE: Login Request
    FE->>DB: Validate Credentials
    DB-->>FE: JWT Token
    FE-->>U1: Auth Success
    
    Note over U1,DB: WebSocket Connection
    U1->>WS: Connect (JWT)
    WS->>MGR: Register User
    MGR-->>WS: Initial State
    WS-->>U1: Board Elements + Cursors
    
    Note over U1,DB: Real-Time Drawing
    U1->>FE: Draw Shape
    FE->>WS: add_element
    WS->>MGR: Store Element
    MGR->>WS: Broadcast
    WS-->>U2: element_added
    U2->>FE: Render Shape
```

### Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        APP[App.tsx]
        
        subgraph "Pages"
            DASH[Dashboard]
            BOARD[BoardPage]
            PROFILE[ProfilePage]
        end
        
        subgraph "Core Components"
            CANVAS[Canvas]
            TOOLBAR[Toolbar]
            CHAT[Chat]
        end
        
        subgraph "UI Components"
            MODAL[InviteModal]
            PEOPLE[PeopleBar]
            DROPDOWN[ProfileDropdown]
        end
    end
    
    subgraph "State Stores"
        AUTH_S[authStore]
        CANVAS_S[canvasStore]
        DRAW_S[drawingStore]
        USER_S[userStore]
        CHAT_S[chatStore]
    end
    
    APP --> DASH & BOARD & PROFILE
    BOARD --> CANVAS & TOOLBAR & CHAT
    BOARD --> MODAL & PEOPLE & DROPDOWN
    
    CANVAS --> CANVAS_S & DRAW_S & USER_S
    TOOLBAR --> DRAW_S
    CHAT --> CHAT_S
```

### Database Schema

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string username
        string hashed_password
        datetime created_at
    }
    
    BOARDS {
        uuid id PK
        string name
        uuid owner_id FK
        boolean is_public
        json settings
        datetime created_at
        datetime updated_at
    }
    
    BOARD_MEMBERS {
        uuid id PK
        uuid board_id FK
        uuid user_id FK
        string role
        datetime joined_at
    }
    
    USERS ||--o{ BOARDS : owns
    USERS ||--o{ BOARD_MEMBERS : participates
    BOARDS ||--o{ BOARD_MEMBERS : has
```

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)

### Local Development Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/realtime-collaborative-whiteboard.git
cd realtime-collaborative-whiteboard
```

#### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
cd ..
python -m uvicorn backend.main:app --reload --port 8000
```

🟢 Backend running at: `http://localhost:8000`  
📚 API Docs: `http://localhost:8000/docs`

#### 3️⃣ Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

🟢 Frontend running at: `http://localhost:5173`

#### 4️⃣ Start Collaborating!

1. Open `http://localhost:5173` in your browser
2. Register a new account
3. Create your first board
4. Share the board link with collaborators
5. Start drawing together in real-time! 🎨

---

## 🐳 Docker Deployment

### One-Command Deployment

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| **frontend** | 3000 | React app served via Nginx |
| **backend** | 8000 | FastAPI server |
| **db** | 5432 | PostgreSQL database |

### Access Points

- 🌐 **Application**: http://localhost:3000
- 🔌 **API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up --build frontend

# Clean up volumes
docker-compose down -v
```

---

## 📁 Project Structure

```
realtime-collaborative-whiteboard/
│
├── 📁 backend/                    # FastAPI Backend
│   ├── 📁 api/                    # API Routes
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── boards.py             # Board CRUD operations
│   │   ├── collaboration.py      # Sharing & members
│   │   └── websocket.py          # WebSocket handler
│   │
│   ├── 📁 models/                 # SQLAlchemy Models
│   │   ├── user.py               # User model
│   │   ├── board.py              # Board model
│   │   └── board_member.py       # Membership model
│   │
│   ├── 📁 schemas/                # Pydantic Schemas
│   │   ├── user.py               # User DTOs
│   │   └── board.py              # Board DTOs
│   │
│   ├── 📁 services/               # Business Logic
│   │   └── auth_service.py       # Auth utilities
│   │
│   ├── config.py                 # App configuration
│   ├── database.py               # Database setup
│   ├── websocket_manager.py      # Real-time manager
│   ├── main.py                   # FastAPI app entry
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Backend container
│
├── 📁 frontend/                   # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/         # React Components
│   │   │   ├── 📁 Auth/          # Login, Register
│   │   │   ├── 📁 Canvas/        # Drawing canvas
│   │   │   ├── 📁 Chat/          # Chat panel
│   │   │   ├── 📁 Toolbar/       # Tool selection
│   │   │   ├── InviteModal.tsx   # Sharing modal
│   │   │   ├── PeopleBar.tsx     # Online users
│   │   │   └── ProfileDropdown   # User menu
│   │   │
│   │   ├── 📁 store/              # Zustand Stores
│   │   │   ├── authStore.ts      # Auth state
│   │   │   ├── canvasStore.ts    # Elements state
│   │   │   ├── chatStore.ts      # Chat messages
│   │   │   ├── drawingStore.ts   # Tool settings
│   │   │   └── userStore.ts      # Online users
│   │   │
│   │   ├── 📁 hooks/              # Custom Hooks
│   │   │   └── useWebSocket.ts   # WS connection
│   │   │
│   │   ├── 📁 config/             # Configuration
│   │   │   └── api.ts            # API endpoints
│   │   │
│   │   ├── 📁 pages/              # Page Components
│   │   │   └── ProfilePage.tsx   # Profile view
│   │   │
│   │   ├── App.tsx               # Main component
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Global styles
│   │
│   ├── package.json              # Node dependencies
│   ├── nginx.conf                # Nginx configuration
│   └── Dockerfile                # Frontend container
│
├── docker-compose.yml            # Container orchestration
└── README.md                     # This file
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login and get JWT |
| `GET` | `/api/auth/me` | Get current user info |

### Board Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/boards/` | List user's boards |
| `POST` | `/api/boards/` | Create new board |
| `GET` | `/api/boards/{id}` | Get board details |
| `PUT` | `/api/boards/{id}` | Update board |
| `DELETE` | `/api/boards/{id}` | Delete board |

### Collaboration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/boards/{id}/invite` | Invite user by email |
| `GET` | `/api/boards/{id}/members` | List board members |
| `DELETE` | `/api/boards/{id}/members/{user_id}` | Remove member |

### WebSocket Endpoint

```
WS /ws/{board_id}?token={jwt_token}
```

---

## 🔌 WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `cursor_move` | `{x, y}` | Update cursor position |
| `add_element` | `{element}` | Add new element |
| `update_element` | `{element}` | Update existing element |
| `delete_element` | `{elementId}` | Delete element |
| `chat_message` | `{text, userName}` | Send chat message |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `initial_state` | `{elements, cursors}` | Board state on connect |
| `user_joined` | `{userId, userName, userColor}` | New user connected |
| `user_left` | `{userId}` | User disconnected |
| `cursor_update` | `{userId, x, y}` | Cursor position update |
| `element_added` | `{element}` | New element from other user |
| `element_updated` | `{element}` | Element update |
| `element_deleted` | `{elementId}` | Element removed |
| `chat_message` | `{userId, userName, text}` | New chat message |

---

## 🗂️ State Management

### Zustand Stores

| Store | Purpose | Key State |
|-------|---------|-----------|
| **authStore** | Authentication | `token`, `userId`, `username` |
| **canvasStore** | Canvas elements | `elements[]`, CRUD methods |
| **drawingStore** | Tool settings | `currentTool`, `color`, `strokeWidth` |
| **userStore** | Online users | `users{}`, cursor positions |
| **chatStore** | Chat messages | `messages[]` |

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in `backend/`:

```env
# JWT Configuration
SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256

# Database
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=whiteboard
POSTGRES_USER=whiteboard
POSTGRES_PASSWORD=whiteboard

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend Environment

Create `.env` in `frontend/` (optional, for Docker):

```env
VITE_API_URL=/api
VITE_WS_URL=ws://localhost:3000/ws
```

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **WebSocket not connecting** | Check if backend is running, verify JWT token |
| **CORS errors** | Add frontend URL to `BACKEND_CORS_ORIGINS` |
| **Database connection failed** | Verify PostgreSQL is running, check credentials |
| **Drawing not syncing** | Check browser console for WebSocket errors |
| **Docker build fails** | Run `docker system prune` and retry |

### Logs

```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# All logs
docker-compose logs -f
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by [Miro](https://miro.com/)
- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI powered by [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

**Built with ❤️ for Real-Time Collaboration**

⭐ Star this repo if you find it useful!

</div>
