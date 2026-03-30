const express = require('express');
const cors = require('cors');
const client = require('prom-client');
const todoRoutes = require('./routes/todos');

const app = express();

client.collectDefaultMetrics();

let httpRequestCounter = client.register.getSingleMetric('http_requests_total');

if (!httpRequestCounter) {
  httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status']
  });
}

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });
  });
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));

app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Routes
app.use('/api/todos', todoRoutes);

module.exports = app;