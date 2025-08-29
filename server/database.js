import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

// Create connection pool
export const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    try {
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          nickname VARCHAR(100),
          avatar TEXT,
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create sessions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          sid VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        )
      `);

      // Create messages table
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          from_user VARCHAR(50) NOT NULL,
          to_user VARCHAR(50) NOT NULL,
          text TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (from_user) REFERENCES users(username) ON DELETE CASCADE,
          FOREIGN KEY (to_user) REFERENCES users(username) ON DELETE CASCADE
        )
      `);

      // Create message_read_status table
      await client.query(`
        CREATE TABLE IF NOT EXISTS message_read_status (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL,
          contact_id VARCHAR(50) NOT NULL,
          last_read_time TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(username) ON DELETE CASCADE,
          FOREIGN KEY (contact_id) REFERENCES users(username) ON DELETE CASCADE,
          UNIQUE(user_id, contact_id)
        )
      `);

      // Create friends table
      await client.query(`
        CREATE TABLE IF NOT EXISTS friends (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL,
          friend_id VARCHAR(50) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(username) ON DELETE CASCADE,
          FOREIGN KEY (friend_id) REFERENCES users(username) ON DELETE CASCADE,
          UNIQUE(user_id, friend_id)
        )
      `);

      // Create a function to update the updated_at column
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Drop existing trigger if it exists, to ensure idempotency
      await client.query(`
        DROP TRIGGER IF EXISTS update_message_read_status_updated_at ON message_read_status;
      `);
      
      // Add a trigger to the message_read_status table
      await client.query(`
        CREATE TRIGGER update_message_read_status_updated_at
        BEFORE UPDATE ON message_read_status
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);

      console.log('Database tables initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closePool() {
  await pool.end();
}
