const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

// The production app serves the frontend and API from one origin, so it does
// not need CORS. Keep CORS available for an explicitly configured split-host
// deployment and local development without opening the API to every origin.
if (env.CLIENT_ORIGIN) {
  app.use(
    cors({
      origin: (origin, cb) => {
        const allowed = [env.CLIENT_ORIGIN, 'http://localhost:5308', 'http://127.0.0.1:5308'];
        if (!origin || allowed.includes(origin)) return cb(null, true);
        cb(new Error('Origin not allowed by CORS'));
      },
    })
  );
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'pantrypal-api' }));

app.use('/api', require('./routes/api.routes'));

if (env.NODE_ENV === 'production') {
  const frontendDist = path.resolve(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
