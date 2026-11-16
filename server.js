import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Data ----------

const COURSES = [
  { id: 1, title: 'Web Programming', credits: 6 },
  { id: 2, title: 'Operating Systems', credits: 6 },
  { id: 3, title: 'Database Management Systems', credits: 5 },
  { id: 4, title: 'Digital Logic', credits: 5 },
];

// ---------- Middleware ----------
// Registered before the static files and the routes, so every request
// passes through them first.

function requestLogger(req, res, next) {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.originalUrl}`);
  next();
}

// Counts every request that reaches the server: pages, static files,
// API calls and 404s. The /api/stats request itself is counted too,
// because the counter runs before the route that reads it.
let requestsServed = 0;

function requestCounter(req, res, next) {
  requestsServed += 1;
  next();
}

app.use(requestLogger);
app.use(requestCounter);

// ---------- Routes ----------

app.get('/hello', (req, res) => {
  res.send("Hello from Abdulkader's server");
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /api/\n');
});

app.get('/old-page', (req, res) => {
  res.redirect('/hello');
});

app.get('/api/courses', (req, res) => {
  res.json(COURSES);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    nodeVersion: process.version,
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.get('/api/headers', (req, res) => {
  res.json({
    userAgent: req.get('User-Agent') ?? null,
    accept: req.get('Accept') ?? null,
  });
});

app.post('/api/subscribe', (req, res) => {
  res.status(201).json({ subscribed: true });
});

app.get('/api/admin', (req, res) => {
  res.status(403).json({ error: 'Forbidden' });
});

app.get('/api/stats', (req, res) => {
  res.json({ requestsServed });
});

// ---------- 404 fallback ----------
// Registered with app.use() AFTER every route, so it only runs when
// nothing above sent a response. No path pattern means "match anything"
// (Express 5 no longer accepts the old app.get('*') style).

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.status(404).send('<h1>404 - Page not found</h1><p>Go back to <a href="/">the home page</a>.</p>');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
