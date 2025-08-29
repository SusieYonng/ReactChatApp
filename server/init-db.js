import { pool, initializeDatabase, testConnection } from './database.js';
import { config } from './config.js';

async function main() {
  try {
    console.log('Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Failed to connect to database. Please check your configuration.');
      console.log('Current config:', config.database);
      process.exit(1);
    }
    
    console.log('Database connection successful!');
    console.log('Initializing database tables...');
    
    await initializeDatabase();
    
    console.log('Database initialization completed successfully!');
    console.log('You can now start the server with: npm start');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
