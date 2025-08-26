# React Chat App

A real-time chat application built with React, Node.js, WebSocket, and PostgreSQL.

## Features

- **Real-time messaging** using WebSocket connections
- **Persistent data storage** with PostgreSQL database
- **User authentication** and session management
- **Friend management** with friend requests
- **Unread message tracking**
- **Responsive design** for mobile and desktop

## Architecture

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Real-time**: WebSocket for instant message delivery
- **Database**: PostgreSQL for persistent storage
- **Authentication**: Cookie-based sessions

## Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Docker (optional, for running PostgreSQL)

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Start the application:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api/v1

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **In another terminal, start the frontend:**
   ```bash
   npm run dev
   ```

## Environment Configuration

The application uses in-memory storage for development. For production with PostgreSQL, create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
```

## API Endpoints

- `GET /api/v1/messages/conversations` - Get user conversations
- `POST /api/v1/messages/private` - Send private message
- `GET /api/v1/messages/private/:username` - Get private messages with user
- `GET /api/v1/messages/unread-overview` - Get unread message overview
- `POST /api/v1/messages/mark-read` - Mark messages as read
- `GET /health` - Health check endpoint

## WebSocket Events

- `connection` - Connection confirmation
- `new_message` - New message notification
- `friend_request` - Friend request notification
- `friend_request_response` - Friend request response notification

## Development

- **Server development mode:** `npm run dev:server`
- **Frontend development mode:** `npm run dev`
- **Build frontend:** `npm run build`
- **Preview build:** `npm run preview`

## Data Storage

The application uses in-memory storage with the following data structures:

- `users` - User accounts and profiles
- `sessions` - User session management
- `messages` - Chat messages
- `message_read_status` - Message read tracking
- `friends` - Friend relationships and requests

**Note**: All data is stored in memory and will be lost when the server restarts.

## Real-time Features

- **Instant messaging** - Messages are delivered in real-time via WebSocket
- **Fallback polling** - Automatic fallback to HTTP polling if WebSocket is unavailable
- **Connection status** - Visual indicators show WebSocket connection status
- **Automatic reconnection** - WebSocket automatically reconnects on connection loss

## Performance Improvements

- **Eliminated polling** - No more 5-10 second delays for new messages
- **In-memory storage** - Fast access to messages and user data
- **Real-time messaging** - Instant message delivery via WebSocket
- **Graceful degradation** - Falls back to polling when WebSocket unavailable

## Troubleshooting

### WebSocket Connection Issues

1. Check browser console for WebSocket errors
2. Verify server is running on correct port
3. Check firewall settings
4. Application will automatically fall back to polling

### Port Conflicts

- Default server port: 3000
- Update port in environment variables if needed

## License

MIT
