
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
    console.log('Database configuration:');
    console.log(`- Host: ${process.env.DB_HOST}`);
    console.log(`- Database: ${process.env.DB_NAME}`);
    console.log(`- User: ${process.env.DB_USER}`);
    console.log(`- Port: ${process.env.DB_PORT}`);
  })
  .catch(err => console.error('Database connection error:', err));

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
