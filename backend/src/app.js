const express = require('express');
const cors = require('cors');
const todoRoutes = require('./routes/todos');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

// Health check endpoint – used by ECS/ALB
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/todos', todoRoutes);

module.exports = app;
