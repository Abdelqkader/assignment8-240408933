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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
