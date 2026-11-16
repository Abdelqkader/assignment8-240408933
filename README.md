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

## Testing Evidence (curl)

All of these were run with the server started by `npm start` on port 3000.

### 1. Successful JSON response

```text
$ curl --include http://localhost:3000/api/courses
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 201
ETag: W/"c9-z24NafDW+/bINpdsoBlFOe+q0pY"
Date: Mon, 16 Nov 2026 09:52:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Web Programming","credits":6},{"id":2,"title":"Operating Systems","credits":6},{"id":3,"title":"Database Management Systems","credits":5},{"id":4,"title":"Digital Logic","credits":5}]
```

### 2. The 201 response

```text
$ curl --include -X POST http://localhost:3000/api/subscribe
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-oWAPIqDXuocNexKhPYW9ayyk98c"
Date: Mon, 16 Nov 2026 09:52:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```

### 3. The 403 response

```text
$ curl --include http://localhost:3000/api/admin
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-TLNzmZqKxaTuFdX/dVWWPBu44/c"
Date: Mon, 16 Nov 2026 09:52:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}
```

### 4. The redirect

```text
$ curl --include http://localhost:3000/old-page
HTTP/1.1 302 Found
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 28
Date: Mon, 16 Nov 2026 09:52:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Found. Redirecting to /hello
```

### 5. 404 on an /api path

```text
$ curl --include http://localhost:3000/api/nothing-here
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Mon, 16 Nov 2026 09:52:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

### 6. 404 on a non-API path

```text
$ curl --include http://localhost:3000/missing-page
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 77
ETag: W/"4d-BYAjNI8HpWWTKDOPpdge/k3bTSw"
Date: Mon, 16 Nov 2026 09:52:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<h1>404 - Page not found</h1><p>Go back to <a href="/">the home page</a>.</p>
```

### 7. Plain-text content type (robots.txt)

```text
$ curl --include http://localhost:3000/robots.txt
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 30
ETag: W/"1e-fz6IoKfWOEcSop5pxzp50fKiI7Q"
Date: Mon, 16 Nov 2026 09:52:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

User-agent: *
Disallow: /api/
```

### 8. Real values from the process (/api/status)

```text
$ curl --include http://localhost:3000/api/status
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-vX+Og1YZP1fXNYBWYUuwS7XmF2M"
Date: Mon, 16 Nov 2026 09:52:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"status":"ok","nodeVersion":"v24.21.0","uptimeSeconds":30}
```
