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

All of these were run against the server running on port 3000 (the default port).

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

## Reasoning Questions

### 1. Route order

I moved the whole 404 fallback (`app.use((req, res) => { ... })`) above the routes and ran
the server again. `/hello` and `/api/courses` now returned **404**, because Express checks
middleware and routes from top to bottom, and a fallback with no path matches every request,
so it answered first and the real routes never ran. Interestingly `/` and `/styles.css` still
worked (200), because `express.static` is registered before the place where I moved the
fallback, so the static files were found first. That is why the fallback must be the very
last thing before `app.listen`.

### 2. Middleware

I commented out `next()` in the logger and opened `/hello`. The server printed the log line
`[2026-11-16T09:52:13.797Z] GET /hello`, but nothing else happened: the browser kept loading
(the tab spinner never stopped) and `curl` waited until my 5 second timeout with no response.
The logger was the last thing that ran, and since it neither sent a response nor called
`next()`, the request was stuck there forever and the route never got the request.

### 3. Status codes

201 means "Created": the request worked **and** something new was made on the server (a new
subscription), which is more exact than a plain 200 "OK". A missing page must be a 404,
because the status code is what programs read, not the text. Browsers, `fetch` (`response.ok`),
search engines and monitoring tools would treat a 200 with an error message as a real, working
page, for example a search engine could index it.

### 4. Configuration

The port is decided by the place where the app runs, not by the code. A hosting service
(Render, Railway, Heroku, ...) gives the app a port in the `PORT` environment variable, and on my
own computer 3000 may already be used by another app (my Vite or React projects). With
`process.env.PORT || 3000` the same code works everywhere without editing it, and 3000 is only
the fallback for local development.

### 5. Dependencies

`node_modules` is very big, it is different for each operating system, and it can be
rebuilt exactly from `package.json` and `package-lock.json`, so committing it only makes the
repository heavy. A teammate must clone the repository, run `npm install` (or `npm ci` to get
exactly the versions in the lock file) in the project folder, and then `npm start`.

### 6. Same origin

When the page is opened through the server, a relative URL like `fetch('/api/courses')` goes to
the same server that sent the page. If I open `index.html` directly from disk
(`file:///.../public/index.html`), the relative URL becomes `file:///api/courses`, which does not
exist, so the buttons fail. Even with a full URL like `http://localhost:3000/api/courses`, a
page from `file://` has a different (`null`) origin, and the browser blocks reading the
response. This restriction is called the **Same-Origin Policy**, and the way a server can allow
other origins is **CORS** (which we were not allowed to use here, and do not need, because the
page and the API come from the same server).

## Self-Study Notes

- **Node version and running time** — the Node documentation for the global `process` object
  has `process.version` (a string like `"v24.21.0"`) and `process.uptime()` (seconds since the
  process started, as a decimal). I used both in `/api/status` and rounded the uptime with
  `Math.round()`.
- **Plain-text content type** — in the Express 5 docs, `res.type('text/plain')` sets the
  `Content-Type` header (Express adds `charset=utf-8`). I call it before `res.send()` in
  `/robots.txt`; without it, `res.send()` with a string would answer as `text/html`.
- **Pretty JSON in the page** — `JSON.stringify(value, null, 2)` (MDN): the third argument is the
  indentation. In `app.js` I read the body with `response.text()`, try `JSON.parse`, and if
  that works I show it with 2-space indentation; if it fails (HTML 404 page) I show the text
  as it is. Reading as text first means the page never crashes on a non-JSON body.
- **Path of `public/` from any folder** — `import.meta.dirname` (Node docs, ES modules) gives
  the folder of the current file, the ES-module replacement for `__dirname`. I join it with
  `'public'` for `express.static` and `res.sendFile`, so the server works when started from
  any folder.
- **Request headers** — `req.get('User-Agent')` from the Express docs reads a header without
  caring about upper or lower case.
- **The 404 fallback in Express 5** — the migration guide explains that `'*'` is no longer a valid
  path. `app.use()` with no path matches every request, so I used that as the last handler.

## Challenges

- My first test of the API routes returned 404 for everything. The cause was an older copy of
  the server still running on the same port, so I was testing the old code. After stopping it
  the routes worked. Now I always check that only one server is running.
- At first I was not sure where to put `express.static`. If it is after the routes, `/` would
  need its own route; if it is before, the static files are found first. I put it after the
  middleware (so static files are logged and counted) and before the routes.
- In `app.js` I first used `response.json()`, but the HTML 404 page made it throw. Reading with
  `response.text()` and then trying `JSON.parse` fixed that.
- Deciding what the counter should count: I documented my choice (everything) above.
