import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
