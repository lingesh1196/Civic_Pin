require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { connectDB, getIsMongoConnected } = require('./config/db');
const { initStore } = require('./data/store');

const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (_req, res) => {
  res.json({
    service: 'CivicPin API',
    status: 'running',
    database: getIsMongoConnected() ? 'mongodb' : 'local-json (server/data/db.json)',
    endpoints: {
      health: '/api/health',
      issues: '/api/issues',
      stats: '/api/stats',
      auth: '/api/auth/login',
    },
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CivicPin API',
    database: getIsMongoConnected() ? 'mongodb' : 'local-json',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/stats', statsRoutes);

// Error handler for Multer / unexpected errors
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message);
  res.status(400).json({ error: err.message || 'Request failed.' });
});

async function start() {
  await connectDB();
  await initStore();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CivicPin Server] Running on http://0.0.0.0:${PORT}`);
  });
}

start();
