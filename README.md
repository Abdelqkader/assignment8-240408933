# Assignment 8 - My First Express Server

A small back-end made with Node.js and Express 5. It has a few text and JSON routes,
a redirect, a 404 fallback, two middleware functions (a request logger and a request
counter), and a browser page in `public/` that calls every API route with `fetch()`.

## How to run

You need Node.js (current LTS, I used v24) and npm.

```bash
git clone https://github.com/Abdelqkader/assignment8-240408933.git
cd assignment8-240408933
npm install
npm start
```

Then open http://localhost:3000.

- `npm start` runs `node server.js`.
- `npm run dev` runs `node --watch server.js`, which restarts the server when a file changes
  (built into Node, so no nodemon).
- To use another port: `PORT=4000 npm start`.

The server can be started from any folder, for example `node path/to/server.js`, because the
`public/` folder is found from the location of `server.js` and not from the current folder.

## File Organization

```
/assignment8
 ├─ public/
 │   ├─ index.html     the page: a short intro, one button per API route, a <pre> for the result
 │   ├─ styles.css     all the styles (no inline styles)
 │   └─ app.js         calls the routes with fetch() and shows the status and body
 ├─ server.js          the Express app: data, middleware, static files, routes, 404 fallback
 ├─ package.json       "type": "module", express in dependencies, start and dev scripts
 ├─ package-lock.json
 ├─ .gitignore         node_modules/ and .env
 └─ README.md
```

The order inside `server.js` is: data constants → logger → counter → `express.static` →
routes → 404 fallback → `app.listen`.

### Routes

| Method and path       | Response                                                     | Status |
| --------------------- | ------------------------------------------------------------ | ------ |
| `GET /`               | `public/index.html`                                          | 200    |
| `GET /hello`          | Text: `Hello from Abdulkader's server`                       | 200    |
| `GET /robots.txt`     | Plain text, `Content-Type: text/plain`                       | 200    |
| `GET /old-page`       | Redirect to `/hello`                                         | 302    |
| `GET /api/courses`    | JSON array of 4 courses with `id`, `title`, `credits`        | 200    |
| `GET /api/status`     | `{ status, nodeVersion, uptimeSeconds }` from `process`      | 200    |
| `GET /api/headers`    | `{ userAgent, accept }` copied from the request headers      | 200    |
| `POST /api/subscribe` | `{ "subscribed": true }`                                     | 201    |
| `GET /api/admin`      | `{ "error": "Forbidden" }`                                   | 403    |
| `GET /api/stats`      | `{ "requestsServed": <number> }`                             | 200    |
| anything else         | `/api/...` → `{ "error": "Not found" }`, other paths → HTML  | 404    |

### Middleware and what is counted

Both middleware functions are registered with `app.use()` at the top, before
`express.static` and before every route, and both call `next()`.

- **Logger** prints one line per request: `[2026-11-16T09:51:06.177Z] GET /hello`.
  It is first so that every request is logged, even the ones that end in a 404.
- **Counter** adds 1 to `requestsServed` for every request. Because it runs before the static
  files and the routes, it counts **everything**: the page itself, `styles.css`, `app.js`,
  every API call, and the 404s. The `/api/stats` request also counts itself, because the
  counter runs before the route that reads the number. I chose this because the name is
  "requests served" and the server really did answer all of them, including the 404s.
  If I wanted to count only API calls, I would register the counter with
  `app.use('/api', requestCounter)` or move it below `express.static`.
