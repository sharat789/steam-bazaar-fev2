# Stream Bazaar

A live streaming e-commerce platform that enables creators to broadcast live video sessions while showcasing and selling products in real-time.

## Overview

Stream Bazaar combines live video streaming with e-commerce, allowing creators to engage with viewers through real-time chat while showcasing products during live sessions. Built with modern web technologies and optimized for scalable, interactive experiences.

## Tech Stack

- **Frontend Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Video Streaming:** Agora RTC SDK (WebRTC)
- **Real-time Chat:** Socket.IO Client
- **HTTP Client:** Axios

## Key Features

- **User Authentication:** JWT-based auth with role-based access (creators & viewers)
- **Live Streaming:** Real-time video broadcasting using Agora WebRTC
- **Product Management:** Full CRUD operations for product catalogs
- **Session Management:** Create, schedule, and control live streaming sessions
- **Real-time Chat:** Live chat with viewer count and message history
- **Creator Dashboard:** Session controls with start/pause/resume/end streaming
- **Viewer Experience:** Browse live streams, watch sessions, and interact via chat

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Backend API running on `http://localhost:3000`
- Agora account with App ID and Certificate ([console.agora.io](https://console.agora.io/))

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
   WEBSOCKET_URL=ws://localhost:3000
   ```

### Development

Run the development server (default port 3001):

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Run production build:

```bash
pnpm start
```

Lint code:

```bash
pnpm lint
```

## Project Structure

```
app/                        # Next.js App Router pages
├── page.tsx               # Homepage (browse live streams)
├── login/                 # Authentication pages
├── register/
├── profile/
├── watch/[sessionId]/    # Viewer watch page
└── creator/[username]/   # Creator dashboard
    ├── products/         # Product management
    └── sessions/         # Session management & controls

src/
├── components/           # Reusable React components
├── contexts/            # React Context (auth)
├── hooks/               # Custom hooks (Agora, WebSocket)
├── lib/                 # API clients & utilities
├── services/            # API service layer
└── types/               # TypeScript type definitions
```

## Architecture Highlights

### Live Streaming Flow

**Creator (Publisher):**

1. Start stream → Request Agora token from backend
2. Join Agora channel as `host` role
3. Publish camera/microphone tracks
4. Display local video preview

**Viewer (Subscriber):**

1. Join session → Request Agora token from backend
2. Join Agora channel as `audience` role
3. Subscribe to creator's video/audio tracks
4. Display remote video stream

### Real-time Chat

- Socket.IO WebSocket connection with auto-reconnect
- Room-based messaging per session
- Backend automatically determines role (publisher vs subscriber)
- Viewer count tracking and real-time updates

### Authentication

- JWT tokens stored in localStorage
- Auto-refresh on app load
- Request interceptor adds Bearer token to all API calls
- Automatic logout on 401 responses

## API Integration

The frontend communicates with a REST API backend. See `AVAILABLE_API_ROUTES.MD` for complete API documentation.

**Base URL:** `http://localhost:3000/api`

**Key Endpoints:**

- `/auth/login`, `/auth/register` - Authentication
- `/sessions` - Session CRUD
- `/sessions/:id/start-stream` - Get publisher token
- `/sessions/:id/stream-token` - Get viewer token
- `/products` - Product management
- `/users/live` - Get live streaming creators
