
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function initializeDatabase(existingClient = null) {
  // Use provided client or create a new one
  const client = existingClient || new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    // Only connect if we're not using an existing client
    if (!existingClient) {
      await client.connect();
      console.log('Connected to database for initialization');
    }

    // Check if tables already exist
    const tableCheckQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `;
    
    const tableResult = await client.query(tableCheckQuery);
    
    if (tableResult.rows.length > 0) {
      console.log('Tables already exist in the database. Skipping initialization.');
      return true;
    }

    // If tables don't exist, read SQL file and create them
    console.log('No existing tables found. Creating database schema...');
    const sqlFilePath = path.join(__dirname, 'init.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('SQL initialization file not found at:', sqlFilePath);
      return false;
    }
    
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute SQL commands
    await client.query(sql);
    console.log('Database schema created successfully');

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  } finally {
    // Only close if we created a new client
    if (!existingClient && client) {
      await client.end();
      console.log('Database initialization connection closed');
    }
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
