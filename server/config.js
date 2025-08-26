import dotenv from 'dotenv';
import process from 'process';

// Load environment variables
dotenv.config();

// Server configuration
export const config = {
    // Environment
    env: process.env.NODE_ENV || 'development',
    isDev: (process.env.NODE_ENV || 'development') !== 'production',
    
    // Server
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    
    // WebSocket
    websocket: {
        path: process.env.WS_PATH || '/ws',
        pingInterval: parseInt(process.env.WS_PING_INTERVAL || '30000', 10),
        pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '5000', 10)
    }
};
