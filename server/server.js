import express from 'express';
import cookieParser from 'cookie-parser';
import http from 'http';
import process from 'process';
import routes from './routes.js';
import { WebSocketManager } from './websocket.js';
import { config } from './config.js';
import { initializeDatabase, testConnection, closePool } from './database.js';

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
app.get('/health', async (req, res) => {
  try {
    const wsConnected = wsManager.getConnectedUsersCount();
    const dbConnected = await testConnection();
    
    res.json({
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
      websocket: {
        connected_users: wsConnected,
        status: 'running'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    server.listen(config.port, () => {
      console.log(`🚀 Server is running on http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`🔌 WebSocket server is ready`);
      console.log(`💾 Using PostgreSQL for storage`);
      console.log(`🔒 CORS: ${config.isDev ? 'enabled for all origins' : 'using request origin'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
async function gracefulShutdown() {
  console.log('🛑 Received shutdown signal, shutting down gracefully');
  server.close(async () => {
    console.log('✅ HTTP server closed');
    await closePool();
    console.log('✅ Database pool closed');
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
