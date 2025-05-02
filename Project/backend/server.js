
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

// Database connection
const db = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Connect to database
db.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    initializeDatabase();
  })
  .catch(err => console.error('Database connection error:', err));

// Function to initialize database tables if they don't exist
async function initializeDatabase() {
  try {
    // Check if tables exist
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.log('Creating database tables...');
      const initSqlPath = path.join(__dirname, 'db', 'init.sql');
      
      if (fs.existsSync(initSqlPath)) {
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        await db.query(initSql);
        console.log('Database tables created successfully');
      } else {
        console.error('init.sql file not found');
      }
    } else {
      console.log('Database tables already exist');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Check if necessary tables exist
async function checkTablesExist() {
  try {
    const result = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    return false;
  }
}

// Make db available in the request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/time-tracking', timeRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/import', importRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TaskFlow API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
