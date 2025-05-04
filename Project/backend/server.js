
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Import database initialization
const { initializeDatabase } = require('./db/init');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const labelRoutes = require('./routes/labels');
const timeRoutes = require('./routes/time-tracking');
const exportRoutes = require('./routes/export');
const importRoutes = require('./routes/import');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Get database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'taskflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

// Database connection
const db = new Client(dbConfig);

// Connect to database with error handling and retries
let connectionAttempts = 0;
const MAX_RETRIES = 3;

function connectToDatabase() {
  connectionAttempts++;
  
  console.log(`Attempt ${connectionAttempts} to connect to PostgreSQL database`);
  console.log('Database configuration:');
  console.log(`- Host: ${dbConfig.host}`);
  console.log(`- Database: ${dbConfig.database}`);
  console.log(`- User: ${dbConfig.user}`);
  console.log(`- Port: ${dbConfig.port}`);
  
  db.connect()
    .then(() => {
      console.log('Connected to PostgreSQL database successfully');
      
      // Test the connection with a simple query
      return db.query('SELECT NOW() as now');
    })
    .then(result => {
      console.log('Database connection test successful:', result.rows[0].now);
      
      // Initialize database after connecting
      return initializeDatabase(db);
    })
    .then(initialized => {
      console.log(initialized ? 'Database initialized successfully' : 'Database initialization skipped');
    })
    .catch(err => {
      console.error('Database connection or initialization error:', err);
      
      // Retry logic
      if (connectionAttempts < MAX_RETRIES) {
        console.log(`Retrying in 3 seconds...`);
        setTimeout(connectToDatabase, 3000);
      } else {
        console.error('Max connection attempts reached. Please check your database configuration.');
        console.error('Database connection parameters:');
        console.error(JSON.stringify(dbConfig, null, 2));
        process.exit(1);
      }
    });
}

// Start connection process
connectToDatabase();

// Make db available in the request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Generic error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/time-tracking', timeRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/import', importRoutes);

// Health check route with detailed information
app.get('/api/health', async (req, res) => {
  let dbConnected = false;
  let dbError = null;
  
  try {
    // Test DB connection
    const result = await db.query('SELECT NOW() as now');
    dbConnected = true;
  } catch (error) {
    dbError = error.message;
  }
  
  res.status(200).json({ 
    status: dbConnected ? 'ok' : 'error', 
    message: 'TaskFlow API is running',
    database: {
      connected: dbConnected,
      host: dbConfig.host,
      database: dbConfig.database,
      user: dbConfig.user,
      error: dbError
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});
