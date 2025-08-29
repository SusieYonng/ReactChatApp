import dotenv from "dotenv";
import process from "process";

// Load environment variables
dotenv.config();

// Server configuration
export const config = {
  // Environment
  env: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") !== "production",

  // Server
  port: process.env.PORT || 3000,
  host: process.env.HOST || "localhost",

  // WebSocket
  websocket: {
    path: process.env.WS_PATH || "/ws",
    pingInterval: parseInt(process.env.WS_PING_INTERVAL || "30000", 10),
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || "5000", 10),
  },

  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "chatapp",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  },
};
