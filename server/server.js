import express from 'express';
import cookieParser from 'cookie-parser';
import http from 'http';
import process from 'process';
import routes from './routes.js';
import { WebSocketManager } from './websocket.js';
import { config } from './config.js';

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
const wsManager = new WebSocketManager(server);

// Make WebSocket manager available to routes
app.set('wsManager', wsManager);

// CORS middleware with environment-specific configuration
app.use((req, res, next) => {
  if (config.isDev) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (req.headers.origin) {
    // In production, use the request origin
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(express.static('dist')); // serve Vite static build

app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    const wsConnected = wsManager.getConnectedUsersCount();
    
    res.json({
      status: 'ok',
      database: 'not_configured',
      websocket: {
        connected_users: wsConnected,
        status: 'running'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Start server
function startServer() {
  try {
    server.listen(config.port, () => {
      console.log(`🚀 Server is running on http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`🔌 WebSocket server is ready`);
      console.log(`💾 Using in-memory storage (data will be lost on restart)`);
      console.log(`🔒 CORS: ${config.isDev ? 'enabled for all origins' : 'using request origin'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});